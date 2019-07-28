import express from 'express';
const router = express.Router();
import { Invite } from './../funcs';
import { authorization } from './../util';

router.get(`/:id`, authorization, (req, res, next) => {
  Invite.get(req.params.id)
      .then(invite => res.status(200).json(invite))
      .catch(err => next(err));
})

export default router;