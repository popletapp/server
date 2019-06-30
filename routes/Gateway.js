import express from 'express';
const router = express.Router();

router.get('/connect', function (req, res, next) {
  res.status(200).send({ online: true });
})

router.get('/', function (req, res, next) {
  res.status(200).send('Welcome to the Poplet API!');
})

export default router;