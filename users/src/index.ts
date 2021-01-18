/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

const axios = require('axios');
// const jaeger = require('jaeger-client');
import { initTracer } from 'jaeger-client';
import {
  Span,
  SpanOptions,
  FORMAT_HTTP_HEADERS,
} from 'opentracing';
import * as express from 'express';


// const { initTracerFromEnv } = jaeger;

const tracker = initTracer({
  serviceName: 'users',
  reporter: {
    logSpans: true,
    agentHost: 'jaeger',
    agentPort: 5775,
    collectorEndpoint: 'http://jaeger:14268/api/traces',
  },
  sampler: {
    type: 'const',
    param: 1,
    host: 'jaeger',
    hostPort: '5775',
    port: 5775,
  },
}, {
  logger: {
    info: console.log,
    error: console.log,
  },
});

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

function loadAddress(user, res: any) {
  
  const span = tracker.startSpan('address', {
    childOf: res.span,
  });
  const config = {
    headers: {
      'Request-Id': span.context().toTraceId(),
    },
  };
  tracker.inject(
    span,
    FORMAT_HTTP_HEADERS,
    config.headers,
  );
  return axios.get(
    `http://address:3000/${user.addressId}`,
    config,
  )
    .then(response => response.data)
    .then(address => ({ ...user, address }))
    .then((address) => {
      
      span.finish();
      return address;
    });
}

function loadUsers(req, res, next) {
  const result = [];
  return users.reduce((promise, user) => promise
    .then(() => loadAddress(user, res).then((u) => result.push(u))),
    Promise.resolve())
    .then(users => {
      res.json(result);
      return users;
    })
    .catch(next);
}

const result200 = loadUsers;
const result500 = (req, res, next) => next(new Error('Internal server error'));
const resultTimeout = (req, res, next) => setTimeout(() => loadUsers(req, res, next), 1000);

const STATUS_LIST = [
  result200,
  // result500,
  result200,
  resultTimeout,
  result200,
];

const server = express();

const PORT = process.env.PORT || 3000;

server.use((
  req: express.Request,
  res: express.Response,
  next,
) => {
  const context = tracker.extract(
    FORMAT_HTTP_HEADERS,
    req.headers,
  );
  const span = tracker.startSpan('http', {
    childOf: context,
  });
  res.span = span;
  tracker.inject(span, FORMAT_HTTP_HEADERS, res.header);
  res.on('finish', () => {
    console.log('Finishing a request.'); // eslint-disable-line
    
    span.finish();
  });
  
  next();
});

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
