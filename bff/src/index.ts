import axios, { AxiosError } from 'axios';

import { UserService } from './user-service';
const morgan = require('morgan');

const server = express();

server.use(morgan('dev'));

const userService = new UserService();

const PORT = process.env.PORT || 3000;

server.get('/users', (req, res) => userService
   .loadUsersOnResponse(req, res));

server.listen(PORT, (err?: Error) => {
  if (err) {
    console.error(err);
  }
  console.log(`Listening on port ${PORT}`);
});
