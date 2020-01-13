/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

const express = require('express');
const users = [
  {
    email: 'teste@teste.com',
    name: 'Teste',
  },
];

const result200 = (req, res) => res.json(users);
const result500 = (req, res, next) => next(new Error('Internal server error'));
const resultTimeout = (req, res) => setTimeout(() => res.json(users), 10000);

const STATUS_LIST = [
  result200,
  result500,
  resultTimeout,
];

const server = express();

const PORT = process.env.PORT || 3000;

server.get('/', (req, res, next) => {
  const index = Math.random() * (STATUS_LIST.length - 1);
  const status = STATUS_LIST[Math.round(index)];
  status(req, res, next);
});

server.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  }

  console.log(`Listeining on port ${PORT}`);

});

module.exports = {

};
