import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "compliance_session";
const MAX_AGE = 60 * 60 * 24 * 7;

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is required");
  return value;
}

function sign(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export async function getSessionUserId() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const [userId, expRaw, sig] = token.split(".");
  if (!userId || !expRaw || !sig) return null;
  if (Number(expRaw) < Math.floor(Date.now() / 1000)) return null;
  const payload = `${userId}.${expRaw}`;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return userId;
}
