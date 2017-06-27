if (typeof document !== 'undefined') {
  require('./reactErrorPatch.js');
}

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
    propTransform,
    strictMode,
    logging,
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
    static contextTypes = {
      store: React.PropTypes.object,
    };

    constructor(props, context) {
      super(props, context);
      this.state = {
        loadingFetches: 0,
        errored: false,
      };
    }

    runFetches(props, fetchesToRun) {
      if (propTransform) {
        props = propTransform(props);
      }

      const promiseObj = {};
      const store = this.context.store.getState();

      forIn(fetchesToRun, (value, key) => {
        if (value.grab) {
          let grab,
            as;

          try {
            grab = value.grab(props.dispatch, props);
            as = value.as(store, props);
          } catch (e) {
            console.warn(`Error in ${name}`, e);
          }

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
      const { store } = this.context;

      this.runFetches(this.props, fetch);

      // We have refreshGrabInResponse
      // because when a component has a small view into a larger data set (i.e. between some dates)
      // it's generally the only part of the application that knows what view it has and so
      // it's best place to re-run the grab function that provides its data.
      store.subscribe((...args) => {
        const state = store.getState();

        forIn(fetch, (value, key) => {
          let { refreshGrabInResponse } = value;
          if (!refreshGrabInResponse) return null;

          if (typeof refreshGrabInResponse === 'function') {
            const parseProps = propTransform ? propTransform(this.props) : this.props;
            refreshGrabInResponse = refreshGrabInResponse(state, parseProps);
          }

          if (
            refreshGrabInResponse.indexOf(state.gambit.get('lastAction')) !== -1
          ) {
            return this.runFetches(this.props, { [key]: value });
          }

          return null;
        });
      });
    }

    componentWillReceiveProps(nextProps) {
      this.runFetches(nextProps, fetch);
    }

    render() {
      const { loadingFetches, errored } = this.state;
      const parseProps = propTransform ? propTransform(this.props) : this.props;

      if (loadingFetches !== 0 && pending) {
        return pending.call(this, WrappedComponent);
      } else if (loadingFetches === 0 && !errored) {
        if (done) {
          return done.call(this, WrappedComponent);
        }
        return <WrappedComponent {...parseProps} />;
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
