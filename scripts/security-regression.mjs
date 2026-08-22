import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const login = read("src/app/api/auth/login/route.ts");
const password = read("src/app/api/profile/password/route.ts");
const reset = read("src/app/api/auth/reset-password/route.ts");
const forgot = read("src/app/api/auth/forgot-password/route.ts");
const auth = read("src/lib/auth.ts");
const enterprise = read("src/app/entreprise/page.tsx");
const logout = read("src/app/api/auth/logout/route.ts");
const nextConfig = read("next.config.ts");

assert(!login.includes("BOOTSTRAP_ADMIN_PASSWORD"), "AUTH-01 regression: bootstrap password must never authenticate through login");
assert(!password.includes("BOOTSTRAP_ADMIN_PASSWORD"), "AUTH-01 regression: bootstrap password must never bypass current-password verification");
assert(!reset.includes("ADMIN_RECOVERY_CODE"), "AUTH-01 regression: reset endpoint must not accept an emergency recovery code");

assert(auth.includes("passwordVersion(passwordHash)"), "AUTH-02 regression: sessions must be bound to password state");
assert(auth.includes("user.status !== \"ACTIVE\""), "AUTH-02 regression: suspended/disabled users must lose session access");
assert(password.includes("setSession(userId, passwordHash)"), "AUTH-02 regression: current browser must receive a fresh session after changing password");

assert(enterprise.includes("item.organization.active && item.canViewProfiles"), "TENANT-01 regression: enterprise portal must enforce active organization and profile permission");
assert(enterprise.includes("membership.canVerifyCertificates"), "TENANT-01 regression: certificate visibility must honor membership permissions");

assert(!forgot.includes("recoveryMode"), "AUTH-03 regression: forgot-password response must not identify the bootstrap administrator");
assert(!forgot.includes("emailDeliveryNotConfigured"), "AUTH-03 regression: forgot-password response must not reveal email configuration/account existence");
assert(forgot.includes("return NextResponse.json({ ok: true, message: GENERIC })"), "AUTH-03 regression: forgot-password must finish with a generic response");

for (const [name, source] of [["login", login], ["password", password], ["reset", reset], ["forgot", forgot]]) {
  assert(source.includes("rateLimit("), `AUTH-04 regression: ${name} endpoint must remain rate limited`);
}

assert(!logout.includes("export async function GET"), "CSRF-01 regression: logout must not be callable with GET");
assert(nextConfig.includes("Content-Security-Policy"), "HDR-01 regression: CSP header must remain configured");
assert(nextConfig.includes("X-Content-Type-Options"), "HDR-01 regression: nosniff header must remain configured");
assert(nextConfig.includes("frame-ancestors 'none'"), "HDR-01 regression: framing must remain disabled");

console.log("Security regression checks passed.");
