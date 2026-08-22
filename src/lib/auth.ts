import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "compliance_session";
const MAX_AGE = 60 * 60 * 24 * 7;
const RESET_MAX_AGE = 60 * 30;

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
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return value;
}

function passwordVersion(passwordHash: string) {
  return crypto.createHmac("sha256", secret()).update(passwordHash).digest("hex").slice(0, 24);
}

function sessionToken(userId: string, passwordHash: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const version = passwordVersion(passwordHash);
  const payload = `${userId}.${exp}.${version}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function createPasswordResetToken(userId: string, passwordHash: string) {
  const exp = Math.floor(Date.now() / 1000) + RESET_MAX_AGE;
  const version = crypto.createHash("sha256").update(passwordHash).digest("hex").slice(0, 24);
  const payload = `${userId}.${exp}.${version}`;
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyPasswordResetToken(token: string, passwordHash: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let decoded = "";
  try { decoded = Buffer.from(encoded, "base64url").toString("utf8"); } catch { return null; }
  const [userId, expRaw, version] = decoded.split(".");
  if (!userId || !expRaw || !version) return null;
  if (Number(expRaw) < Math.floor(Date.now() / 1000)) return null;
  const currentVersion = crypto.createHash("sha256").update(passwordHash).digest("hex").slice(0, 24);
  if (version !== currentVersion) return null;
  return userId;
}

export function secureEqualText(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function setSession(userId: string, passwordHash: string) {
  const jar = await cookies();
  jar.set(COOKIE, sessionToken(userId, passwordHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", expires: new Date(0), path: "/" });
}

export async function getSessionUserId() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const [userId, expRaw, version, sig] = token.split(".");
  if (!userId || !expRaw || !version || !sig) return null;
  if (Number(expRaw) < Math.floor(Date.now() / 1000)) return null;

  const payload = `${userId}.${expRaw}.${version}`;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true, status: true } });
  if (!user || user.status !== "ACTIVE") return null;
  if (!secureEqualText(version, passwordVersion(user.passwordHash))) return null;
  return userId;
}
