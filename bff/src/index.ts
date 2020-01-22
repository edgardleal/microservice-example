/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

import * as express from 'express';

import * as morgan from 'morgan';

import axios from 'axios';
const server = express();

server.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

server.get('/users', (req, res) => {
  axios.get('http://users:3000/')
    .then(response => response.data)
    .then(res.json.bind(res))
    .catch(error => {
      console.error(error);
      res.status((error.response || { status: 500 }).status);
      res.json(error);
    });
});

server.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`Listeining on port ${PORT}`);
});

