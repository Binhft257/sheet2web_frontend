"use client";

import { apiClient } from "@/src/lib/api";
import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function AuthExpiredHandler() {
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status ===
            401 &&
          !isSigningOutRef.current
        ) {
          isSigningOutRef.current = true;
          await signOut({ callbackUrl: "/sign-in" });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, []);

  return null;
}
