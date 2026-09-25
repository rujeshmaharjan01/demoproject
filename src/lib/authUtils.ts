// lib/auth-utils.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// For protected routes (dashboard, home, etc.)
export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login"); // ✅ only redirect when NOT logged in
  }

  return session;
};
