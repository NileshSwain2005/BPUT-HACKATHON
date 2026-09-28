/**
 * Utility functions to cleanly sanitize input data before Prisma queries,
 * preventing Prisma type validation errors (e.g. empty strings for Float/Int/DateTime/Relations).
 */

function cleanFloat(val) {
  if (val === undefined) return undefined;
  if (val === null || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

function cleanInt(val) {
  if (val === undefined) return undefined;
  if (val === null || val === '') return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
}

function cleanDate(val) {
  if (val === undefined) return undefined;
  if (val === null || val === '') return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function cleanId(val) {
  if (val === undefined) return undefined;
  if (val === null || typeof val !== 'string' || val.trim() === '') return null;
  return val.trim();
}

function cleanString(val) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  return String(val).trim();
}

function cleanBoolean(val) {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === 1 || val === '1') return true;
  if (val === 'false' || val === 0 || val === '0') return false;
  return Boolean(val);
}

// Strip metadata fields that should never be passed to Prisma update/create data
function stripMetadata(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const {
    id,
    createdAt,
    updatedAt,
    _count,
    organization,
    project,
    reportingPeriod,
    metric,
    document,
    evidence,
    users,
    children,
    parent,
    ...rest
  } = obj;
  return rest;
}

module.exports = {
  cleanFloat,
  cleanInt,
  cleanDate,
  cleanId,
  cleanString,
  cleanBoolean,
  stripMetadata,
};
