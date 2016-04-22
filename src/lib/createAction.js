import isPlainObject from 'lodash/isPlainObject';
import invariant from 'invariant';
import Promise from 'bluebird';

import GeneralConstants from './GeneralConstants';
import {
  badConstantName,
  nonNamedArguments,
  undefinedArgumentGiven,
  badMadeId,
  badActionBlocker,
  badMethodFinder,
} from './dict';

function argumentsCheck(
  constant,
  namedArguments,
  actionBlocker,
  methodToCall = false,
) {
  invariant(
    constant,
    badConstantName(constant)
  );
  invariant(
    isPlainObject(namedArguments),
    nonNamedArguments(namedArguments),
  );
  invariant(
    typeof actionBlocker === 'function' || !actionBlocker,
    badActionBlocker(actionBlocker),
  );
  invariant(
    typeof methodToCall === 'function' || methodToCall === false,
    badMethodFinder(methodToCall),
  );
}

export function createStagedAction(
  constant,
  methodFinder,
  {
    postDone,
    postStart,
    postFail,
    id = constant,
  } = {},
) {
  if (this && this.constants) constant = this.constants[constant];

  return (namedArguments = {}, actionBlocker) => (api, dispatch, state) => {
    const methodToCall = methodFinder(api);
    argumentsCheck(constant, namedArguments, methodToCall);

    const madeId = typeof id === 'function' ?
      id(constant, namedArguments) :
      id;

    invariant(
      madeId.indexOf('undefined') === -1,
      undefinedArgumentGiven(constant, madeId),
    );

    invariant(
      typeof madeId === 'string',
      badMadeId(madeId),
    );

    const calls = state().gambit;
    if (calls) {
      const shouldGoAhead = actionBlocker ?
        actionBlocker(calls.getIn(['lastCalled', madeId]), calls.getIn(['lastSucceeded', madeId])) :
        true;

      if (!shouldGoAhead) {
        return false;
      }
    }

    dispatch({
      type: `${constant}_STARTING`,
      ...namedArguments,
    });
    dispatch({
      type: GeneralConstants.ACTION_CALLED,
      action: madeId,
    });

    if (postStart) { postStart(dispatch, namedArguments); }

    return methodToCall(namedArguments)
      .then(({ body }) => {
        return Promise.all([
          dispatch({
            type: GeneralConstants.ACTION_SUCCEEDED,
            action: madeId,
          }),
          dispatch({
            type: `${constant}_DONE`,
            body,
            ...namedArguments,
          }),
        ]);
      })
      .then(([actionCalled, doneVal]) => {
        if (postDone) {
          return postDone(dispatch, doneVal, namedArguments)
            .then(() => doneVal);
        }
        return doneVal;
      })
      .catch(error => {
        dispatch({
          type: `${constant}_FAILED`,
          response: error.response ? error.response.body : error,
          ...namedArguments,
        });
        if (postFail) { postFail(dispatch, error, namedArguments); }
        throw new Error(error);
      });
  };
}

export function createSimpleAction(
  constant,
) {
  if (this && this.constants) constant = this.constants[constant];
  return (namedArguments = {}) => (api, dispatch) => {
    argumentsCheck(constant, namedArguments);
    return dispatch({
      type: `${constant}_DONE`,
      ...namedArguments,
    });
  };
}

export const bindCreators = (constants) => ({
  createSimpleAction: createSimpleAction.bind({ constants }),
  createStagedAction: createStagedAction.bind({ constants }),
});
