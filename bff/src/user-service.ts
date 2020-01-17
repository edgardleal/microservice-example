import { AjaxClient } from './ajax-client';

export class UserService {
  private ajax: AjaxClient;
  constructor() {
    this.ajax = new AjaxClient({
        baseURL: 'http://localhost',
    });
  }
  loadUsersOnResponse(req, res) {
    this.ajax
      .get('/users')
      .then(result => res.json(result))
      .catch(error => {
        res.status((error.response || { status: 500 }).status);
        res.json(error);
      });
  }
}
