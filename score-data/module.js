define(['react', '@grafana/data', '@grafana/runtime'], function (React, data, runtime) {
  'use strict';

  const h = React.createElement;

  class StudentScoreDataSource extends data.DataSourceApi {
    async loadScores() {
      const response = await runtime.getBackendSrv().get(
        runtime.config.appSubUrl + '/public/plugins/kultur-studentscore-datasource/scores.json'
      );
      if (!Array.isArray(response) || response.length === 0 || response.some((row) =>
        !Number.isSafeInteger(row?.week) || row.week < 1 || !Number.isFinite(row.score) || row.score < 0 || row.score > 100)) {
        throw new Error('Örnek not dosyasının biçimi geçersiz.');
      }
      return response;
    }

    async query(request) {
      const targets = request.targets.filter((target) => !target.hide);
      if (targets.length === 0) {
        return { data: [] };
      }
      const scores = await this.loadScores();
      return { data: targets.map(({ refId, fromWeek, toWeek }) => {
        const from = fromWeek ?? 1;
        const to = toWeek ?? Infinity;
        if (!Number.isSafeInteger(from) || from < 1 || to < from ||
            (to !== Infinity && !Number.isSafeInteger(to))) {
          throw new Error('Hafta aralığı artan, pozitif tam sayılar içermeli.');
        }
        const selected = scores.filter(({ week }) => week >= from && week <= to);
        return {
          refId,
          length: selected.length,
          fields: [
            { name: 'week', type: data.FieldType.number, values: selected.map(({ week }) => week), config: {} },
            { name: 'score', type: data.FieldType.number, values: selected.map(({ score }) => score), config: {} },
          ],
        };
      }) };
    }

    async testDatasource() {
      try {
        const rows = await this.loadScores();
        return { status: 'success', message: rows.length + ' örnek puan okundu.' };
      } catch (error) {
        return { status: 'error', message: 'Örnek notlar okunamadı: ' + (error instanceof Error ? error.message : String(error)) };
      }
    }
  }

  function QueryEditor({ query, onChange, onRunQuery }) {
    return h('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
      [['fromWeek', 'İlk hafta'], ['toWeek', 'Son hafta']].map(([key, label]) =>
        h('label', { key }, label + ' ',
          h('input', { type: 'number', min: 1, defaultValue: query[key] ?? '',
            onBlur: /** @param {import('react').FocusEvent<HTMLInputElement>} event */ (event) => {
              const value = event.currentTarget.valueAsNumber;
              onChange({ ...query, [key]: Number.isNaN(value) ? undefined : value });
              onRunQuery();
            } }))));
  }

  function ConfigEditor() {
    return h('p', null, 'Kaynak, eklentiyle birlikte gelen kurgusal JSON verisini kullanır.');
  }

  return { plugin: new data.DataSourcePlugin(StudentScoreDataSource).setConfigEditor(ConfigEditor).setQueryEditor(QueryEditor) };
});
