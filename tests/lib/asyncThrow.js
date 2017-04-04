import { expect } from 'chai';

export default async function asyncThrow(method, shouldThrow = true) {
  try {
    await method();
  } catch (e) {
    if (!shouldThrow) {
      expect('Not throw an Error').to.equal(false);
    }
    return true;
  }

  if (shouldThrow) {
    expect('Throw an Error').to.equal(false);
  }
}
