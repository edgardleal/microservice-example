/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

const express = require('express');

/**
 * Accepts just one request at time
 */
let locked = false;

const TIME_TO_RESPOND = 300;

const address_list = [
  {
    id: 0,
    name: 'Rua A',
  },
  {
    id: 1,
    name: 'Rua B',
  },
  {
    id: 2,
    name: 'Rua B',
  },
  {
    id: 3,
    name: 'Rua C',
  },
  {
    id: 4,
    name: 'Rua D',
  },
];

const result200 = (req, res) => res.json(address_list);
const result500 = (req, res, next) => next(new Error('Internal server error'));
const resultTimeout = (req, res) => setTimeout(() => res.json(address_list), 10000);

const server = express();

const PORT = process.env.PORT || 3000;

server.get('/:id', (req, res, next) => {
  if (locked) {
    res.status(429);
    res.end('Too many requests');
    return;
  }
  locked = true;
  const id = req.params.id;
  const result = address_list[id];
  if (!result) {
    res.status(404);
  }
  setTimeout(() => {
    locked = false;
    res.json(result);
  }, TIME_TO_RESPOND);
});

server.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  }

  console.log(`Listeining on port ${PORT}`);

});

module.exports = {

};
