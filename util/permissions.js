let PERMISSIONS = {
  8: 'ADMINISTRATOR',
}

// Make it so all permissions are accessible by their bitfield and name
for (const permission in PERMISSIONS) {
  PERMISSIONS[PERMISSIONS[permission]] = permission;
}

function get (bitfield) {
  const has = {};
  for (const permission in PERMISSIONS) {
    has[permission] = has[PERMISSIONS[permission]] = (bitfield & permission) === bitfield;
  }
}

function has (permission) {
  const all = get();
  return all[permission];
}

export default { get, has }