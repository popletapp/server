import express from 'express';
const router = express.Router();
import { Blog } from './../funcs';
import { authorization, permissions } from './../util';

router.post(`/create`, authorization, (req, res, next) => {
  if (permissions.isDeveloper(req.user.id)) {
    Blog.create(req.body)
      .then(posts => posts ? res.status(200).json(posts) : res.status(500))
      .catch(err => next(err));
  }
})

router.get(`/posts`, (req, res, next) => {
  Blog.getMultiple()
    .then(posts => posts ? res.status(200).json(posts) : res.status(500))
    .catch(err => next(err));
})

router.get(`/post/:id`, (req, res, next) => {
  Blog.get(req.params.id, req.user.id)
    .then(posts => posts ? res.status(200).json(posts) : res.status(500))
    .catch(err => next(err));
})

export default router;