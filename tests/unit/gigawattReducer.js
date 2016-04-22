/* eslint-env mocha */
import { expect } from 'chai';
import { gambitReducer } from '../../src';
import Constants from '../../src/lib/GeneralConstants';
import { Map } from 'immutable';

describe('Gambit Reducer', () => {
  it('updates correctly', () => {
    const ret = gambitReducer(
      new Map({}),
      { type: Constants.ACTION_CALLED, action: 'foo' },
    );
    expect(ret.getIn(['lastCalled', 'foo'])).to.be.gt(0);
    expect(ret.getIn(['lastCalled', 'foo'])).to.be.lt(Date.now() + 1);
  });

  it('updates has been called correctly', () => {
    const ret = gambitReducer(
      new Map({}),
      { type: Constants.ACTION_SUCCEEDED, action: 'foo' },
    );
    expect(ret.getIn(['lastSucceeded', 'foo'])).to.be.gt(0);
    expect(ret.getIn(['lastSucceeded', 'foo'])).to.be.lt(Date.now() + 1);
  });
});
