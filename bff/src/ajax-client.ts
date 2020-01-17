import axios, { AxiosRequestConfig, AxiosInstance, AxiosError } from 'axios';

export class AjaxClient {
  baseURL: string;
  timeout: number;
  instance: AxiosInstance;

  constructor(config: any) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 1000;
  }

  getInstance() {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: this.baseURL,
        timeout: this.timeout,
      });
    }
    return this.instance;
  }

  get<Type = {}>(url: string, params: any = {}): Promise<Type> {
    return this.getInstance()
      .get(url, {
          params,
      })
      .then(response => response.data)
      .catch((error: AxiosError) => {
        if (tries < 20) {
          tryRequest(req, res, tries + 1);
        } else {
          console.error(error.message);
          res.status((error.response || { status: 500 }).status);
          res.end(error.message);
        }
      });
  }
}
