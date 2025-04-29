## playwright-demo

### Install playwright

```bash
  npx playwright install --with-deps
```

### Install project dependencies

```bash
  cd PROJECT_ROOT
  npm install
```

### Run tests

```bash
  npx playwright test
```

## API
**Reference:** `https://github.com/gitkeerthi/playwright-demo`

### 1. Trigger a test run workflow
```bash
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer personal_access_token" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/gitkeerthi/playwright-demo/actions/workflows/playwright.yml/dispatches \
  -d '{"ref":"main","inputs":{}}'
```

### 2. Query workflow run status

```bash
curl \
  -H "Authorization: Bearer personal_access_token" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/gitkeerthi/playwright-demo/actions/runs
```
Pick the last run's 'id' from the above and feed to the next:
```bash
curl \
  -H "Authorization: Bearer personal_access_token" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/gitkeerthi/playwright-demo/actions/runs/{run_id}
```

### 3. Download reports
```bash
curl \
  -H "Authorization: Bearer personal_access_token" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/gitkeerthi/playwright-demo/actions/runs/{run_id}/artifacts
```