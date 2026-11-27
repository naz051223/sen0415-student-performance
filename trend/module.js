define(['react', '@grafana/data'], function (React, GrafanaData) {
  'use strict';

  const h = React.createElement;
  const format = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
  const clip = (value) => Math.min(100, Math.max(0, value));

  function readWeeks(frames) {
    const weeks = new Map();
    for (const { fields } of frames) {
      const week = fields.find(({ name, type }) => name === 'week' && type === 'number');
      const score = fields.find(({ name, type }) => name === 'score' && type === 'number');
      if (!week || !score) {
        continue;
      }
      for (const [index, value] of score.values.entries()) {
        const period = week.values[index];
        if (!Number.isSafeInteger(period) || period < 1 || !Number.isFinite(value) || value < 0 || value > 100) {
          continue;
        }
        const bucket = weeks.get(period) ?? { count: 0, total: 0 };
        bucket.count += 1;
        bucket.total += value;
        weeks.set(period, bucket);
      }
    }
    return Array.from(weeks, ([week, bucket]) => ({ week, score: bucket.total / bucket.count }))
      .sort((left, right) => left.week - right.week);
  }

  function fit(points) {
    const count = points.length;
    const meanWeek = points.reduce((sum, p) => sum + p.week, 0) / count;
    const meanScore = points.reduce((sum, p) => sum + p.score, 0) / count;
    let covariance = 0;
    let variance = 0;
    for (const point of points) {
      const offset = point.week - meanWeek;
      covariance += offset * (point.score - meanScore);
      variance += offset * offset;
    }
    return (week) => clip(meanScore + covariance / variance * (week - meanWeek));
  }

  function evaluate(points) {
    let modelError = 0;
    let baselineError = 0;
    for (let index = 3; index < points.length; index++) {
      const actual = points[index];
      modelError += Math.abs(fit(points.slice(0, index))(actual.week) - actual.score);
      baselineError += Math.abs(points[index - 1].score - actual.score);
    }
    const checks = points.length - 3;
    const useModel = modelError < baselineError;
    const last = points.at(-1);
    return {
      week: last.week + 1,
      expected: useModel ? fit(points)(last.week + 1) : last.score,
      method: useModel ? 'Doğrusal regresyon' : 'Son gözlem',
      modelError: modelError / checks,
      baselineError: baselineError / checks,
      checks,
    };
  }

  function TrendPanel({ data, height, width }) {
    const points = readWeeks(data.series);
    const style = { height, width, overflow: 'auto', padding: 14, boxSizing: 'border-box' };
    const footer = h('small', null, 'Developed by Huriye Kayadelen & Tuba Nazlı İpekyüz');
    if (data.state === 'Error' || data.error) {
      return h('section', { style }, h('p', { role: 'alert' }, 'Haftalık puan sorgusu çalışmadı.'), footer);
    }
    if (points.length < 4) {
      return h('section', { style }, h('p', { role: 'status' },
        'Tahmin için en az dört farklı hafta ve sayısal week / score alanları gerekir.'), footer);
    }
    const result = evaluate(points);
    return h('section', { style },
      h('div', { style: { fontSize: 14 } }, result.week + '. hafta tahmini'),
      h('strong', { style: { fontSize: 34 } }, format.format(result.expected) + ' / 100'),
      h('p', null, 'Seçilen yöntem: ' + result.method),
      h('p', null, 'Ortalama mutlak hata (' + result.checks + ' geçmiş deneme)'),
      h('ul', null,
        h('li', null, 'Doğrusal regresyon: ' + format.format(result.modelError) + ' puan'),
        h('li', null, 'Son gözlem: ' + format.format(result.baselineError) + ' puan')),
      h('p', null, 'Tahmin sınıf ortalamasına aittir ve geçmiş puanlar kullanılarak tarayıcıda hesaplanır.'),
      footer);
  }

  return { plugin: new GrafanaData.PanelPlugin(TrendPanel) };
});
