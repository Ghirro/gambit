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
