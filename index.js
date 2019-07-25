const express = require('express');
const db = require('./data/db.js');
// const cors = require('cors');

const server = express();
server.use(express.json());
// server.use(cors());

const port = 4000;

server.get('/api', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Hello World',
  });
});

server.get('/api/users', (request, response) => {
  db.find()
    .then((users) => {
      response.status(200).json({
        success: true,
        users: users,
      });
    })
    .catch(() => {
      response.status(500).json({
        success: false,
        error: 'The users information could not be retrieved.',
      });
    });
});

server.get('/api/users/:id', (request, response) => {
  const { id } = request.params;

  db.findById(id)
    .then((user) => {
      user
        ? response.status(200).json({
            success: true,
            user: user,
          })
        : response.status(404).json({
            success: false,
            message: 'The user with the specified ID does not exist.',
          });
    })
    .catch(() => {
      response.status(500).json({
        success: false,
        error: 'The user information could not be retrieved.',
      });
    });
});

server.post('/api/users', (request, response) => {
  const userObject = request.body;
  const { name, bio } = userObject;

  !name || !bio
    ? response.status(400).json({
        success: false,
        error: 'Please provide name and bio for the user.',
      })
    : db
        .insert(userObject)
        .then((newUserInfo) => {
          db.findById(newUserInfo.id).then((newUser) => {
            const newUserObject = newUser;
            response.status(201).json({
              success: true,
              user: newUserObject,
            });
          });
        })
        .catch(() => {
          response.status(500).json({
            success: false,
            error: 'There was an error while saving the user to the database',
          });
        });
});

server.delete('/api/users/:id', (request, response) => {
  const { id } = request.params;

  db.findById(id)
    .then((user) => {
      user
        ? db
            .remove(id)
            .then(() => {
              response.status(200).json({
                success: true,
                deletedUser: user,
              });
            })
            .catch(() => {
              response.status(500).json({
                success: false,
                error: 'The user could not be removed',
              });
            })
        : response.status(404).json({
            success: false,
            message: 'The user with the specified ID does not exist.',
          });
    })
    .catch(() => {
      response.status(500).json({
        success: false,
        error: 'The user information could not be retrieved.',
      });
    });
});

server.put('/api/users/:id', (request, response) => {
  const { id } = request.params;
  const userObject = request.body;
  const { name, bio } = userObject;

  db.findById(id)
    .then((user) => {
      user
        ? !name && !bio
          ? response.status(400).json({
              success: false,
              error: 'Please provide name and bio for the user.',
            })
          : db
              .update(id, userObject)
              .then((count) => {
                count === 1
                  ? db.findById(id).then((user) => {
                      const newUserInfo = user;
                      response.status(200).json({
                        success: true,
                        user: newUserInfo,
                      });
                    })
                  : response.status(500).json({
                      success: false,
                      error: 'The user information was not successfully modified.',
                    });
              })
              .catch(() => {
                response.status(500).json({
                  success: false,
                  error: 'The user information could not be modified.',
                });
              })
        : response.status(404).json({
            success: false,
            message: 'The user with the specified ID does not exist.',
          });
    })
    .catch(() => {
      response.status(500).json({
        success: false,
        error: 'The user information could not be retrieved.',
      });
    });
});

server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
