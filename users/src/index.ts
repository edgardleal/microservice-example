/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

 import * as express from 'express';
 import axios from 'axios';
 import * as morgan from 'morgan';

const users = [
  {
    email: 'teste@teste.com',
    name: 'Teste',
    addressId: 0,
  },
  {
    email: 'teste2@teste.com',
    name: 'Outro Teste',
    addressId: 1,
  },
];

function loadAddress(user) {
  return axios.get(`http://address:3000/${user.addressId}`)
      .then(response => response.data)
      .then(address => ({ ...user, address }));
}

function loadUsers(req, res, next) {
  return users.reduce((promise, user) => promise.then(() => loadAddress(user)), Promise.resolve())
    .then(users => {
      res.json(users);
      return users;
    })
    .catch(next);
}

const result200 = loadUsers;
const result500 = (req, res, next) => next(new Error('Internal server error'));
const resultTimeout = (req, res, next) => setTimeout(() => loadUsers(req, res, next), 1000);

const STATUS_LIST = [
  result200,
  result200,
  result500,
  result200,
  result200,
  resultTimeout,
  result200,
  result200,
];

const server = express();

server.use(morgan('dev'));

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
