import fs from 'fs';
import zlib from 'zlib';

const html = fs.readFileSync('ChessScan.html', 'utf8');

// Grab the manifest JSON (script[type="__bundler/manifest"]) and the template string.
function tagContent(type) {
  const open = `<script type="${type}">`;
  const i = html.indexOf(open);
  if (i < 0) throw new Error('no ' + type);
  const start = i + open.length;
  const end = html.indexOf('</script>', start);
  return html.slice(start, end).trim();
}

const manifest = JSON.parse(tagContent('__bundler/manifest'));
const template = JSON.parse(tagContent('__bundler/template')); // decoded HTML string

// The babel/JS source files: find <script ... src="UUID"> in template, in order.
// text/babel = app source; the plain ones near them are React/ReactDOM/Babel CDN.
const order = [...template.matchAll(/<script[^>]*src=\\?"?([0-9a-f-]{36})/gi)].map(m => m[1]);
// Above regex won't match escaped quotes well; do a simpler UUID sweep on script tags.
const scriptUuids = [...template.matchAll(/src=\"([0-9a-f-]{36})\"/g)].map(m => m[1]);
const babelUuids = [...template.matchAll(/type=\"text\/babel\" src=\"([0-9a-f-]{36})\"/g)].map(m => m[1]);

fs.mkdirSync('_ui_src', { recursive: true });

function decode(uuid) {
  const e = manifest[uuid];
  if (!e) return null;
  let bytes = Buffer.from(e.data, 'base64');
  if (e.compressed) bytes = zlib.gunzipSync(bytes);
  return { mime: e.mime, text: bytes.toString('utf8'), size: bytes.length };
}

console.log('manifest assets:', Object.keys(manifest).length);
console.log('all script uuids:', scriptUuids.length, 'babel uuids:', babelUuids.length);

// Dump non-babel scripts' mime to identify CDN libs
const summary = [];
let idx = 0;
for (const uuid of babelUuids) {
  const d = decode(uuid);
  if (!d) { console.log('MISSING', uuid); continue; }
  const fn = `_ui_src/${String(idx).padStart(2,'0')}_${uuid.slice(0,8)}.jsx`;
  fs.writeFileSync(fn, d.text);
  // first non-empty line / component hints
  const firstLines = d.text.split('\n').slice(0, 3).join(' | ').slice(0, 120);
  summary.push(`${fn}  (${d.size}b)  ${firstLines}`);
  idx++;
}
console.log('\n=== babel source files extracted ===');
console.log(summary.join('\n'));
