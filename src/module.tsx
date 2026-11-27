import React, { useMemo, useState, type CSSProperties } from 'react';
import { PanelPlugin, type DataFrame, type PanelProps } from '@grafana/data';
import { clusterStudents, passRate, summarize, type StudentScore } from './performanceAnalysis';

interface Options {
  passMark: number;
  studentNames: string;
}

const number = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
const percentagePoints = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1, signDisplay: 'exceptZero' });
const collator = new Intl.Collator('tr-TR', { numeric: true });
const groupMembers = 'Huriye Kayadelen, Tuba Nazlı İpekyüz';
const credits = 'Developed by Huriye Kayadelen & Tuba Nazlı İpekyüz';
const divider = '1px solid color-mix(in srgb, currentColor 22%, transparent)';
const card: CSSProperties = {
  border: divider,
  background: 'color-mix(in srgb, currentColor 4%, transparent)',
  borderRadius: 8,
  padding: '10px 12px',
  minWidth: 0,
};
const cell: CSSProperties = { padding: '7px 6px', borderBottom: divider, overflowWrap: 'anywhere' };
const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 135px), 1fr))', gap: 8 };
const heading: CSSProperties = { fontSize: 15, margin: '0 0 6px' };
const section: CSSProperties = { ...card, marginTop: 10 };
const percent = (value: number) => '%' + number.format(value);

function readScores(frames: readonly DataFrame[]) {
  const rows: StudentScore[] = [];
  let excluded = 0;
  for (const [frameIndex, { fields }] of frames.entries()) {
    const scores = fields.find(({ name, type }) => name.toLowerCase() === 'score' && type === 'number');
    if (!scores) {
      continue;
    }
    const names = fields.find(({ name, type }) => name.toLowerCase() === 'student' && type === 'string');
    for (const [index, score] of scores.values.entries()) {
      if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
        excluded++;
        continue;
      }
      const name = names?.values[index];
      rows.push({
        id: frameIndex + '-' + index,
        name: (typeof name === 'string' && name.trim()) || 'Öğrenci ' + (rows.length + 1),
        score,
      });
    }
  }
  rows.sort((a, b) => b.score - a.score || collator.compare(a.name, b.name));
  return { rows, excluded };
}

function RankedList({ title, students }: { title: string; students: readonly StudentScore[] }) {
  return (
    <div>
      <strong>{title}</strong>
      <ol style={{ paddingInlineStart: 20, margin: '4px 0 0', overflowWrap: 'anywhere' }}>
        {students.map(({ id, name, score }) => <li key={id}>{name} • {number.format(score)}</li>)}
      </ol>
    </div>
  );
}

function StudentPerformance({ data, options, width, height }: PanelProps<Options>) {
  const [scope, setScope] = useState('all');
  const [simulatedMark, setSimulatedMark] = useState<number | null>(null);
  const cutoff = Number.isFinite(options.passMark) ? Math.min(100, Math.max(0, options.passMark)) : 60;
  const simulation = simulatedMark ?? cutoff;
  const { rows, excluded } = useMemo(() => readScores(data.series), [data.series]);
  const statistics = useMemo(() => summarize(rows), [rows]);
  const clusters = useMemo(() => clusterStudents(rows), [rows]);
  const rate = passRate(rows, cutoff);
  const simulatedRate = passRate(rows, simulation);
  const visible = rows.filter(({ score }) => scope === 'all' || (scope === 'passing' ? score >= cutoff : score < cutoff));
  const author = options.studentNames?.trim();
  const queryError = data.state === 'Error' || Boolean(data.error);
  const metrics = [
    ['Kayıt', number.format(rows.length)],
    ['Ortalama', number.format(statistics.mean)],
    ['Başarı oranı', percent(rate)],
    ['Medyan', number.format(statistics.median)],
    ['Standart sapma', number.format(statistics.deviation)],
  ];

  return (
    <section style={{ width, height, overflow: 'auto', padding: 14, boxSizing: 'border-box' }}>
      <header style={{ marginBottom: 12 }}>
        <strong style={{ fontSize: 17 }}>Öğrenci Performansı</strong>
        <div style={{ fontSize: 12, marginTop: 3 }}>{credits}</div>
        {author && author !== groupMembers && <div style={{ fontSize: 12 }}>Grup üyeleri: {author}</div>}
      </header>
      {queryError ? <p role="alert">Sorgu başarısız oldu. Veri kaynağını kontrol edin.</p> : rows.length === 0 ? (
        <p role="status">{data.state === 'Loading' ? 'Puanlar yükleniyor…' : '0–100 aralığında sayısal score alanı içeren bir sorgu ekleyin.'}</p>
      ) : (
        <>
          <dl aria-label="Puan istatistikleri" style={{ ...grid, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 110px), 1fr))', margin: '0 0 12px' }}>
            {metrics.map(([label, value]) => (
              <div key={label} style={card}>
                <dt style={{ fontSize: 12 }}>{label}</dt>
                <dd style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{value}</dd>
              </div>
            ))}
          </dl>
          <div style={grid}>
            <section style={card}>
              <h3 style={heading}>Puan dağılımı</h3>
              {statistics.distribution.map(({ label, count }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 6, alignItems: 'center' }}>
                  <span>{label}</span>
                  <meter aria-hidden="true" min={0} max={rows.length} value={count} style={{ width: '100%' }} />
                  <span>{number.format(count)}</span>
                </div>
              ))}
            </section>
            <section style={{ ...card, ...grid, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 112px), 1fr))' }}>
              <RankedList title="En yüksek 3 puan" students={statistics.top} />
              <RankedList title="En düşük 3 puan" students={statistics.bottom} />
            </section>
          </div>
          <section style={section}>
            <h3 style={heading}>K-means performans grupları</h3>
            <p style={{ fontSize: 12, margin: '0 0 8px' }}>
              Her puan, ortalaması en yakın gruba atanır. Gruplar mevcut puanları açıklar ve gelecek sonuçları tahmin etmez.
              {clusters.length < 3 && ' Farklı puan sayısı az olduğu için daha az grup oluşturuldu.'}
            </p>
            <div style={grid}>
              {clusters.map(({ label, average, students }) => (
                <div key={label} style={card}>
                  <strong>{label}</strong>
                  <div>{number.format(students.length)} öğrenci • Ortalama {number.format(average)}</div>
                  <div style={{ fontSize: 12, overflowWrap: 'anywhere' }}>
                    {students.map(({ name }) => name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section style={section}>
            <h3 style={heading}>What-If Simulator</h3>
            <label style={{ display: 'block' }}>
              Simülasyon barajı <strong>{number.format(simulation)}</strong>
              <input
                aria-label="Simülasyon barajı"
                type="range"
                min={0}
                max={100}
                step="any"
                value={simulation}
                onChange={(event) => setSimulatedMark(event.currentTarget.valueAsNumber)}
                style={{ display: 'block', width: '100%', margin: '5px 0' }}
              />
            </label>
            <div aria-live="polite" style={grid}>
              <span>Mevcut oran <strong>{percent(rate)}</strong></span>
              <span>Simüle edilen oran <strong>{percent(simulatedRate)}</strong></span>
              <span>Fark <strong>{percentagePoints.format(simulatedRate - rate)} yüzde puan</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setSimulatedMark(null)}
              style={{ ...card, color: 'inherit', cursor: 'pointer', marginTop: 8, padding: '5px 9px' }}
            >
              Reset Simulation
            </button>
          </section>
          <div style={{ marginTop: 12 }}>
            <label>
              Sonuç filtresi{' '}
              <select value={scope} onChange={(event) => setScope(event.target.value)}
                style={{ color: 'inherit', background: 'transparent', colorScheme: 'light dark', width: 'auto', minHeight: 28, padding: '2px 8px', border: divider, borderRadius: 4 }}>
                <option value="all">Tümü</option>
                <option value="passing">Geçenler</option>
                <option value="below">Baraj altı</option>
              </select>
            </label>
            <span style={{ marginInlineStart: 10, fontSize: 12 }}>Geçme barajı {number.format(cutoff)}</span>
          </div>
          {visible.length ? (
            <table style={{ width: '100%', marginTop: 8, textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Öğrenci', 'Puan', 'Durum'].map((label) => <th key={label} scope="col" style={cell}>{label}</th>)}</tr>
              </thead>
              <tbody>
                {visible.map(({ id, name, score }) => (
                  <tr key={id}>
                    <td style={cell}>{name}</td>
                    <td style={cell}>
                      {number.format(score)}
                      {width >= 480 && <meter min={0} max={100} value={score} low={cutoff} optimum={100} aria-hidden="true"
                        style={{ width: 'min(14vw, 110px)', marginInlineStart: 8 }} />}
                    </td>
                    <td style={cell}>{score >= cutoff ? 'Geçti' : 'Baraj altı'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p role="status">Bu filtreye uyan kayıt yok.</p>}
        </>
      )}
      {excluded > 0 && <p style={{ fontSize: 12 }}>{number.format(excluded)} geçersiz puan hesaba katılmadı.</p>}
    </section>
  );
}

export const plugin = new PanelPlugin(StudentPerformance).setPanelOptions((builder) =>
  builder
    .addTextInput({ path: 'studentNames', name: 'Grup üyeleri', description: 'Ad ve soyadları virgülle ayırın.', defaultValue: groupMembers })
    .addNumberInput({ path: 'passMark', name: 'Geçme barajı', defaultValue: 60, settings: { min: 0, max: 100 } }));
