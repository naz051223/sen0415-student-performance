import { mkdir, copyFile, readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

for (const [sourceDirectory, outputDirectory, extraFiles] of [
  ['src', 'dist', []],
  ['trend', 'dist-trend', []],
  ['score-data', 'dist-score-data', ['scores.json']],
]) {
  const source = new URL('./' + sourceDirectory + '/', import.meta.url);
  const output = new URL('./' + outputDirectory + '/', import.meta.url);
  new Script(await readFile(new URL('module.js', source), 'utf8'), { filename: sourceDirectory + '/module.js' });
  JSON.parse(await readFile(new URL('plugin.json', source), 'utf8'));
  await mkdir(output, { recursive: true });
  for (const name of ['module.js', 'plugin.json', ...extraFiles]) {
    await copyFile(new URL(name, source), new URL(name, output));
  }
}
console.log('Grafana plugins built in dist/, dist-trend/, and dist-score-data/');
