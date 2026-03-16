import {authService} from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";

export async function getFeatureFlagValue(flagName: string): Promise<boolean> {
  try {
    const url = `${getApiBaseUrl()}/dashboard/featureFlag/getFeatureFlagByName`;

    const response = await authService.authenticatedFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: flagName }),
    });

    const json = await response.json();

    if (!json.success) return false;

    return String(json.data.value).toLowerCase() === "true";
  } catch (error) {
    console.error("Feature flag fetch failed:", error);
    return false;
  }
}
