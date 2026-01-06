const { Customer } = require('../models');
const { Op } = require('sequelize');

function normalizePhone(phone) {
  if (!phone) return null;
  return phone
    .toString()
    .replace(/[^0-9]/g, '')
    .replace(/^0+/, '');
}

function normalizeName(name) {
  if (!name) return null;
  return name.trim().toLowerCase();
}

async function findByPhone(normalizedPhone) {
  if (!normalizedPhone) return null;
  // Fetch candidates with non-null phone and compare normalized
  const candidates = await Customer.findAll({
    where: {
      phone: {
        [Op.ne]: null,
      },
    },
  });

  for (const c of candidates) {
    const cPhoneNorm = normalizePhone(c.phone);
    if (cPhoneNorm && cPhoneNorm === normalizedPhone) return c;
  }
  return null;
}

async function findByName(firstName, lastName) {
  if (!firstName) return null;
  const f = normalizeName(firstName);
  const l = normalizeName(lastName) || '';

  const where = {
    [Op.and]: [
      Customer.sequelize.where(
        Customer.sequelize.fn('lower', Customer.sequelize.col('first_name')),
        f
      ),
    ],
  };

  if (l) {
    where[Op.and].push(
      Customer.sequelize.where(
        Customer.sequelize.fn('lower', Customer.sequelize.col('last_name')),
        l
      )
    );
  }

  const found = await Customer.findOne({ where });
  return found;
}

async function findDuplicate(payload) {
  const phoneNorm = normalizePhone(payload.phone);
  if (phoneNorm) {
    const byPhone = await findByPhone(phoneNorm);
    if (byPhone) return { reason: 'phone', customer: byPhone };
  }

  // Check for email duplicate
  if (payload.email) {
    const byEmail = await Customer.findOne({
      where: { email: payload.email.toLowerCase() },
    });
    if (byEmail) return { reason: 'email', customer: byEmail };
  }

  const byName = await findByName(payload.firstName, payload.lastName);
  if (byName) return { reason: 'name', customer: byName };

  return null;
}

module.exports = {
  normalizePhone,
  normalizeName,
  findDuplicate,
};
