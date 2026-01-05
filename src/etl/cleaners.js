const normalizePhone = (phone) => {
  if (!phone) return null;
  const s = String(phone).trim();
  // remove non-digit characters
  let digits = s.replace(/[^0-9+]/g, '');
  // replace leading +90 or 90 with empty, keep national without leading 0
  digits = digits.replace(/^\+?90/, '');
  digits = digits.replace(/^0+/, '');
  if (digits.length === 10) return digits; // e.g., 5551112233
  if (digits.length > 10) return digits.slice(-10);
  return digits;
};

const validateEmail = (email) => {
  if (!email) return false;
  const s = String(email).trim().toLowerCase();
  // simple regex, not RFC full
  return /^\S+@\S+\.\S+$/.test(s) ? s : false;
};

const splitName = (fullName) => {
  if (!fullName) return { firstName: null, lastName: null };
  const s = String(fullName).trim().replace(/\s+/g, ' ');
  const parts = s.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
};

const normalizeName = (name) => {
  if (!name) return null;
  return String(name).trim().replace(/\s+/g, ' ');
};

module.exports = {
  normalizePhone,
  validateEmail,
  splitName,
  normalizeName
};
