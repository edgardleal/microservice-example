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

server.get('/users', (req, res) => {
  const instance = axios.create({
    baseURL: 'http://users:3000',
    timeout: 800,
  });
  instance.get('/')
    .then(response => response.data)
    .then(res.json.bind(res))
    .catch((error: AxiosError) => {

      const retry = () => {
        return instance.get('/').then(response => response.data);
      };
      console.error(error.message);

      retry().then(res.json.bind(res)).catch(e => {
        retry().then(res.json.bind(res)).catch(error => {
          res.status((error.response || { status: 500 }).status);
          console.error(error.message);
          res.end(error.message);
        });
      });
    });
});

server.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`Listeining on port ${PORT}`);
});

