import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

function loginUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return `${configured}/connexion`;
  return new URL("/connexion", request.url).toString();
}

async function logout(request: Request) {
  await clearSession();
  return NextResponse.redirect(loginUrl(request), 303);
}

export async function POST(request: Request) {
  return logout(request);
}

export async function GET(request: Request) {
  return logout(request);
}
