define(['react', '@grafana/data'], function (React, GrafanaData) {
  'use strict';

  const h = React.createElement;
  const number = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
  const collator = new Intl.Collator('tr-TR', { numeric: true });
  const groupMembers = 'Huriye Kayadelen, Tuba Nazlı İpekyüz';

  function readScores(frames) {
    const rows = [];
    let excluded = 0;
    for (const { fields } of frames) {
      const scores = fields.find(({ name, type }) => name.toLowerCase() === 'score' && type === 'number');
      if (!scores) {
        continue;
      }
      const names = fields.find(({ name, type }) => name.toLowerCase() === 'student' && type === 'string');
      for (const [index, score] of scores.values.entries()) {
        if (!Number.isFinite(score) || score < 0 || score > 100) {
          excluded++;
          continue;
        }
        rows.push({ name: names?.values[index]?.trim() || 'Öğrenci ' + (rows.length + 1), score });
      }
    }
    return { rows, excluded };
  }

  function StudentPerformance({ data, options, width, height }) {
    const [scope, setScope] = React.useState('all');
    const cutoff = Number.isFinite(options.passMark) ? Math.min(100, Math.max(0, options.passMark)) : 60;
    const { rows, excluded } = readScores(data.series);
    const passing = rows.filter(({ score }) => score >= cutoff).length;
    const average = rows.reduce((total, { score }) => total + score, 0) / rows.length;
    const rate = rows.length ? passing / rows.length * 100 : 0;
    const visible = rows
      .filter(({ score }) => scope === 'all' || (scope === 'passing' ? score >= cutoff : score < cutoff))
      .sort((a, b) => b.score - a.score || collator.compare(a.name, b.name));
    const author = options.studentNames?.trim() || groupMembers;
    const divider = '1px solid color-mix(in srgb, currentColor 22%, transparent)';
    const card = {
      border: divider,
      background: 'color-mix(in srgb, currentColor 4%, transparent)',
      borderRadius: 8,
      padding: '10px 12px',
      minWidth: 0,
    };
    const cell = { padding: '7px 6px', borderBottom: divider };
    const metrics = [
      ['Kayıt', number.format(rows.length)],
      ['Ortalama', number.format(average)],
      ['Başarı oranı', '%' + number.format(rate)],
    ];
    const queryError = data.state === 'Error' || Boolean(data.error);

    return h('section', { style: { width, height, overflow: 'auto', padding: 14, boxSizing: 'border-box' } },
      h('header', { style: { marginBottom: 12 } },
        h('strong', { style: { fontSize: 17 } }, 'Öğrenci Performansı'),
        h('div', { style: { fontSize: 12, marginTop: 3 } },
          'Geliştirenler: ' + author)),
      queryError
        ? h('p', { role: 'alert' }, 'Sorgu başarısız oldu. Veri kaynağını kontrol edin.')
        : rows.length === 0
          ? h('p', { role: 'status' }, data.state === 'Loading'
            ? 'Puanlar yükleniyor…'
            : '0–100 aralığında sayısal score alanı içeren bir sorgu ekleyin.')
          : h(React.Fragment, null,
              h('dl', { style: { display: 'grid', gridTemplateColumns: width >= 480 ? 'repeat(3, minmax(0, 1fr))' : '1fr', gap: 8, margin: '0 0 12px' } },
                metrics.map(([label, value]) => h('div', { key: label, style: card },
                  h('dt', { style: { fontSize: 12 } }, label),
                  h('dd', { style: { margin: 0, fontSize: 22, fontWeight: 600 } }, value)))),
              h('label', null,
                'Sonuç filtresi ',
                h('select', { value: scope, onChange: (event) => setScope(event.target.value), style: { color: 'inherit', background: 'transparent', colorScheme: 'light dark' } },
                  h('option', { value: 'all' }, 'Tümü'),
                  h('option', { value: 'passing' }, 'Geçenler'),
                  h('option', { value: 'below' }, 'Baraj altı'))),
              h('span', { style: { marginInlineStart: 10, fontSize: 12 } }, 'Geçme barajı ' + number.format(cutoff)),
              visible.length
                ? h('table', { style: { width: '100%', marginTop: 8, textAlign: 'left', borderCollapse: 'collapse' } },
                    h('thead', null, h('tr', null, ['Öğrenci', 'Puan', 'Durum'].map((label) =>
                      h('th', { key: label, scope: 'col', style: cell }, label)))),
                    h('tbody', null, visible.map(({ name, score }, index) =>
                      h('tr', { key: index },
                        h('td', { style: cell }, name),
                        h('td', { style: cell },
                          number.format(score),
                          width >= 480 && h('meter', {
                            min: 0, max: 100, value: score, low: cutoff, optimum: 100,
                            'aria-hidden': true,
                            style: { width: 'min(14vw, 110px)', marginInlineStart: 8 },
                          })),
                        h('td', { style: cell }, score >= cutoff ? 'Geçti' : 'Baraj altı')))))
                : h('p', { role: 'status' }, 'Bu filtreye uyan kayıt yok.')),
      excluded > 0 && h('p', { style: { fontSize: 12 } }, number.format(excluded) + ' geçersiz puan hesaba katılmadı.'));
  }

  const plugin = new GrafanaData.PanelPlugin(StudentPerformance).setPanelOptions((builder) =>
    builder
      .addTextInput({ path: 'studentNames', name: 'Grup üyeleri', description: 'Ad ve soyadları virgülle ayırın.', defaultValue: groupMembers })
      .addNumberInput({ path: 'passMark', name: 'Geçme barajı', defaultValue: 60, settings: { min: 0, max: 100 } }));

  return { plugin };
});
