import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// ─── Constants ──────────────────────────────────────────────

const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = "elevateher_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// ─── Types ──────────────────────────────────────────────────

interface SessionPayload {
  userId: string;
  exp: number; // Unix timestamp in milliseconds
}

export interface Session {
  userId: string;
}

// ─── Password Utilities ─────────────────────────────────────

/**
 * Hash a plaintext password using bcrypt.
 * Returns the hashed string suitable for storage.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 * Returns true if the password matches, false otherwise.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Session Management ─────────────────────────────────────

/**
 * Create a new session for the given user by setting an HTTP-only cookie.
 * The token is a base64-encoded JSON payload containing the userId and
 * an expiration timestamp.
 */
export async function createSession(userId: string): Promise<void> {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;

  const payload: SessionPayload = { userId, exp };
  const token = Buffer.from(JSON.stringify(payload)).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Read the current session from the cookie.
 * Returns the session object with { userId } if valid, or null if
 * no cookie exists, the token is malformed, or the session has expired.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const payload: SessionPayload = JSON.parse(decoded);

    // Validate payload shape
    if (!payload.userId || typeof payload.userId !== "string") {
      return null;
    }

    if (!payload.exp || typeof payload.exp !== "number") {
      return null;
    }

    // Check expiration
    if (Date.now() > payload.exp) {
      // Session expired; clear the stale cookie
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    return { userId: payload.userId };
  } catch {
    // Malformed token; clear it
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }
}

/**
 * Require an authenticated session. Returns the session if valid.
 * Throws an error if the user is not authenticated, which can be
 * caught by error boundaries or middleware to redirect to login.
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

/**
 * Destroy the current session by removing the session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
