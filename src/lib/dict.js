/* eslint-disable max-len */

export const nonNamedArguments = (givenArgs) => {
  return `Arguments passed to an action creator must be named ({ foo: 'bar'}), ${givenArgs} given`;
};

export const badConstantName = (constant) => {
  return `No such constant ${constant}`;
};

export const undefinedArgumentGiven = (constant, id) => {
  return `After building Action ID, undefined was found implying a required arg was undefined, ${constant}: ${id}`;
};

export const badMadeId = (madeId) => {
  return `ID must be a string or a function that returns a string for an action creator, ${madeId} given`;
};

export const badActionBlocker = (actionBlocker) => {
  return `actionBlockers must be functions when set, ${actionBlocker} given`;
};

export const badMethodFinder = (methodToCall) => {
  return `Return value of the api search method in createStagedAction must be a function, ${methodToCall} given`;
};

export const noFunctionAs = (as, key, containerName) => {
  return `${containerName}.value.as must be a function, ${as} given for ${key} in Container(${containerName})`;
};

export const badComponent = (fetch) => {
  return `You haven't loaded a component correctly, fetch has the follows keys ${Object.keys(fetch).join(',')}`;
};

export const badGrab = (name, key, grab) => {
  return `${name}.${key}.grab must return a function, ${grab} given`;
};

export const badGrabReturn = (name, key, val) => {
  return `${name}.${key}.grab returns ${val}, ensure you're returning the dispatch in the grab's action thunk.`;
};

export const badApiArgs = (method) => {
  return `Argument passed to ${method.name} must be an object with named properties`;
};

export const integerAsString = (type, argument, key, allArgs) => {
  return `When ${type === 'set' ? 'setting' : 'getting'} a field on a reducer, if the field name can be an integer, it must be. You used "${argument}" in ${allArgs.length > 1 ? allArgs.join('.') : ''} ${key}.`;
};

export const valueUndefined = (setKey, key) => {
  return `Setting ${setKey.join('.')} as undefined is not permissable in strictMode for ${key}`;
};

export const keyUndefined = (setKey, key) => {
  return `Cannot use undefined as a key (full chain: ${setKey.join('.')}) on ${key} whilst in strictMode`;
};

export const keyIsArray = (setKey, key, type) => {
  return `Cannot use ${type === 'set' ? 'set' : 'get'} with an Array key for ${key}. Used ${setKey.join('.')}, please use ${type === 'set' ? 'setIn' : 'getIn'}`;
};

export const keyIsntArray = (setKey, key, type) => {
  return `Cannot use ${type === 'set' ? 'setIn' : 'getIn'} with a none array key for ${key}. Used ${setKey}, please use ${type === 'set' ? 'set' : 'get'}`;
};
