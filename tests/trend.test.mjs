import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../trend/module.js', import.meta.url), 'utf8');
let render;
class PanelPlugin {
  constructor(component) {
    render = component;
  }
}
runInNewContext(source, {
  define: (_, factory) => factory({ createElement: (...args) => args }, { PanelPlugin }),
});

function panel(weeks, scores) {
  return JSON.stringify(render({ width: 500, height: 400, data: { series: [{ fields: [
    { name: 'week', type: 'number', values: weeks },
    { name: 'score', type: 'number', values: scores },
  ] }] } }));
}

test('trend fit groups duplicate weeks, skips invalid scores, and predicts the next week', () => {
  const output = panel([4, 1, 2, 3, 2, 5], [80, 50, 58, 70, 62, 101]);
  assert.match(output, /5\. hafta tahmini/);
  assert.match(output, /90 \/ 100/);
  assert.match(output, /Seçilen yöntem: Doğrusal regresyon/);
});

test('backtest falls back to the latest observation when regression is worse', () => {
  assert.match(panel([1, 2, 3, 4], [50, 70, 50, 50]), /Seçilen yöntem: Son gözlem/);
});

test('fewer than four distinct weeks do not yield a forecast', () => {
  assert.match(panel([1, 1, 2, 3], [50, 55, 65, 70]), /en az dört farklı hafta/);
});
