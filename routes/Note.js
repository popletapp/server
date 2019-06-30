import express from 'express';
const router = express.Router();
import { authorization } from './../util'
import { Note } from './../funcs';

router.post(`/create`, authorization, function (req, res, next) {
  Note.create({ ...req.body, user: req.user })
        .then(() => res.status(200).json({ success: `Note created` }))
        .catch(err => next(err));
})

router.post(`/:id`, authorization, function (req, res, next) {
  if (req.params.id === 'multiple') {
    Note.getMultiple(req.body.ids)
        .then(notes => notes ? res.status(200).json(notes) : res.status(404))
        .catch(err => next(err));
  } else {
    Note.get(req.body.id)
        .then(note => note ? res.status(200).json(note) : res.status(404))
        .catch(err => next(err));
  }
})

export default router;