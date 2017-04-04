/* eslint-env mocha */
import { expect } from 'chai';
import { gambitReducer } from '../../src';
import Constants from '../../src/lib/GeneralConstants';
import { Map } from 'immutable';

const reducer = gambitReducer();

describe('Gambit Reducer', () => {
  it('updates correctly', () => {
    const ret = reducer(
      new Map({}),
      { type: Constants.ACTION_CALLED, action: 'foo' },
    );
    expect(ret.getIn(['lastCalled', 'foo'])).to.be.gt(0);
    expect(ret.getIn(['lastCalled', 'foo'])).to.be.lt(Date.now() + 1);
  });

  it('updates has been called correctly', () => {
    const ret = reducer(
      new Map({}),
      { type: Constants.ACTION_SUCCEEDED, action: 'foo' },
    );
    expect(ret.getIn(['lastSucceeded', 'foo'])).to.be.gt(0);
    expect(ret.getIn(['lastSucceeded', 'foo'])).to.be.lt(Date.now() + 1);
  });

  describe('Default Actions', () => {
    it('should start pending whenever an action is called', () => {
      const ret = reducer(
        new Map({}),
        { type: Constants.ACTION_CALLED, cycleId: 'foo' },
      );

      expect(ret.getIn(['pending', 'foo'])).to.equal(true);
    });

    it('should stop pending whenver an action is succeeded', () => {
      const ret = reducer(
        new Map({}),
        { type: Constants.ACTION_SUCCEEDED, cycleId: 'foo' },
      );

      expect(ret.getIn(['pending', 'foo'])).to.equal(false);
    });

    it('should stop pending whenver an action is failed', () => {
      const ret = reducer(
        new Map({}),
        { type: Constants.ACTION_FAILED, cycleId: 'foo' },
      );

      expect(ret.getIn(['pending', 'foo'])).to.equal(false);
    });

    it('should clear failure whenver an action is failed', () => {
      const ret = reducer(
        new Map({}),
        { type: Constants.ACTION_SUCCEEDED, cycleId: 'foo' },
      );

      expect(ret.getIn(['failed', 'foo'])).to.equal(null);
    });

    it('should clear failure whenver an action is pending', () => {
      const ret = reducer(
        new Map({}),
        { type: Constants.ACTION_CALLED, cycleId: 'foo' },
      );

      expect(ret.getIn(['failed', 'foo'])).to.equal(null);
    });

    it('should set failure to true whenver an action is failed', () => {
      const ret = reducer(
        new Map({}),
        { type: Constants.ACTION_FAILED, cycleId: 'foo' },
      );

      expect(ret.getIn(['failed', 'foo'])).to.equal(true);
    });

    it('should let me put in an errorParser', () => {
      const parsingReducer = gambitReducer({
        errorParser: ({ response }) => response,
      });

      const ret = parsingReducer(
        new Map({}),
        { type: Constants.ACTION_FAILED, cycleId: 'foo', response: 'Blah' },
      );

      expect(ret.getIn(['failed', 'foo'])).to.equal('Blah');
    });
  });
});
