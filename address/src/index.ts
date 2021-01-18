/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

import { initTracer } from 'jaeger-client';
import {
  Span,
  SpanOptions,
  FORMAT_HTTP_HEADERS,   
} from 'opentracing';
import * as express from 'express';

const tracker = initTracer({
  serviceName: 'address',
  reporter: {
    logSpans: false,
    agentHost: 'jaeger',
    agentPort: 5775,
    collectorEndpoint: 'http://jaeger:14268/api/traces',
  },
  sampler: {
    // type: 'probabilistic',
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

server.use((
  req: express.Request,
  res: express.Response,
  next,
) => {
  const context = tracker.extract(FORMAT_HTTP_HEADERS, req.headers);
  const options: SpanOptions = {
    tags: [req.headers['request-id']],
    childOf: context,
    // childOf: req.headers['request-id'],
  };
  const span: Span = tracker.startSpan('http', options);
  span.setTag('request-id', req.headers['request-id']);
  tracker.inject(span, FORMAT_HTTP_HEADERS, res.header);
  (req as any).span = span;
  res.on('finish', () => {
    console.log('Finishing a request.'); // eslint-disable-line
    
    span.setTag('http.status_code', 200);
    span.finish();
  });
  
  next();
});

const PORT = process.env.PORT || 3000;

server.get('/:id', (req, res, next) => {
  console.log('Headers: %o', req.headers); // eslint-disable-line
  
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
    console.log('Responding for address'); // eslint-disable-line
    
    res.json(result);
  }, TIME_TO_RESPOND);
});


server.listen(PORT, (err?) => {
  if (err) {
    console.error(err);
  }

  console.log(`Listeining on port ${PORT}`);

});

module.exports = {

};
