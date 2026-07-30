export function buildPermissionMatrix(permissionCatalog) {
  const matrix = {};
  permissionCatalog.forEach((perm) => {
    const [resource, action] = perm.split(":");
    if (!resource || !action) return;
    if (!matrix[resource]) matrix[resource] = new Set();
    matrix[resource].add(action);
  });
  return matrix;
}
