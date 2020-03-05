export default (returnMember = false) => {
  const member = {
    id: 0,
    joinedAt: Date.now(),
    nickname: null,
    ranks: []
  }

  return {
    createdAt: 1561903200000,
    username: 'Pippo',
    email: null,
    avatar: null,
    ...(returnMember ? member : {})
  }
}