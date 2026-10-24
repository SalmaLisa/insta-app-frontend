"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (cancelled) return;

        const loggedIn = response.ok;

        setAuthenticated(loggedIn);

        if (!loggedIn && !isAuthPage) {
          router.replace("/login");
          return;
        }

        if (loggedIn && isAuthPage) {
          router.replace("/");
          return;
        }

        setChecking(false);
      } catch {
        if (cancelled) return;

        setAuthenticated(false);

        if (!isAuthPage) {
          router.replace("/login");
          return;
        }

        setChecking(false);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, isAuthPage]);

  if (checking) {
    return <p>Checking your session...</p>;
  }

  if (!authenticated && !isAuthPage) return null;
  if (authenticated && isAuthPage) return null;

  return <>{children}</>;
}