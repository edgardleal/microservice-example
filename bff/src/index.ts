/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

const express = require('express');
import axios, { AxiosError } from 'axios';
const morgan = require('morgan');

const server = express();

server.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

const instance = axios.create({
  baseURL: 'http://users:3000',
  timeout: 800,
});


const tryRequest = (req, res, tries = 0) => {
  return instance
    .get('/')
    .then(response => response.data)
    .then(res.json.bind(res))
    .catch((error: AxiosError) => {
      if (tries < 20) {
        tryRequest(req, res, tries + 1);
      } else {
        console.error(error.message);
        res.status((error.response || { status: 500 }).status);
        res.end(error.message);
      }
    });
};

server.get('/users', (req, res) => {
  tryRequest(req, res);
});

server.listen(PORT, err => {
  if (err) {
    console.error(err);
  }
  console.log(`Listeining on port ${PORT}`);
});
