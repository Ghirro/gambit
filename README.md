# Gambit

[Example App](https://github.com/Ghirro/gambit-github-example) | [Guide](https://ghirro.gitbooks.io/getting-started-with-gambit/content/)

Gambit is a hyper-thin library designed to make building API driven apps with Redux/React easier. It is not a Redux replacement, it is a library built on top of Redux.

```
npm install gambit
```

Or check out the [example app](https://github.com/Ghirro/gambit-github-example)

## Why?

Redux is a fantastic tool for managing state within a javascript application, however it is naturally a low-level interface. This is great but when building API driven applications, it can become quite boilerplate intensive and the APIs for connecting a component to a store and then fetching data can lead to quite a lot of repetition.

> The whole beauty of a library like Gambit is that it's just a set of helpers on top of an existing library. You're still using redux underneath, so if Gambit is too prescriptive for a particular edge case, you can just go back to vanilla Redux that one time. It's not sugar - more like icing.

[An Actual Developer](https://github.com/jimmed)

# What does it do?

Gambit provides a very simple way to create container components that need to interact with an API. It does so in a way that uses the power of the redux store whilst allowing you to build remote-data-dependent UIs quicker.

Because it's built on Redux, you can still use the entire Redux ecosystem alongside it whether that's `react-router-redux` or `redux-dev-tools` etc.

## Give me an example, you idiot!

Okay okay, keep your hair on. Check out the [example app](https://github.com/Ghirro/gambit-github-example). Alternatively, here's a quick example of something Gambit does very well, creating Container components.

```javascript
const AllUsersListContainer = export createContainer(AllUsersList, {
  fetch: {
    allUsers: {
      as: (state) => state.users.allUsers,
      grab: (dispatch) => asValue => {
        if (asValue.length === 0) return dispatch(getAllUsers());
      }
    },
  },
  pending() {
    return <LoadingSpinner />;
  },
  failed() {
    return <ErrorPage error="Fetching all users failed" />;
  },
});
```

You don't have to deal with `@connect`, `mapStateToProps`, `componentWill...` or any other life-cycle hooks. The container will getAllUsers when the Redux store has none and whilst doing it will display a loading spinner. If it fails then you'll get a helpful error page.

It'll also deal with when you're Component needs to create actions:

```javascript
const AddUserButtonContainer = export createContainer(AddUserButton, {
  methods: {
    addUsers: dispatch => userId => dispatch(addUser({ userId })),
  }
});

// AddUserButton.js
function AddUserButton({ userId, addUser }) {
  return (
    <Button onClick={() => addUser({ userId })}>Add User</Button>
  );
}
```

## What about Redux?

Gambit is built on top of Redux so it's setup requires creating a Redux store and it uses Redux behind the scenes. This leaves you free to continue to use all Redux plugins (`react-router-redux`, `redux-dev-tools` etc) whilst not having to deal with manually connecting everything to the store.

## What Else?

Gambit provides a number of other helper libraries to make creating ActionCreators, Constants and Reducers much easier and boilerplate free.

Check out the [guide](https://ghirro.gitbooks.io/getting-started-with-gambit/content/).

### ActionCreators

If you're fetching data from an API, you'll usually want your action creator to let you know when three things happen:

* When the data is requested
* When the fetch succeeds
* When the fetch fails

This allows you to build UIs that actually feel good for the user. This is all baked in to the Gambit ActionCreator flow and is as simple as:

```javascript
import Constants from './constants';
import { createStagedAction } from 'gambit';

export const getAllUsers = createStagedAction(
  Constants.GET_ALL_USERS,
  api => api.users.getAllUsers()
);
```

When you call `dispatch(getAllUsers())` from somewhere in your app (presumably a container component), `api.users.getAllUsers` is called and you can add in reducer updates for `GET_ALL_USERS_STARTING`, `GET_ALL_USERS_DONE` and `GET_ALL_USERS_FAILED`. You'll also receive any arguments that were passed to the dispatch.

### Reducers

Creating reducers with Gambit is very easy and doesn't need a lot of `switch`ing. To change state based on the action above for instance we may create a reducer that looks like this:

```javascript
import { createReducer } from 'gambit';
import Constants from './constants';

export default createReducer({
  allUsers: [[], {
    [Constants.GET_ALL_USERS_DONE]: ({
      body: { users }
    }, previousState) => [ ...previousState, ...users ],
  }],
});
```

What's more, because Gambit is creating Redux reducers, they sit happily alongside other redux reducers.

```javascript
import { routerReducer } from 'react-router-redux';
import userReducer from './reducers/user.js';
import { createStore, combineReducers } from 'redux';

export default createStore(
  combineReducers({ users: userReducer, routing: routerReducer })
);
```

### Creating Constants

Gambit provides a helper function to create all of the required constants for staged actions (DONE, STARTING etc).

```javascript
import { createConstants } from 'gambit';

export default createConstants(['GET_ALL_USERS']);
```

### Middleware

Setting up Gambit to use an API is very simple:

```javascript
import React from 'react';
import { routerReducer } from 'react-router-redux';
import userReducer from './reducers/user.js';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { GambitApi, createMiddleware } from 'gambit';
import { Provider } from 'react-redux';
import myApi from './api';

// Create react-router-redux middleware here
const gambitMiddleware = createMiddleware(myApi);
const store = createStore(
  combineReducers({ user: userReducer, routing: routerReducer }),
  {},
  compose(applyMiddleware(routerMiddleware, gambitMiddleware)),
);

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        ...your application that is now connected to an API
      </Provider>
    )
  }
}
render(<App />, document.getElementById('coolSite'));
```

## These Docs Suck

I know. I'll be updating them with a link to a more thorough guide and API documentation soon. Possibly even some screencasts.

## Thanks

I'd like to thank the following people:

* [Paolo Moretti](https://github.com/moretti) - A really good programmer and bloke
* [James Hollingworth](https://github.com/jhollingworth) - Creator of MartyJS from which a lot of the Gambit API takes inspiration
* [Jim O'Brien](https://github.com/jimmed) - Helped with API design suggestions.
* [Dan Abramov](https://github.com/gaearon) - Created Redux which powers these whole shenanigans.
