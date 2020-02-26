export default (returnMember = false) => {
  const member = {
    id: 0,
    joinedAt: new Date().toISOString(),
    nickname: null,
    ranks: []
  }

  return {
    createdAt: new Date(1561903200000).toISOString(),
    username: 'Pippo',
    email: null,
    avatar: null,
    ...(returnMember ? member : {})
  }
}