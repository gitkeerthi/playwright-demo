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

### 1. Trigger a test run
```bash
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer person_access_token" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/gitkeerthi/playwright-demo/actions/workflows/playwright.yml/dispatches \
  -d '{"ref":"main","inputs":{}}'
```

### 2. 