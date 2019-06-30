import express from 'express';
const router = express.Router();
import { Board } from './../funcs';
import { authorization } from './../util';

router.post(`/create`, authorization, (req, res, next) => {
  Board.create({ ...req.body, user: req.user })
        .then(board => board ? res.json({ success: `Board created` }) : res.status(500))
        .catch(err => next(err));
})

router.post(`/join/:id`, authorization, (req, res, next) => {
  Board.join(req.params.id, req.user)
        .then(() => res.status(200).json({ success: `Board joined` }))
        .catch(err => next(err));
})

router.post(`/leave/:id`, authorization, (req, res, next) => {
  Board.leave(req.params.id, req.user)
        .then(() => res.status(200).json({ success: `Board left` }))
        .catch(err => next(err));
})

router.get(`/:id`, authorization, (req, res, next) => {
  Board.get(req.params.id)
        .then(board => board ? res.status(200).json(board) : res.status(404))
        .catch(err => next(err));
})

export default router;