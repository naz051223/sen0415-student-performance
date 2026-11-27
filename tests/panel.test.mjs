import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../dist/module.js', import.meta.url), 'utf8');
const credits = 'Developed by Huriye Kayadelen & Tuba Nazlı İpekyüz';

function panel({ series, state = 'Done', passMark = 60, width = 650 }) {
  let render;
  let nextState = 0;
  const stateSlots = [];
  const options = { passMark };
  class PanelPlugin {
    constructor(component) { render = component; }
    setPanelOptions() { return this; }
  }
  const React = {
    createElement: (tag, props, ...children) => typeof tag === 'function'
      ? tag(props)
      : { tag, props, children: children.flat(Infinity) },
    useState(initial) {
      const index = nextState++;
      if (!(index in stateSlots)) stateSlots[index] = initial;
      return [stateSlots[index], (value) => { stateSlots[index] = value; }];
    },
    useMemo: (factory) => factory(),
    Fragment: 'fragment',
  };
  runInNewContext(source, { define: (_, factory) => factory(React, { PanelPlugin }) });
  return {
    options,
    view() {
      nextState = 0;
      return render({ width, height: 400, options, data: { series, state } });
    },
  };
}

function text(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  return node?.children?.map(text).join('') ?? '';
}

function elements(node, tag) {
  const descendants = node?.children?.flatMap((child) => elements(child, tag)) ?? [];
  return node?.tag === tag ? [node, ...descendants] : descendants;
}

function scores(values, names = values.map((_, index) => 'Öğrenci ' + (index + 1))) {
  return [{ fields: [
    { name: 'student', type: 'string', values: names },
    { name: 'score', type: 'number', values },
  ] }];
}

test('uses the configured cutoff, excludes invalid scores and preserves table sorting and filtering', () => {
  const fixture = panel({ series: scores([60, 30, null, 101, 90], ['Barajda', 'Altında', 'Eksik', 'Geçersiz', 'Yukarıda']) });
  let view = fixture.view();
  elements(view, 'select')[0].props.onChange({ target: { value: 'passing' } });
  view = fixture.view();
  const table = text(elements(view, 'table')[0]);
  assert.match(text(view), /%66,7/);
  assert.match(text(view), /2 geçersiz puan/);
  assert.match(table, /Yukarıda90GeçtiBarajda60Geçti/);
  assert.doesNotMatch(table, /Altında|Eksik|Geçersiz/);
  fixture.options.passMark = 61;
  assert.doesNotMatch(text(elements(fixture.view(), 'table')[0]), /Barajda/);
});

test('calculates statistics, nonoverlapping grade bins and top and bottom lists from all valid grades', () => {
  const view = panel({ series: scores([85, 0, 70, 49.5, 69.5, 100, 50, 84.5]) }).view();
  assert.deepEqual(elements(view, 'dd').map(text), ['8', '63,6', '%62,5', '69,8', '29']);
  const distribution = elements(view, 'section').find((node) => text(node).startsWith('Puan dağılımı'));
  assert.deepEqual(elements(distribution, 'meter').map(({ props }) => props.value), [2, 2, 2, 2]);
  assert.deepEqual(elements(view, 'ol').map((list) => elements(list, 'li').map(text)), [
    ['Öğrenci 6 • 100', 'Öğrenci 1 • 85', 'Öğrenci 8 • 84,5'],
    ['Öğrenci 2 • 0', 'Öğrenci 4 • 49,5', 'Öğrenci 7 • 50'],
  ]);
});

test('K-means shows reproducible groups, averages, and members in ascending performance order', () => {
  const view = panel({ series: [...scores([95, 20, 60], ['F', 'A', 'C']), ...scores([90, 30, 70], ['E', 'B', 'D'])] }).view();
  const output = text(view);
  assert.match(output, /Düşük performans2 öğrenci • Ortalama 25B, AOrta performans2 öğrenci • Ortalama 65D, CYüksek performans2 öğrenci • Ortalama 92,5F, E/);
  assert.match(output, /gelecek sonuçları tahmin etmez/);
});

test('K-means uses one or two groups for identical and small datasets', () => {
  const single = text(panel({ series: scores([65]) }).view());
  const identical = text(panel({ series: scores([65, 65, 65, 65]) }).view());
  const two = text(panel({ series: scores([65, 40, 65]) }).view());
  assert.match(single, /Tek puan grubu1 öğrenci • Ortalama 65/);
  assert.match(identical, /Tek puan grubu4 öğrenci • Ortalama 65/);
  assert.match(two, /Düşük performans1 öğrenci • Ortalama 40.*Yüksek performans2 öğrenci • Ortalama 65/);
  assert.doesNotMatch(two, /Orta performans/);
});

test('empty, loading and error states keep the credit visible and skip calculations', () => {
  for (const [state, message] of [['Done', /sayısal score alanı/], ['Loading', /Puanlar yükleniyor/], ['Error', /Sorgu başarısız/]]) {
    const view = panel({ series: [], state }).view();
    assert.match(text(view), message);
    assert.ok(text(view).includes(credits));
    assert.equal(elements(view, 'input').length, 0);
  }
});

test('simulation applies fractional thresholds instantly, leaves original results intact and resets', () => {
  const fixture = panel({ series: scores([59.7, 60.5, 61, 100]), passMark: 60.5 });
  let view = fixture.view();
  const [slider] = elements(view, 'input');
  assert.equal(slider.props.value, 60.5);
  slider.props.onChange({ currentTarget: { valueAsNumber: 60.6 } });
  view = fixture.view();
  assert.match(text(view), /Mevcut oran %75Simüle edilen oran %50Fark -25 yüzde puan/);
  assert.match(text(elements(view, 'table')[0]), /Öğrenci 260,5Geçti/);
  assert.equal(fixture.options.passMark, 60.5);
  elements(view, 'input')[0].props.onChange({ currentTarget: { valueAsNumber: 0 } });
  view = fixture.view();
  assert.match(text(view), /Simüle edilen oran %100Fark \+25 yüzde puan/);
  elements(view, 'button')[0].props.onClick();
  view = fixture.view();
  assert.equal(elements(view, 'input')[0].props.value, 60.5);
  assert.match(text(view), /Simüle edilen oran %75Fark 0 yüzde puan/);
});

test('narrow panels retain the results and omit only the inline score meters', () => {
  const view = panel({ series: scores([30, 80]), width: 275 }).view();
  const table = elements(view, 'table')[0];
  assert.match(text(table), /Öğrenci 280GeçtiÖğrenci 130Baraj altı/);
  assert.equal(elements(table, 'meter').length, 0);
  assert.equal(elements(view, 'input').length, 1);
});
