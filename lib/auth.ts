import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type LoginState = {
  error?: string;
} | null;

const getSecretKey = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
};

export const hasAuthConfig = () =>
  Boolean(
    process.env.AUTH_EMAIL &&
    process.env.AUTH_PASSWORD &&
    process.env.AUTH_SECRET,
  );

export const createSessionToken = async (): Promise<string | null> => {
  const key = getSecretKey();
  if (!key) return null;

  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key);
};

export const verifySessionToken = async (
  token: string | undefined,
): Promise<boolean> => {
  if (!token) return false;
  const key = getSecretKey();
  if (!key) return false;

  try {
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
};
