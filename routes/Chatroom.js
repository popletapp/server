import express from 'express';
const router = express.Router();
import { authorization } from './../util';
import { Chatroom } from './../funcs';

router.get(`/comment/:id`, authorization, function (req, res, next) {
  Chatroom.getComment(req.params.id)
        .then(comment => comment ? res.status(200).json(comment) : res.status(404))
        .catch(err => next(err));
})

router.post(`/comment/:id`, authorization, function (req, res, next) {
  Chatroom.comment(req.body)
        .then(() => res.status(200).json({ success: `Chatroom created` }))
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