"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Menu, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, useCallback } from "react";
import { authService } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User as UserType } from "@/lib/Types";
import { ThemeToggle } from "@/components/theme-toggle";
import { ServerBadge } from "@/components/server-toggle";
const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, isAuthenticated]);

  const scroll = (direction: "left" | "right") => {
    navRef.current?.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  };

  // Check authentication status on mount and pathname changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = authService.isAuthenticated();
      const user = authService.getCurrentUser();

      setIsAuthenticated(authStatus);
      setCurrentUser(user);
    };

    // Check immediately
    checkAuthStatus();

    const handlePathnameChange = () => {
      // Small delay to ensure localStorage is updated after redirect
      setTimeout(checkAuthStatus, 100);
    };

    handlePathnameChange();
  }, [pathname]); // Re-run when pathname changes

  // Alternative: Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const authStatus = authService.isAuthenticated();
      const user = authService.getCurrentUser();

      setIsAuthenticated(authStatus);
      setCurrentUser(user);
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event for same-tab updates (you can dispatch this after login/logout)
    window.addEventListener("authStateChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleStorageChange);
    };
  }, []);

  const isAdmin = currentUser?.role === "admin";

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    authService.logout();
    setIsProfileDialogOpen(false);
    router.push("/sign-in");
    router.refresh();
  };

  const routes = [
    {
      href: `/dashboard`,
      label: `Dashboard`,
      active: pathname === `/dashboard`,
    },
    {
      href: `/characters`,
      label: `Characters`,
      active: pathname === `/characters`,
    },
    {
      href: `/buildings`,
      label: `Buildings`,
      active: pathname === `/buildings`,
    },
    {
      href: `/inventory`,
      label: `Inventory`,
      active: pathname === `/inventory`,
    },
    {
      href: `/global-config`,
      label: `Global Config`,
      active: pathname === `/global-config`,
    },
    isAdmin && {
      href: `/developers`,
      label: "Developers",
      active: pathname === "/developers",
    },
    isAdmin && {
      href: `/whitelist`,
      label: "Whitelist",
      active: pathname === "/whitelist",
    },
    {
      href: `/feature-flags`,
      label: "Feature Flags",
      active: pathname === "/feature-flags",
    },
    (isAdmin || currentUser?.role === "developer") && {
      href: `/queries`,
      label: "Queries",
      active: pathname === "/queries",
    },
    {
      href: `/builds`,
      label: "Builds",
      active: pathname === "/builds",
    },
    {
      href: `/clientBuilds`,
      label: "Client Builds",
      active: pathname === "/clientBuilds",
    },
    {
      href: `/system-design`,
      label: "Architecture",
      active: pathname === "/system-design",
    },
    {
      href: `/excalidraw`,
      label: "Excalidraw",
      active: pathname === "/excalidraw" || pathname.startsWith("/excalidraw/"),
    },
  ];

  return (
    <>
      {isAuthenticated && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="flex h-16 items-center px-4 w-[90%] mx-auto">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="font-bold text-xl">
                Home
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center flex-1 min-w-0 mx-4 relative">
              {canScrollLeft && (
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-background/95 to-transparent"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <nav
                ref={navRef}
                className="flex items-center gap-1 overflow-x-auto scrollbar-none whitespace-nowrap px-6"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {routes
                  .filter(
                    (r): r is { href: string; label: string; active: boolean } =>
                      Boolean(r),
                  )
                  .map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md shrink-0",
                        route.active
                          ? "text-foreground bg-muted"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {route.label}
                    </Link>
                  ))}
              </nav>
              {canScrollRight && (
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-background/95 to-transparent"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Right side items */}
            <div className="ml-auto flex items-center space-x-4">
              {/* Server Toggle */}
              <ServerBadge />
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Profile Dialog Trigger */}
              <Dialog
                open={isProfileDialogOpen}
                onOpenChange={setIsProfileDialogOpen}
              >
                <DialogTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-lg overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                    <DialogDescription>
                      {currentUser?.email} •{" "}
                      {currentUser?.role &&
                        currentUser.role.charAt(0).toUpperCase() +
                          currentUser.role.slice(1)}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${
                          currentUser?.role === "admin"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        } text-white`}
                      >
                        {currentUser?.role?.toUpperCase()}
                      </Badge>
                      {currentUser?.profileComplete && (
                        <Badge variant="secondary">Profile Complete</Badge>
                      )}
                    </div>

                    {/* User Profile Information */}
                    {currentUser?.profile && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentUser.profile.name && (
                              <div>
                                <Label className="text-sm font-medium">
                                  Name
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {currentUser.profile.name}
                                </p>
                              </div>
                            )}
                            {currentUser.profile.role && (
                              <div>
                                <Label className="text-sm font-medium">
                                  Role
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {currentUser.profile.role}
                                </p>
                              </div>
                            )}
                            {currentUser.profile.permissions && (
                              <div>
                                <Label className="text-sm font-medium">
                                  Permissions
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {currentUser.profile.permissions}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Logout Button */}
                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-background/95 backdrop-blur">
              <nav className="flex flex-col space-y-1 px-4 py-2">
                {routes
                  .filter(
                    (
                      r,
                    ): r is { href: string; label: string; active: boolean } =>
                      Boolean(r),
                  )
                  .map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary px-3 py-3 rounded-md",
                        route.active
                          ? "text-foreground bg-muted"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ))}
              </nav>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
