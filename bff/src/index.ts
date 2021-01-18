/**
 * index.js
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module index.js
 */

import axios from 'axios';
import { initTracer } from 'jaeger-client';
import {
  Span,
  SpanOptions,
  FORMAT_HTTP_HEADERS,   
} from 'opentracing';
import * as express from 'express';

const tracker = initTracer({
  serviceName: 'bff',
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


const server = express();

server.use((
  req: express.Request,
  res: express.Response,
  next,
) => {
  const context = tracker.extract(FORMAT_HTTP_HEADERS, req.headers);
  const options: SpanOptions = {
    childOf: context,
  };
  const span: Span = tracker.startSpan('http', options);
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

server.get('/users', (req, res) => {
  console.log('Responding users...'); // eslint-disable-line
  
  const config = {
    headers: {},
  };
  tracker.inject(
    (req as any).span,
    FORMAT_HTTP_HEADERS,
    config.headers,
  );
  axios.get('http://users:3000/', config)
    .then(response => response.data)
    .then(res.json.bind(res))
    .catch(res.json.bind(res));
});

server.listen(PORT, (err?) => {
  if (err) {
    console.error(err);
  }
  console.log(`Listeining on port ${PORT}`);
});

