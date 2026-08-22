import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/security";

function loginUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return `${configured}/connexion`;
  return new URL("/connexion", request.url).toString();
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  await clearSession();
  return NextResponse.redirect(loginUrl(request), 303);
}
