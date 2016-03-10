export default function middlewareCreate(api) {
  return store => next => action => {
    if (typeof action === 'function') {
      return action(api, store.dispatch, store.getState);
    }
    return next(action);
  };
}
