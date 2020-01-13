/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

const express = require('express');
const axios = require('axios');

const server = express();

const PORT = process.env.PORT || 3000;

server.get('/users', (req, res) => {
  axios.get('http://users:3000/')
    .then(res.json)
    .catch(res.json);
});

server.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`Listeining on port ${PORT}`);
});

