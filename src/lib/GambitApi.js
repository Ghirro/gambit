import forEach from 'lodash/forEach';
import mapValues from 'lodash/mapValues';
import HttpError from './HttpError';
import invariant from 'invariant';
import isPlainObject from 'lodash/isPlainObject';

import {
  badApiArgs,
} from './dict';

export default class GambitApi {

  constructor(endpoints, baseUrl) {
    this.endpoints = endpoints;
    this.baseUrl = baseUrl;
    this.fetch = async (url, rest) => {
      const fetchVal = await fetch(url, rest);
      if (!fetchVal.ok) {
        throw new HttpError(`Invalid HTTP response, status ${fetchVal.status}`, { body: fetchVal });
      }
      const response = await fetchVal.json();
      return response;
    };

    this.extraHeaders = {};
    forEach(endpoints, (methodBag, moduleName) => {
      this[moduleName] = mapValues(methodBag, (method) => {
        return (args) => {
          invariant(isPlainObject(args), badApiArgs(method));
          return method.call(this, args);
        };
      });
    });
  }

  _request = type => async ({ url, ...rest }) => {
    if (!url) throw new Error('No URL given in API Call');
    rest.method = type;
    rest.headers = {
      ...rest.headers,
      ...this.extraHeaders,
    };
    const response = await this.fetch(url, rest);
    return { body: response };
  };

  post = this._request('POST');
  get = this._request('GET');
  put = this._request('PUT');
  del = this._request('DELETE');

  setHeaders = (headers) => {
    this.extraHeaders = headers;
  };

  setFetchLib = (lib) => {
    this.fetch = lib;
  };
}
