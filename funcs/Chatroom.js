import models from './../models';

async function create (obj) {
  const id = Math.floor(Math.random() * 5e14).toString();
  const chatroom = {
    id,
    createdAt: Date.now(),
    name: `${obj.name}'s chatroom` || null,
    avatar: obj.avatar || null,
    members: [ obj.user ],
    lastMessage: null,
    messages: [
      {
        author: {
          id: 0,
          username: 'Poplet Helper',
          avatar: null,
          createdAt: Date.now()
        },
        content: 'Hey there! Need any help ah fuck it this is just a placeholder why am i putting so much god damn effort into this'
      }
    ]
  };

  if (!obj.boardID) {
    throw 'A board ID needs to be provided in the request body';
  }
  try {
    await models.Board.updateOne({ id: obj.boardID }, {
      $addToSet: {
        'chatrooms': id
      }
    });
  } catch (e) {
    throw 'Error whilst trying to apply chatroom to board, make sure the board exists and is valid.';
  }
  const dbChatroom = new models.Chatroom(chatroom);
  await dbChatroom.save();

  return chatroom;
}

async function comment (obj) {
  const comment = {
    id: Math.floor(Math.random() * 3e14),
    timestamp: Date.now(),
    author: obj.author,
    content: obj.content
  };
  const dbComment = new models.ChatroomComment(comment);
  await dbComment.save();
}

async function getComment (id) {
  return await models.ChatroomComment.findOne({ id });
}

async function get (id) {
  return await models.Chatroom.findOne({ id });
}

export default {
  create,
  comment,
  getComment,
  get
}