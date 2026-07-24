const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("public/user-auth.html", "utf8");
const scripts = [
  ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
];

scripts.forEach(([, source]) => assert.doesNotThrow(() => new Function(source)));

[
  'href="#auth-main"',
  'id="auth-main"',
  'aria-controls="loginForm"',
  'aria-controls="registerForm"',
  'id="themeToggle"',
  'icon="ph:moon-stars-bold"',
  'autocomplete="username"',
  'id="regUsernameHint"',
  'loginForm.hidden = true',
  'registerForm.hidden = false',
].forEach((marker) =>
  assert.ok(html.includes(marker), `Missing auth UX marker: ${marker}`),
);

console.log("Auth UI/UX accessibility check passed.");
