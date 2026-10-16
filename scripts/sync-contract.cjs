// Copies the /public/v1/catalog schema snapshot frozen in Estoque-NY next to the
// consumer test (src/services/contract). Run it after Estoque changes the contract.
const fs = require('node:fs');
const path = require('node:path');

const SOURCE =
  process.env.CONTRACT_URL ??
  'https://raw.githubusercontent.com/LorenzoMarty/Estoque-NY/master/tests/contracts/public_catalog_v1.schema.json';
const TARGET = path.join(
  __dirname,
  '..',
  'src',
  'services',
  'contract',
  'public-catalog-v1.schema.json',
);

(async () => {
  const response = await fetch(SOURCE);
  if (!response.ok) {
    console.error(`Could not fetch ${SOURCE}: HTTP ${response.status}`);
    process.exit(1);
  }
  const body = await response.text();
  JSON.parse(body); // refuse to overwrite the copy with something that is not JSON
  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  fs.writeFileSync(TARGET, body);
  console.log(`Updated ${path.relative(process.cwd(), TARGET)}`);
})();
