const fs = require('fs');

function writeReport(report, outPath) {
  const summary = {
    total: report.total,
    inserted: report.inserted,
    skipped: report.skipped,
    errors: report.errors.length
  };
  const full = { summary, errors: report.errors };
  fs.writeFileSync(outPath, JSON.stringify(full, null, 2));
}

module.exports = { writeReport };
