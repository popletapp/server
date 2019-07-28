import axios from 'axios';
import config from './../config';

exports.handle = async ({ client, data }) => {
  await axios.post(`https://discordapp.com/api/webhooks/605019997663920178/${config.webhookToken}`, data);
}