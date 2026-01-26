# BMAD project config (cjd80)

URL: https://cjd80.rbw.ovh
URL_SOURCE: /opt/ia-webdev/rulebook-ai/bmad/PROJECT-URLS.md
PLAYWRIGHT: yes
PLAYWRIGHT_CMD: npx playwright test

TSC_CMD: npx tsc --noEmit
TEST_CMD: npm test
CONTAINER_CMD: docker ps
LOGS_CMD: docker logs --tail 100 | grep -i error
