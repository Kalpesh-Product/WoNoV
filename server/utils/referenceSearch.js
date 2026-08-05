const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSearchRegex = (search, maxLength = 100) => {
  const normalizedSearch = String(search || "")
    .trim()
    .slice(0, maxLength);
  if (!normalizedSearch) return null;
  return new RegExp(escapeRegex(normalizedSearch), "i");
};

const idsFrom = (documents) => documents.map(({ _id }) => _id);

/**
 * Resolves a search regex against referenced collections into arrays of _ids.
 * lookups: [{ key, model, fields, extraFilter? }]
 * Returns: { [key]: ObjectId[] }
 */
const resolveReferenceIds = async (searchRegex, lookups = []) => {
  if (!searchRegex || !lookups.length) return {};

  const results = await Promise.all(
    lookups.map(({ model, fields, extraFilter = {} }) =>
      model
        .find({
          ...extraFilter,
          $or: fields.map((field) => ({ [field]: searchRegex })),
        })
        .select("_id")
        .lean(),
    ),
  );

  return lookups.reduce((acc, { key }, index) => {
    acc[key] = idsFrom(results[index]);
    return acc;
  }, {});
};

module.exports = {
  escapeRegex,
  buildSearchRegex,
  idsFrom,
  resolveReferenceIds,
};
