import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { build } from 'esbuild';

const panelSource = new URL('./src/', import.meta.url);
const production = await build({
  stdin: {
    contents: await readFile(new URL('module.tsx', panelSource), 'utf8'),
    sourcefile: 'module.tsx',
    loader: 'tsx',
  },
  bundle: true,
  write: false,
  format: 'cjs',
  target: 'es2022',
  external: ['react', '@grafana/data'],
  minify: true,
  tsconfigRaw: { compilerOptions: { jsx: 'react' } },
  plugins: [{
    name: 'panel-analysis',
    setup(builder) {
      builder.onResolve({ filter: /^\.\/performanceAnalysis$/ }, () => ({
        path: 'performanceAnalysis.ts',
        namespace: 'panel',
      }));
      builder.onLoad({ filter: /\.ts$/, namespace: 'panel' }, async ({ path }) => ({
        contents: await readFile(new URL(path, panelSource), 'utf8'),
        loader: 'ts',
      }));
    },
  }],
});

const mainPanel = [
  "define(['react', '@grafana/data'], function (React, GrafanaData) {",
  'const module = { exports: {} };',
  "const require = (name) => name === 'react' ? React : GrafanaData;",
  production.outputFiles[0].text,
  'return module.exports;',
  '});',
].join('\n');

for (const [sourceDirectory, outputDirectory, extraFiles] of [
  ['src', 'dist', []],
  ['trend', 'dist-trend', []],
  ['score-data', 'dist-score-data', ['scores.json']],
]) {
  const source = new URL('./' + sourceDirectory + '/', import.meta.url);
  const output = new URL('./' + outputDirectory + '/', import.meta.url);
  const plugin = sourceDirectory === 'src' ? mainPanel : await readFile(new URL('module.js', source), 'utf8');
  new Script(plugin, { filename: sourceDirectory + '/module.js' });
  JSON.parse(await readFile(new URL('plugin.json', source), 'utf8'));
  await mkdir(output, { recursive: true });
  await writeFile(new URL('module.js', output), plugin);
  for (const name of ['plugin.json', ...extraFiles]) {
    await copyFile(new URL(name, source), new URL(name, output));
  }
}
console.log('Grafana plugins built in dist/, dist-trend/, and dist-score-data/');
