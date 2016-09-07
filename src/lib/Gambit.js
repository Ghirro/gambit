import React from 'react';
import forIn from 'lodash/forIn';
import Promise from 'bluebird';
import invariant from 'invariant';

import { connectComponent } from './containerHelpers';
import {
  badComponent,
  badGrab,
  badGrabReturn,
} from './dict';

export default function containerFactory(
  ComponentToWrap,
  {
    fetch,
    methods,
    done,
    pending,
    failed,
  },
) {
  invariant(
    ComponentToWrap,
    badComponent(fetch),
  );

  const name = ComponentToWrap.displayName;
  const WrappedComponent = connectComponent(
    ComponentToWrap,
    fetch,
    methods,
    name,
  );

  class Gambit extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = {
        loadingFetches: 0,
        errored: false,
      };
    }

    runFetches(props) {
      const promiseObj = {};
      const store = this.context.store.getState();

      forIn(fetch, (value, key) => {
        if (value.grab) {
          const grab = value.grab(props.dispatch, props);
          const as = value.as(store, props);
          invariant(
            typeof grab === 'function',
            badGrab(name, key, grab),
          );
          promiseObj[key] = grab(as);
        }
      });

      const allCallsBlocked = Object.keys(promiseObj).every(x => !promiseObj[x]);
      if (allCallsBlocked) {
        return false;
      }

      this.setState({
        loadingFetches: this.state.loadingFetches + 1,
      });

      return Promise.props(promiseObj)
        .then(object => {
          Object.keys(object).forEach(key => {
            invariant(
              object[key] !== undefined,
              badGrabReturn(name, key, object[key]),
            );
          });
          this.setState({
            loadingFetches: this.state.loadingFetches - 1,
            errored: false,
          });
           // Workaround for https://github.com/petkaantonov/bluebird/issues/846
          return null;
        })
        .catch(err => {
          this.setState({
            loadingFetches: this.state.loadingFetches - 1,
            errored: err,
          });
        });
    }

    componentWillMount() {
      this.runFetches(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this.runFetches(nextProps);
    }

    render() {
      const { loadingFetches, errored } = this.state;
      if (loadingFetches !== 0 && pending) {
        return pending.call(this, WrappedComponent);
      } else if (loadingFetches === 0 && !errored) {
        if (done) {
          return done.call(this, WrappedComponent);
        }
        return <WrappedComponent {...this.props} />;
      } else if (loadingFetches === 0 && errored) {
        if (failed) {
          console.warn(`Failed in ${name}: ${errored}`);
          return failed.call(this, WrappedComponent);
        }
        throw new Error(errored);
      }
      return null;
    }
  }

  Gambit.displayName = `Container(${name})`;
  return Gambit;
}
