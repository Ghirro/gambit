/* eslint-env mocha */
import { expect } from 'chai';
import Promise from 'bluebird';

import {
  hasNotBeenCalled,
  hasNotBeenCalledIn,
  dependableMatrix,
  createStagedAction,
  createSimpleAction,
  bindCreators,
} from '../../src';


import dispatchCreator from '../lib/dispatch';
import asyncThrow from '../lib/asyncThrow';

const fakeBody = { body: { id: 1 } };
const fakeError = { response: { body: 'You failed' } };
const fakeApi = {
  findUser: () => {
    return new Promise(resolve => {
      resolve(fakeBody);
    });
  },
  brokenFindUser: () => {
    return new Promise((_, reject) => {
      reject(fakeError);
    });
  },
};
const { dispatch, last, lastId, clearStack, clearState } = dispatchCreator(fakeApi);

const SOME_ACTION = 'SOME_ACTION';
const SOME_ACTION_DONE = 'SOME_ACTION_DONE';
const SOME_ACTION_FAILED = 'SOME_ACTION_FAILED';
const SOME_ACTION_STARTING = 'SOME_ACTION_STARTING';

beforeEach(() => {
  clearStack();
  clearState();
});

describe('Creating Actions', () => {
  describe('Basic action creation', () => {
    it('should let me create an action using createSimpleAction', () => {
      const action = createSimpleAction(SOME_ACTION);
      dispatch(action({ foo: 'bar' }));
      expect(last().type).to.equal(SOME_ACTION_DONE);
    });

    it('should let me create an action using createStagedAction', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.findUser, {
        postStart: () => new Promise(resolve => {
          expect(last().type).to.equal(SOME_ACTION_STARTING);
          resolve();
        }),
        postDone: () => new Promise(resolve => {
          expect(last().type).to.equal(SOME_ACTION_DONE);
          resolve();
        }),
      });
      await dispatch(action());
    });
  });

  describe('Validation', () => {
    it('should be a dick if you give an invalid constant', () => {
      const action = createStagedAction(undefined, api => api.findUser);
      expect(
        () => dispatch(action())
      ).to.throw(Error);
    });

    it('should be a dick if you give an invalid api search', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.imNotHere);
      await asyncThrow(() => {
        return dispatch(action());
      });
    });
  });

  describe('Posts', () => {
    it('should call post start after start', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.findUser, {
        postStart: () => new Promise(resolve => {
          expect(last().type).to.equal(SOME_ACTION_STARTING);
          resolve();
        }),
      });
      await dispatch(action());
    });

    it('should call post start with named arguments', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.findUser, {
        postStart: (_, namedArguments) => new Promise(resolve => {
          expect(last().type).to.equal(SOME_ACTION_STARTING);
          expect(namedArguments.id).to.equal(999);
          resolve();
        }),
      });
      await dispatch(action({ id: 999 }));
    });

    it('should maintain type even when type parameter is passed', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.findUser, {
        postStart: (_, namedArguments) => new Promise(resolve => {
          expect(last().type).to.equal(SOME_ACTION_STARTING);
          resolve();
        }),
      });
      return dispatch(action({ type: 'DOG_CHECKER' }));
    });

    it('should call post done after done', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.findUser, {
        postDone: () => new Promise(resolve => {
          expect(last().type).to.equal(SOME_ACTION_DONE);
          resolve();
        }),
      });
      await dispatch(action());
    });

    it('should call post done with named arguments', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.findUser, {
        postDone: (x, y, namedArguments) => new Promise(resolve => {
          expect(last().type).to.equal(SOME_ACTION_DONE);
          expect(namedArguments.id).to.equal(999);
          resolve();
        }),
      });
      await dispatch(action({ id: 999 }));
    });

    it('should call post fail after fail', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.findUser, {
        postDone: () => new Promise((res, rej) => rej(new Error('bla'))),
        postFail: () => new Promise(resolve => {
          expect(last().type).to.equal(SOME_ACTION_FAILED);
        }),
      });

      try {
        await dispatch(action());
      } catch (e) { return; }
    });

    it('should call fail with named arguments', async () => {
      const action = createStagedAction(SOME_ACTION, api => api.findUser, {
        postDone: () => new Promise((res, rej) => rej(new Error('bla'))),
        postFail: (_, error, args) => new Promise(resolve => {
          expect(args.id).to.equal(999);
        }),
      });

      try {
        await dispatch(action({ id: 999 }));
      } catch (e) { return; }
    });
  });

  describe('Bind Creators', () => {
    const constants = { FATHER: 'FATHER_TED' };
    it('should let me bind a constant set so I don\'t', async () => {
      const { createStagedAction: boundCreateStagedAction } = bindCreators(constants);
      const action = boundCreateStagedAction('FATHER', api => api.findUser);
      await dispatch(action());
      expect(last().type).to.equal('FATHER_TED_DONE');
    });
  });

  describe('Staged Actions', () => {
    describe('IDS', () => {
      const idAction = createStagedAction(
        SOME_ACTION,
        api => api.findUser,
        {
          id: (constant, { userId }) => `${constant}_${userId}`,
        }
      );
      const nonIdAction = createStagedAction(SOME_ACTION, api => api.findUser);

      it('should correctly form an id', async () => {
        await dispatch(idAction({ userId: 1 }));
        expect(lastId()).to.equal(`${SOME_ACTION}_1`);
      });

      it('should use the constant name as an id where none present', async () => {
        await dispatch(nonIdAction());
        expect(lastId()).to.equal(SOME_ACTION);
      });

      it('should chuck an invariant when the id is bad', () => {
        expect(() => dispatch(idAction())).to.throw(Error);
      });

      it('should block an action if previously called', async () => {
        await dispatch(nonIdAction());
        expect(last().type).to.equal(SOME_ACTION_DONE);
        clearStack();

        await dispatch(nonIdAction({}, hasNotBeenCalled));
        expect(last()).to.equal(undefined);
      });

      it('should block an action if previously called within X minutes', async () => {
        await dispatch(nonIdAction());
        expect(last().type).to.equal(SOME_ACTION_DONE);
        clearStack();

        await dispatch(nonIdAction({}, hasNotBeenCalledIn(5, 'minutes')));
        expect(last()).to.equal(undefined);
      });

      it('should not block if previously called further than the time gap', async function () {
        this.timeout(3000);
        await dispatch(nonIdAction());
        expect(last().type).to.equal(SOME_ACTION_DONE);
        clearStack();

        await new Promise(r => setTimeout(r, 1001));
        await dispatch(nonIdAction({}, hasNotBeenCalledIn(1, 'second')));
        expect(last().type).to.equal(SOME_ACTION_DONE);
      });

      it('should block an id\'d action if previously called', async () => {
        await dispatch(idAction({ userId: 2 }));
        expect(last().type).to.equal(SOME_ACTION_DONE);
        clearStack();

        await dispatch(idAction({ userId: 2 }, hasNotBeenCalled));
        expect(last()).to.equal(undefined);
      });

      it('should not block and id action with a differnet id', async () => {
        await dispatch(idAction({ userId: 1 }));
        expect(last().type).to.equal(SOME_ACTION_DONE);
        clearStack();

        await dispatch(idAction({ userId: 2 }, hasNotBeenCalled));
        expect(last().type).to.equal(SOME_ACTION_DONE);
      });
    });
  });

  describe('Dependable Matrix', async () => {
    const SOME_OTHER_ACTION = 'SOME_OTHER_ACTION';

    const firstAction = createStagedAction(
      SOME_ACTION,
      () => () => true,
    );

    const secondAction = createStagedAction(
      SOME_OTHER_ACTION,
      () => () => true,
    );

    it('should call the method if the resetting action has been called', async () => {
      const matrix = dependableMatrix(
        [SOME_OTHER_ACTION]
      );

      await dispatch(firstAction({}, matrix));
      await dispatch(secondAction({}));
      await dispatch(firstAction({}, matrix));

      expect(last().type).to.equal(SOME_ACTION_DONE);
    });

    it('should call  if the reset action has not been called but no blocker', async () => {
      const matrix = dependableMatrix(
        [SOME_OTHER_ACTION]
      );

      await dispatch(firstAction({}, matrix));
      expect(last().type).to.equal(SOME_ACTION_DONE);

      await dispatch(firstAction({}, matrix));
      expect(last().type).to.equal(SOME_ACTION_DONE);
    });

    it('shouldnt call if the reset action has not been called and otherwise blocker', async () => {
      const matrix = dependableMatrix(
        [SOME_OTHER_ACTION],
        hasNotBeenCalled,
      );

      await dispatch(firstAction({}, matrix));
      expect(last().type).to.equal(SOME_ACTION_DONE);
      clearStack();

      await dispatch(firstAction({}, matrix));
      expect(last()).to.equal(undefined);
    });
  });
});
