import user from '../../funcs/User';

export default async (client, data) => {
  const { username, password } = data;
  try {
    const auth = user.authenticate({ username, password });
    if (auth) {
      client.emit('connect', { authToken: auth.token, userID: auth.userID });
    }
  } catch (error) {
    client.emit('unauthorized', { message: 'Client authorization failure' });
  }
};