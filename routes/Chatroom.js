import express from 'express';
const router = express.Router();
import { authorization } from './../util';
import { Chatroom } from './../funcs';

router.get(`/:id/comments`, authorization, function (req, res, next) {
  Chatroom.getComments(req.params.id) // if 100 messages have been read, postion should be 100
        .then(comments => comments ? res.status(200).json(comments) : res.status(404))
        .catch(err => next(err));
})

router.put(`/:id/comments`, authorization, function (req, res, next) {
  Chatroom.comment({ chatroom: req.params.id, ...req.body })
        .then(comment => comment ? res.status(200).json(comment) : res.status(404))
        .catch(err => next(err));
})

router.get(`/:id`, function (req, res, next) {
  Chatroom.get(req.params.id)
        .then(chatroom => chatroom ? res.status(200).json(chatroom) : res.status(404))
        .catch(err => next(err));
})

router.put(`/:id`, authorization, function (req, res, next) {
  Chatroom.create(req.body)
        .then(chatroom => chatroom ? res.status(200).json(chatroom) : res.status(403))
        .catch(err => next(err));
})

router.patch(`/:id`, authorization, function (req, res, next) {
  Chatroom.update(req.body)
        .then(chatroom => chatroom ? res.status(200).json(chatroom) : res.status(404))
        .catch(err => next(err));
})


router.delete(`/:id`, authorization, function (req, res, next) {
  Chatroom.del(req.body)
        .then(() => res.status(200).json({ success: `Chatroom deleted` }))
        .catch(err => next(err));
})

export default router;