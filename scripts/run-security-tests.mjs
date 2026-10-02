import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const fixtureRoot = process.env.SECURITY_TEST_TMP || mkdtempSync(path.join(tmpdir(),'personal-site-security-tests-'));
for (const args of [
  ['--experimental-strip-types','--disable-warning=ExperimentalWarning','--import','./scripts/security-test-register.mjs','scripts/test-security.mjs'],
  ['scripts/test-security-sql.mjs'],
]) {
  const result = spawnSync(process.execPath,args,{stdio:'inherit',env:{...process.env,SECURITY_TEST_TMP:fixtureRoot}});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
