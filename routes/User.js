import express from 'express';
const router = express.Router();
import { authorization } from './../util'
import { User } from './../funcs';

router.post(`/register`, (req, res, next) => {
  User.create(req.body)
        .then(user => user ? res.status(200).json({ success: `User ${user.username} created with ID ${user.id}` }) : res.status(500))
        .catch(err => next(err));
})

router.post(`/authenticate`, (req, res, next) => {
  User.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(403).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
})

router.get(`/me`, authorization, (req, res, next) => {
  User.get(req.user.id)
        .then(user => user ? res.json(user) : res.status(404))
        .catch(err => next(err));
})

router.get(`/:id/boards`, authorization, (req, res, next) => {
  console.log(`${req.params.id} is requesting a list of all boards`)
  User.get(req.params.id)
        .then(user => user ? res.json(user.boards) : res.status(404))
        .catch(err => next(err));
})

router.get(`/:id`, authorization, (req, res, next) => {
  const user = User.get(req.params.id)
        .catch(err => next(err));
  res.status(200).send(JSON.stringify({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    createdAt: user.createdAt,
  }))
})

export default router;