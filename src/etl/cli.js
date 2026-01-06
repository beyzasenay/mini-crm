const { importFromCsv } = require('./importCustomers');
const { writeReport } = require('./report');
const db = require('../models');

async function run() {
  const file = process.argv[2];
  if (!file) {
    throw new Error('Usage: node src/etl/cli.js <csv-file> [report.json]');
  }

  const absolute = require('path').resolve(process.cwd(), file);
  await db.sequelize.authenticate();

  const report = await importFromCsv(absolute, { dedupe: true });
  const out = process.argv[3] || 'etl-report.json';
  writeReport(report, out);
  console.log('ETL finished. Report written to', out);
}

run().catch(err => {
  console.error(err);
  throw err;
});
