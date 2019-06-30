export default (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(403).send('You need to be authorized to use this endpoint.');
    return;
  }
}