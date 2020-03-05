import express from 'express';
const router = express.Router();
import { authorization } from './../util'
import { Note } from './../funcs';



router.get(`/:id`, authorization, function (req, res, next) {
  if (req.params.id === 'multiple') {
    Note.getMultiple(req.body.ids)
        .then(notes => notes ? res.json(notes) : res.status(404))
        .catch(err => next(err));
  } else {
    Note.get(req.body.id)
        .then(note => note ? res.json(note) : res.status(404))
        .catch(err => next(err));
  }
})

export default router;