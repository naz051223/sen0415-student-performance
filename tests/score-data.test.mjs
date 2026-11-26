import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../score-data/module.js', import.meta.url), 'utf8');

function createSource(get) {
  let Source;
  class DataSourcePlugin {
    constructor(constructor) {
      Source = constructor;
    }
    setConfigEditor() { return this; }
    setQueryEditor() { return this; }
  }
  const data = { DataSourceApi: class {}, DataSourcePlugin, FieldType: { number: 'number' } };
  const runtime = { config: { appSubUrl: '/grafana' }, getBackendSrv: () => ({ get }) };
  runInNewContext(source, { define: (_, factory) => factory({}, data, runtime) });
  return new Source();
}

test('bundled data uses the configured subpath and filters the inclusive week range', async () => {
  const source = createSource(async (path) => {
    assert.equal(path, '/grafana/public/plugins/kultur-studentscore-datasource/scores.json');
    return [{ week: 1, score: 45 }, { week: 2, score: 60 }, { week: 3, score: 75 }];
  });
  const result = await source.query({ targets: [{ refId: 'A', fromWeek: 2, toWeek: 3 }] });
  assert.equal(result.data[0].fields[1].values.join(','), '60,75');
  await assert.rejects(source.query({ targets: [{ fromWeek: 3, toWeek: 2 }] }), /Hafta aralığı/);
});

test('invalid and inaccessible source data report a failure', async () => {
  const invalid = createSource(async () => [{ week: 1, score: 120 }]);
  await assert.rejects(invalid.query({ targets: [{}] }), /biçimi geçersiz/);
  const unavailable = createSource(async () => { throw new Error('HTTP 404'); });
  assert.equal((await unavailable.testDatasource()).status, 'error');
  assert.equal((await unavailable.query({ targets: [{ hide: true }] })).data.length, 0);
});
