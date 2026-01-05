const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { normalizePhone, validateEmail, splitName, normalizeName } = require('./cleaners');
const db = require('../models');
const logger = require('../lib/logger');

async function importFromCsv(filePath, options = { dedupe: true }) {
  const content = fs.readFileSync(filePath);
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });

  const report = { total: records.length, inserted: 0, skipped: 0, errors: [] };

  for (const row of records) {
    try {
      // map potential headers (support Turkish headers and common variants)
      const get = (...keys) => {
        for (const k of keys) {
          if (
            Object.prototype.hasOwnProperty.call(row, k) &&
            row[k] !== undefined &&
            row[k] !== null
          ) {
            const v = String(row[k]).trim();
            if (v !== '') return v;
          }
        }
        return null;
      };

      const rawName = get(
        'name',
        'Name',
        'fullname',
        'full_name',
        'firstName',
        'first_name',
        'Ad',
        'ad',
        'Adı'
      );
      const rawLast = get('lastName', 'last_name', 'surname', 'Soyad', 'soyad', 'Soyadı');
      const combinedName = rawName && rawLast ? `${rawName} ${rawLast}` : rawName || rawLast;
      const { firstName, lastName } = splitName(combinedName);

      const phone = normalizePhone(
        get('phone', 'Phone', 'telephone', 'telefon', 'Telefon', 'TelefonNo', 'mobile', 'TelefonNo')
      );
      const emailRaw = get('email', 'Email', 'mail', 'e-posta', 'eposta');
      const email = validateEmail(emailRaw);

      const payload = {
        firstName: normalizeName(firstName) || rawName || null,
        lastName: normalizeName(lastName) || rawLast || null,
        phone: phone || null,
        email: email || null,
        address: get('address', 'Address', 'adres', 'Adres') || null,
        note: get('note', 'Note', 'not', 'Not') || null,
      };

      // basic validation
      if (!payload.firstName) {
        report.errors.push({ row, reason: 'missing_first_name' });
        report.skipped++;
        continue;
      }

      // dedupe check
      if (options.dedupe) {
        const dup = await detectDuplicate(payload);
        if (dup) {
          // merge strategy: keep existing, but update missing fields
          const existing = dup;
          const updates = {};
          if (!existing.phone && payload.phone) updates.phone = payload.phone;
          if (!existing.email && payload.email) updates.email = payload.email;
          if (!existing.address && payload.address) updates.address = payload.address;
          if (!existing.lastName && payload.lastName) updates.lastName = payload.lastName;
          if (!existing.firstName && payload.firstName) updates.firstName = payload.firstName;

          if (Object.keys(updates).length > 0) await existing.update(updates);
          report.skipped++;
          continue;
        }
      }

      await db.Customer.create(payload);
      report.inserted++;
    } catch (err) {
      report.errors.push({ row, reason: err.message });
    }
  }

  return report;
}

async function detectDuplicate(payload) {
  // Try by phone first
  if (payload.phone) {
    const found = await db.Customer.findOne({ where: { phone: payload.phone } });
    if (found) return found;
  }

  // Try by email
  if (payload.email) {
    const found = await db.Customer.findOne({ where: { email: payload.email } });
    if (found) return found;
  }

  // Try by name (exact match lowered)
  if (payload.firstName) {
    const found = await db.Customer.findOne({
      where: db.Sequelize.where(
        db.Sequelize.fn('lower', db.Sequelize.col('first_name')),
        payload.firstName.toLowerCase()
      ),
    });
    if (found) return found;
  }

  return null;
}

module.exports = { importFromCsv };
