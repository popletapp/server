
const Permissions = {
  0: 'USER',
  8: 'ADMINISTRATOR', // Board Owner
  16: 'MODERATOR',
  32: 'EDITOR'
}
// Make it so all permissions are accessible by their bitfield and name
for (const permission in this.PERMISSIONS) {
  PERMISSIONS[PERMISSIONS[permission]] = permission;
}

const DEVELOPER_IDS = [
  '222082558807022'
]

class PermissionsHandler {
  constructor (member, board) {
    this.member = member;
    this.board = board;
  }

  get PERMISSIONS () {
    return Permissions;
  }

  static isDeveloper (id) {
    return DEVELOPER_IDS.includes(id || this.member.id);
  }

  get () {
    let bitfield = 0;

    for (const rank of this.member.ranks) {
      bitfield |= rank.permissions;
    }

    if (PermissionsHandler.isDeveloper(this.member.id)) {
      return this.PERMISSIONS;
    }

    if (this.board.owner === this.member.id) {
      return this.PERMISSIONS;
    }

    if (bitfield & this.PERMISSIONS.ADMINISTRATOR === this.PERMISSIONS.ADMINISTRATOR) {
      return this.PERMISSIONS;
    }

    const has = {};
    for (const permission in this.PERMISSIONS) {
      has[permission] = has[this.PERMISSIONS[permission]] = (bitfield & permission) === bitfield;
    }
    return has;
  }
  
  has (permission) {
    const all = this.get();
    console.log(all)
    return all[permission];
  }
}

export default PermissionsHandler;
export { Permissions };