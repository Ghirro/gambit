import { connect } from 'react-redux';
import forIn from 'lodash/forIn';
import invariant from 'invariant';
import GeneralConstants from './GeneralConstants';

import {
  noFunctionAs,
} from './dict';

function mapStateToProps(fetch = {}, containerName) {
  return (state, props) => {
    const obj = {};
    forIn(fetch, (value, key) => {
      invariant(
        typeof value.as === 'function',
        noFunctionAs(value.as, key, containerName)
      );
      obj[key] = value.as(state, props);
    });
    return obj;
  };
}

function mergeProps(methods = {}, containerName) {
  return (stateProps, { dispatch }, ownProps) => {
    const megaProps = { ...ownProps, ...stateProps };
    const otherMethods = {};
    forIn(methods, (value, key) => {
      otherMethods[key] = value(dispatch, megaProps);
    });

    otherMethods.monitor = (id, props, state) => {
      return dispatch({
        type: GeneralConstants.MONITORED_VALUE_CHANGED,
        id,
        props,
        state,
      });
    };

    return {
      ...megaProps,
      ...otherMethods,
    };
  };
}

export const connectComponent = (Component, fetch, methods, name) => {
  return connect(
    mapStateToProps(fetch, name),
    null,
    mergeProps(methods, name),
  )(Component);
};
