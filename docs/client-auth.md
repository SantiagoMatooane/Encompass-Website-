# Client authentication

This remains a buildless static site. Serve `dist/` from the repository root:

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:4173/` or `/marketing.html` and choose Log in.
Both divisions share the same account panel and Firebase Auth session.

SDK API reference: [Firebase Authentication for JavaScript](https://firebase.google.com/docs/reference/js/auth).

## Configuration and boundaries

- `dist/auth-config.js` contains the supplied public Firebase browser configuration.
- `dist/auth-firebase.js` dynamically imports the specified Firebase 13.1.0 browser ES modules, initialises the default app once, and explicitly selects `browserSessionPersistence` before observing authentication. Firebase handles session tokens; this application does not store passwords or manually store tokens.
- A session survives refresh in the current tab and origin. Closing the tab ends session persistence. Different hostnames (including localhost versus 127.0.0.1) have different sessions.
- `AGENT_DESTINATION_URL` in `auth-config.js` is the single reserved location for the partner's future destination. It is currently `null`. Find businesses stays disabled until that destination and its authentication integration are defined; this release has no questionnaire, business search, Apollo calls or protected business data.
- `AUTH_EMULATOR_URL` is `null` for normal use. Automated emulator tests intercept the configuration module only in their isolated browser tab and substitute the demo project and local emulator URL. They do not edit production configuration.
- The panel waits for the initial Firebase observer before displaying account content. Unverified users see the verification view; verified users see the minimal welcome view. Verification refresh uses Firebase `reload` and checks `emailVerified`, never a button-click flag.
- Signup saves the full name with `updateProfile`, then sends verification. If either post-creation step fails, the account remains created and the panel offers name recovery and verification resend. Recovery is also available if verification finishes before the name is saved. Do not create the account again.
- Resend has a 60-second in-page cooldown after each attempt. Firebase's server throttling is authoritative. Password reset uses the same generic success message for unknown and known addresses; transport/rate-limit failures remain actionable without revealing account existence.
- Authentication only gates the visible UI. **The future agent/backend must independently validate Firebase authentication and required verification/permissions on every protected request.** Frontend visibility is not backend security. No backend, Firestore, Storage, Admin SDK or service accounts were added.

## Automated verification

Use installed Chrome with an isolated temporary profile and remote debugging on port 9227, plus the static preview on port 4173. No npm or build step is needed.

```powershell
node verify-auth.mjs --sdk-only
node verify-auth.mjs
node verify-auth.mjs --emulator
node verify-restaurant.mjs
node verify-legal.mjs
```

- `--sdk-only`: real supplied Firebase project, **read-only** SDK loading, initialisation and initial signed-out observer. Never creates accounts or sends mail.
- Default: intercepts only the Firebase adapter with a controlled mock to test partial success, failure/loading states, privacy, safe text rendering, UI verification gating, form controls, translations, keyboard handling, refresh, logout and 320px/mobile layouts. Its fictional session data exists only inside the test adapter, not production code.
- `--emulator`: uses the real Firebase SDK with the local Auth Emulator on `127.0.0.1:9099`, project `demo-encompass-auth`. It creates fictional `example.invalid` accounts, obtains verification/reset codes from the emulator, and verifies the account lifecycle and session persistence. It never uses live project accounts or sends real emails.
- Emulator tests require an already-installed Firebase CLI. Start only Auth with demo project `demo-encompass-auth`, port 9099, host 127.0.0.1 and Emulator UI disabled. Review artifacts/configuration/logs are under ignored `.openai/auth-tests/`. No Firebase console settings are changed.

Screenshots from the automated browser checks are written to the system temporary directory as `encompass-auth-*.png`.

## Remaining manual review

Live signup, verification delivery and password-reset inbox checks were intentionally not performed. When you choose to test with your own account:

1. Create one live account, confirm the name is shown, and open the received verification link. Return and choose I've verified my email; confirm the welcome view only appears once Firebase reports verification.
2. Refresh in the same tab, then log out. Log in again and request a password reset. Confirm inbox/spam delivery, the reset link and the new password. Do not use a real customer's account.
3. Check your project's password policy and email templates in your own review; this implementation does not change them.
4. Review French and Mandarin authentication translations with fluent speakers. Check on physical phones and with your preferred screen reader/password manager. Automated Chrome checks cover desktop/mobile including 320px; they do not replace these checks.

Committing this implementation does not verify live inbox delivery or implement the future backend. The manual checks above remain separate.
