const COOKIE_NAME = "sanfiley_session";
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const VALUE = "authenticated";

// Uses the Web Crypto API (available in both the Node.js and Edge runtimes,
// which matters because Next.js runs middleware on the Edge runtime).
async function getKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken() {
  const key = await getKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(VALUE)
  );
  return `${VALUE}.${toHex(sig)}`;
}

export async function isValidSessionToken(token) {
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (value !== VALUE || !sig) return false;
  const key = await getKey();
  const expectedSig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return toHex(expectedSig) === sig;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export function checkPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  return password === adminPassword;
}
