export default function middlewareCreate(Api, endpoints) {
  return store => next => action => {
    if (typeof action === 'function') {
      const api = new Api(endpoints, store.getState);
      return action(api, store.dispatch, store.getState);
    }
    return next(action);
  };
}
