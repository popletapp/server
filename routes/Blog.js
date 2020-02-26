import express from 'express';
const router = express.Router();
import { BlogPost } from './../funcs';
import { authorization, permissions } from './../util';

router.get(`/create`, authorization, (req, res, next) => {
  if (permissions.isDeveloper(req.user.id)) {
    BlogPost.create(req.params.id, req.user.id)
      .then(notes => notes ? res.status(200).json(notes) : res.status(500))
      .catch(err => next(err));
  }
})

router.get(`/post/:id`, (req, res, next) => {
  BlogPost.get(req.params.id, req.user.id)
    .then(notes => notes ? res.status(200).json(notes) : res.status(500))
    .catch(err => next(err));
})

export default router;