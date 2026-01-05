#!/usr/bin/env node
const path = require('path');
const { importFromCsv } = require('./importCustomers');
const { writeReport } = require('./report');
const db = require('../models');

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node src/etl/cli.js <csv-file> [report.json]');
    process.exit(1);
  }

  const absolute = path.resolve(process.cwd(), file);
  await db.sequelize.authenticate();

  const report = await importFromCsv(absolute, { dedupe: true });
  const out = process.argv[3] || 'etl-report.json';
  writeReport(report, out);
  console.log('ETL finished. Report written to', out);
  process.exit(0);
}

run().catch(err => {console.error(err); process.exit(1);});
