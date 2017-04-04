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
    cycleId = false,
  } = {},
) {
  if (this && this.constants) constant = this.constants[constant];

  return (namedArguments = {}, actionBlocker) => (api, dispatch, state) => {
    const methodToCall = methodFinder(api);
    argumentsCheck(constant, namedArguments, actionBlocker, methodToCall);

    const madeId = typeof id === 'function' ?
      id(constant, namedArguments) :
      id;

    const madeCycleId = typeof cycleId === 'function' ?
      cycleId(constant, namedArguments) :
      cycleId;

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
        actionBlocker(
          calls.getIn(['lastCalled', madeId]),
          calls.getIn(['lastSucceeded', madeId]),
          calls
        ) :
        true;

      if (!shouldGoAhead) {
        return false;
      }
    }

    dispatch({
      type: GeneralConstants.ACTION_CALLED,
      action: madeId,
      namedArguments,
      cycleId: madeCycleId,
    });
    dispatch({
      ...namedArguments,
      type: `${constant}_STARTING`,
    });


    let start = Promise.resolve();
    if (postStart) { start = postStart(dispatch, namedArguments); }

    return start
      .then(() => {
        return methodToCall(namedArguments);
      })
      .then(({ body }) => {
        return Promise.all([
          dispatch({
            type: GeneralConstants.ACTION_SUCCEEDED,
            action: madeId,
            cycleId: madeCycleId,
          }),
          dispatch({
            ...namedArguments,
            type: `${constant}_DONE`,
            body,
          }),
        ]);
      })
      .then(([actionCalled, doneVal]) => {
        if (postDone) {
          return postDone(dispatch, doneVal, namedArguments, api)
            .then(() => doneVal);
        }
        return doneVal;
      })
      .catch(error => {
        dispatch({
          type: GeneralConstants.ACTION_FAILED,
          action: madeId,
          cycleId: madeCycleId,
          response: error.response ? error.response.body : error,
        });
        dispatch({
          ...namedArguments,
          type: `${constant}_FAILED`,
          response: error.response ? error.response.body : error,
        });
        if (postFail) { postFail(dispatch, error, namedArguments, api); }
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
      ...namedArguments,
      type: `${constant}_DONE`,
    });
  };
}

export const bindCreators = (constants) => ({
  createSimpleAction: createSimpleAction.bind({ constants }),
  createStagedAction: createStagedAction.bind({ constants }),
});
