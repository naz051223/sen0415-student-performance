import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/module.js', import.meta.url), 'utf8');

function renderPanel({ filter = 'all', passMark, series, state = 'Done' }) {
  let render;
  class PanelPlugin {
    constructor(component) {
      render = component;
    }

    setPanelOptions() {
      return this;
    }
  }

  const React = {
    createElement: (tag, props, ...children) => ({ tag, props, children }),
    useState: () => [filter, () => {}],
    Fragment: 'fragment',
  };
  runInNewContext(source, { define: (_, factory) => factory(React, { PanelPlugin }) });
  const tree = render({ width: 600, height: 400, options: { passMark }, data: { series, state } });
  return JSON.stringify(tree);
}

const series = [{ fields: [
  { name: 'student', type: 'string', values: ['Barajda', 'Altında', 'Eksik', 'Geçersiz', 'Yukarıda'] },
  { name: 'score', type: 'number', values: [60, 30, null, 101, 90] },
] }];

test('baraja eşit puan geçer ve geçersiz puanlar başarı oranına dahil edilmez', () => {
  const view = renderPanel({ series, filter: 'passing', passMark: 60 });
  assert.match(view, /%66,7/);
  assert.match(view, /2 geçersiz puan/);
  assert.match(view, /Barajda/);
  assert.doesNotMatch(view, /Altında|Eksik|Geçersiz/);
  assert.ok(view.indexOf('Yukarıda') < view.indexOf('Barajda'));
  assert.doesNotMatch(renderPanel({ series, filter: 'passing', passMark: 61 }), /Barajda/);
});

test('sorgu hatasında grup adları görünür', () => {
  const view = renderPanel({ series: [], state: 'Error' });
  assert.match(view, /Sorgu başarısız/);
  assert.match(view, /Huriye Kayadelen, Tuba Nazlı İpekyüz/);
});
