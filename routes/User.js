import express from 'express';
const router = express.Router();
import { authorization } from './../util'
import { User } from './../funcs';

router.post(`/register`, async (req, res, next) => {
  await User.create(req.body)
        .then(user => user ? res.status(200).json(user) : res.status(403))
        .catch(err => res.status(err.code).json(err.message));
})

router.post(`/logout`, (req, res, next) => {
  User.logout(req.user.id)
        .then(() => res.status(205))
        .catch(err => res.status(500).json(err.message));
})

router.post(`/authenticate`, async (req, res, next) => {
  await User.authenticate(req.body)
        .then(user => user ? res.status(200).json(user) : res.status(403).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
})

router.get(`/me/boards`, authorization, (req, res, next) => {
  console.log(`${req.user.id} is requesting a list of all boards`)
  User.listBoards(req.user.id)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

router.get(`/me`, authorization, async (req, res, next) => {
  await User.get(req.user.id)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

router.get(`/:id/boards`, authorization, (req, res, next) => {
  console.log(`${req.params.id} is requesting a list of all boards`)
  User.listBoards(req.params.id)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

router.get(`/:id`, authorization, async (req, res, next) => {
  await User.get(req.params.id)
        .then(user => user ? res.status(200).json(user) : res.status(403))
        .catch(err => next(err));
})

export default router;