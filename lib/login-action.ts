"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  type LoginState,
  createSessionToken,
  hasAuthConfig,
} from "@/lib/auth";

const safeEqual = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
};

const credentialsMatch = (email: string, password: string): boolean => {
  const expectedEmail = process.env.AUTH_EMAIL;
  const expectedPassword = process.env.AUTH_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;

  const emailOk = safeEqual(
    email.trim().toLowerCase(),
    expectedEmail.trim().toLowerCase(),
  );
  const passwordOk = safeEqual(password, expectedPassword);
  return emailOk && passwordOk;
};

export const loginAction = async (
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> => {
  if (!hasAuthConfig()) {
    return { error: "Authentication is not configured." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!credentialsMatch(email, password)) {
    return { error: "Invalid email or password" };
  }

  const token = await createSessionToken();
  if (!token) {
    return { error: "Authentication is not configured." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/");
};
