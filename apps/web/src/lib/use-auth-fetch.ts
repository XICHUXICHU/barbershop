"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function useAuthFetch() {
  const { getToken } = useAuth();

  const authFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await getToken();
      return fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init?.headers,
        },
      });
    },
    [getToken],
  );

  return authFetch;
}
