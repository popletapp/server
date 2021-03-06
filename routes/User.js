import express from 'express';
const router = express.Router();
import { authorization } from './../util'
import { User, Notification } from './../funcs';

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
  User.listBoards(req.user.id)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

router.get(`/me/notifications`, authorization, async (req, res, next) => {
  if (!req.query) {
    req.query = {};
  }
  await Notification.get(req.user.id, req.query.type, req.query.limit, req.query.position)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

router.get(`/me/home`, authorization, async (req, res, next) => {
  await User.getHomeContent(req.user.id)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

// Add friend
router.post(`/me/friends/:friend`, authorization, async (req, res, next) => {
  await User.addFriend(req.user.id, req.params.friend)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

// Accept friend
router.post(`/me/friends/accept/:friend`, authorization, async (req, res, next) => {
  User.acceptFriendRequest(req.user.id, req.params.friend)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

// Edit friend
router.patch(`/me/friends/:friend`, authorization, async (req, res, next) => {
  await User.editFriend(req.user.id, req.params.friend, req.body)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

// Delete friend
router.delete(`/me/friends/:friend`, authorization, async (req, res, next) => {
  await User.removeFriend(req.user.id, req.params.friend)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

// Get pending friends
router.get(`/me/friends/pending`, authorization, async (req, res, next) => {
  await User.getPendingFriendRequests(req.user.id)
        .then(user => user ? res.json(user) : res.status(400))
        .catch(err => next(err));
})

// Get friends
router.get(`/me/friends`, authorization, async (req, res, next) => {
  await User.getFriends(req.user.id)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

router.get(`/me`, authorization, async (req, res, next) => {
  await User.get(req.user.id, true)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

router.get(`/:id/boards`, authorization, (req, res, next) => {
  User.listBoards(req.params.id)
        .then(user => user ? res.json(user) : res.status(403))
        .catch(err => next(err));
})

router.patch(`/:id`, authorization, async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return res.status(403);
  }
  User.edit(req.params.id, req.body)
        .then(user => user ? res.status(200).json(user) : res.status(403))
        .catch(err => next(err));
})

router.get(`/:id`, authorization, async (req, res, next) => {
  await User.get(req.params.id, req.user.id === req.params.id)
        .then(user => user ? res.status(200).json(user) : res.status(403))
        .catch(err => next(err));
})

export default router;