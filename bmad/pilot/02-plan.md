# BMAD Plan - pilot (cjd80)

Steps:
1) Draft a small UI change brief (pilot only).
2) Draft a backend task plan with verification steps.
3) Draft a delivery summary template aligned to Rulebook checks.

Verification checklist (Rulebook):
- TypeScript: npx tsc --noEmit
- Tests: npm test
- Container: docker ps (running, uptime > 30s)
- Logs: docker logs --tail 100 | grep -i error (0 matches)
- Browser: Playwright test if UI changes

UI validation:
- Validate via: https://cjd80.rbw.ovh

Status: pending execution.
