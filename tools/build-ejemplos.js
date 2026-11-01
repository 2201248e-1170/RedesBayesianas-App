/*
 * Genera src/ejemplos.generated.js a partir de ejemplos/*.json
 * (así la app puede cargar los ejemplos aunque se abra con doble clic, sin servidor).
 *
 * Uso:  node tools/build-ejemplos.js      (o: npm run build:ejemplos)
 * Ejecútenlo cada vez que agreguen o cambien un ejemplo. La prueba "ejemplos.generated
 * está al día" falla si se les olvida.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function build() {
  const dir = path.join(root, 'ejemplos');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const list = files.map((f) => ({ file: f, net: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
  return (
    '// ARCHIVO GENERADO por tools/build-ejemplos.js — no editar a mano.\n' +
    'globalThis.BN = globalThis.BN || {};\n' +
    'BN.EJEMPLOS = ' + JSON.stringify(list, null, 1) + ';\n'
  );
}

module.exports = { build };

if (require.main === module) {
  const out = path.join(root, 'src', 'ejemplos.generated.js');
  fs.writeFileSync(out, build());
  console.log('Escrito ' + path.relative(root, out));
}
