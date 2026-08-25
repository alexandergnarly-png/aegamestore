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
  'id="loginUsernameError" role="alert"',
  'id="loginPasswordError" role="alert"',
  'aria-describedby="regPasswordError passwordRequirements regStrengthLabel regCapsWarn"',
  'minlength="6"',
  'maxlength="72"',
  "passwordOk: password.length >= 6 && password.length <= 72",
  "password.length < 6 || password.length > 72",
  'id="passwordRequirements"',
  'data-password-rule="length"',
  'data-password-rule="case"',
  'data-password-rule="mix"',
  "pw.length < 6) return 1",
  "met ? dict.requirementMet : dict.requirementPending",
  'icon="ph:eye-bold"',
  "function setAuthFieldError(",
  "@media (max-width: 720px) and (max-height: 740px)",
  'loginForm.hidden = true',
  'registerForm.hidden = false',
].forEach((marker) =>
  assert.ok(html.includes(marker), `Missing auth UX marker: ${marker}`),
);

console.log("Auth UI/UX accessibility check passed.");

const admin = fs.readFileSync("public/admin-login.html", "utf8");
const adminScripts = [
  ...admin.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
];

adminScripts.forEach(([, source]) =>
  assert.doesNotThrow(() => new Function(source)),
);

[
  'id="loginForm"',
  'aria-describedby="usernameError"',
  'aria-describedby="passwordError capsWarning"',
  'role="alert"',
  'autocomplete="current-password"',
  'prefers-reduced-motion: reduce',
  '@media (max-width: 820px) and (max-height: 620px)',
  'border-radius: 999px; background: var(--surface);',
  'min-height: 52px; justify-content: space-between;',
  '.field-error:empty, .form-status:empty',
  'matchMedia("(min-width: 821px)").matches',
  'password: passwordInput.value',
  'AE patch 20260825-admin-access-card-v1',
  'class="access-status" role="status"',
  'data-i18n="accessStatus"',
  'data-i18n="accessStatusDetail"',
  'data-i18n="accessStatusBadge"',
  'border-radius: 24px;',
].forEach((marker) =>
  assert.ok(admin.includes(marker), `Missing admin login UX marker: ${marker}`),
);

console.log("Admin login UI/UX accessibility check passed.");
