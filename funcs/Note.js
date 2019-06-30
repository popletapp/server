import models from './../models';

async function create (obj) {
  const id = Math.floor(Math.random() * 6e14);
  const note = {
    id,
    title: obj.title || null,
    content: obj.content || null,
    createdAt: Date.now(),
    createdBy: obj.user,
    modifiedAt: Date.now(),
    modifiedBy: obj.user,
    labels: [],
    assignees: [],
    options: obj.options || {}
  };
  models.Note.create(note, () => {
    res.status(200)
  })

  const dbNote = new models.Note(note);
  await dbNote.save();

  if (!obj.boardID) {
    throw 'A board ID needs to be provided in the request body';
  }
  try {
    models.Board.updateOne({ id: obj.boardID }, {
      $push: {
        notes: id
      }
    });
  } catch (e) {
    throw 'Error whilst trying to apply note to board, make sure the board exists and is valid.';
  }
  return id;
}

async function getMultiple (array) {
  return await models.Note.find({ id: { $in: array } });
}

async function get (id) {
  return await models.Note.findOne({ id });
}

export default {
  create,
  getMultiple,
  get
}