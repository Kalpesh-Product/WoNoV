export const groupPermissionsByModule = (permissionsObj = {}) =>
  Object.entries(permissionsObj).reduce((grouped, [key, permission]) => {
    const [module] = key.split("_");
    if (!grouped[module]) grouped[module] = [];

    grouped[module].push({
      key,
      action: permission.value,
      type: permission.type,
      access: permission.access,
      title: permission.title,
    });

    return grouped;
  }, {});

export const getModuleDisplayName = (module) => {
  const normalized = String(module || "").toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
