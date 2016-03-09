/* eslint-env mocha */
import { expect } from 'chai';
import { createConstants } from '../../src';

describe('Create constants', () => {
  it('should correctly create all constants', () => {
    const constants = createConstants(['FOOBAR']);
    expect(constants.FOOBAR_DONE).to.equal(' FOOBAR_DONE');
    expect(constants.FOOBAR_STARTING).to.equal(' FOOBAR_STARTING');
    expect(constants.FOOBAR_FAILED).to.equal(' FOOBAR_FAILED');
  });
});
