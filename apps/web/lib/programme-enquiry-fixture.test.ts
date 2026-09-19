import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const preload = fileURLToPath(
  new URL('../../../tests/fixtures/programme-cms.cjs', import.meta.url),
);
const environment = {
  ...process.env,
  LUMINOL_PROGRAMME_FIXTURE: 'isolated-browser-test',
  NEXT_PUBLIC_SANITY_PROJECT_ID: 'e2eprogrammefixture',
};

function execute(script: string, env = environment) {
  const result = spawnSync(
    process.execPath,
    ['--require', preload, '-e', script],
    {
      env,
      encoding: 'utf8',
      timeout: 5000,
    },
  );
  expect(result.error).toBeUndefined();
  return result;
}

const urlSetup = `const url = new URL('https://e2eprogrammefixture.api.sanity.io/v2024-01-01/data/query/fixtures'); url.searchParams.set('query','programme');`;

describe('isolated course browser fixture', () => {
  it('cannot activate in an ordinary application process', () => {
    const result = execute('', {
      ...environment,
      LUMINOL_PROGRAMME_FIXTURE: '',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('requires its isolated test environment');
  });
  it('supplies a known synthetic course for detail and catalogue reads', () => {
    const result = execute(`${urlSetup}
      (async()=>{const list=await(await fetch(url)).json(); url.searchParams.set('$slug',JSON.stringify('acceptance-commitment-therapy-act')); const detail=await(await fetch(url)).json(); console.log(JSON.stringify([list.result[0]._id,detail.result._id]));})().catch(()=>process.exit(1));`);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([
      'fixture-act-not-live',
      'fixture-act-not-live',
    ]);
  });
  it('preserves missing-course and school filtering boundaries', () => {
    const result = execute(`${urlSetup}
      (async()=>{url.searchParams.set('$slug',JSON.stringify('missing')); const missing=await(await fetch(url)).json(); url.searchParams.delete('$slug'); url.searchParams.set('$school',JSON.stringify('languages')); const school=await(await fetch(url)).json(); console.log(JSON.stringify([missing.result,school.result]));})().catch(()=>process.exit(1));`);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([null, []]);
  });
  it('rejects CMS writes and retains non-CMS native fetch', () => {
    const result = execute(`${urlSetup}
      (async()=>{let denied=false; try {await fetch(url,{method:'POST'});} catch {denied=true;} const text=await(await fetch('data:text/plain,native')).text(); console.log(JSON.stringify([denied,text]));})().catch(()=>process.exit(1));`);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([true, 'native']);
  });
});
