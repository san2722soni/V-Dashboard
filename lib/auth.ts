import type {
  User,
  AuthTokens,
  LoginResponse,
  VerifyOtpResponse,
} from "./Types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class AuthService {
  private readonly ACCESS_TOKEN_KEY = "accessToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";
  private readonly USER_KEY = "user";

  // Lock to prevent multiple refresh calls
  private refreshPromise: Promise<string | null> | null = null;

  /* -----------------------------------------------------
      OTP + VERIFY (unchanged)
  ------------------------------------------------------ */

  async sendOtp(email: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/developer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Failed to send OTP");
    }

    return data;
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/developer/verifyDeveloper`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) throw new Error("Invalid OTP or email");
    const data = await response.json();

    this.setTokens(data);
    this.setUser(this.decodeToken(data.accessToken));

    return data;
  }

  /* -----------------------------------------------------
      🔥 Optimized Refresh — Single-Flight Design
  ------------------------------------------------------ */

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    const accessToken = this.getAccessToken();

    if (!refreshToken || !accessToken) return null;

    // Avoid multiple refresh calls at once
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create refresh operation
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh/newToken`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            refreshToken,
          }),
        });

        if (!response.ok) throw new Error("Refresh failed");

        const data = await response.json();

        // Save rotated tokens if provided
        this.setAccessToken(data.accessToken);
        if (data.refreshToken) {
          this.setRefreshToken(data.refreshToken);
        }

        // Update user data
        this.setUser(this.decodeToken(data.accessToken));

        return data.accessToken;
      } catch (err) {
        this.logout();
        return null;
      } finally {
        this.refreshPromise = null; // release lock
      }
    })();

    return this.refreshPromise;
  }

  /* -----------------------------------------------------
      Decode Token
  ------------------------------------------------------ */
  private decodeToken(token: string): User {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      return {
        id: payload.developerId,
        email: payload.email || "",
        role: payload.isAdmin ? "admin" : "developer",
        profileComplete: payload.profile?.isComplete || false,
        profile: payload.profile,
      };
    } catch {
      throw new Error("Invalid token");
    }
  }

  /* -----------------------------------------------------
      Storage Helpers
  ------------------------------------------------------ */

  private setTokens(tokens: AuthTokens) {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  private setAccessToken(token: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  private setRefreshToken(token: string) {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private setUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.reload();
  }

  /* -----------------------------------------------------
      🔥 Improved authenticatedFetch()
      - Auto refresh
      - No double refresh
      - Cleaner errors
  ------------------------------------------------------ */
  async authenticatedFetch(url: string, options: RequestInit = {}) {
    let token = this.getAccessToken();

    if (!token) throw new Error("Not authenticated");

    // 1st attempt
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    // Token expired? Try refresh
    if (response.status === 401) {
      token = await this.refreshToken();
      if (!token) throw new Error("Unable to refresh token");

      // Retry request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return response;
  }
}

export const authService = new AuthService();
