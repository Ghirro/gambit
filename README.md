# Gambit

Gambit is a hyper-thin library designed to make building API driven apps with Redux/React easier.

## Another JS/React thing?

Listen, I know. Javascript burnout yada yada yada. The idea behind Gambit is that Redux is amazing but that it can be a little bit boilerplate intensive and low-level for a lot of use cases. This is especially true when building applications that really on almost continous API connectivity.

It aims to **augment** redux rather than replace it.

## What does it do?

Gambit exposes a number of helper libraries (all of which will work as a standalone addition to redux) to abstract some of reduxes low-level api. For instance, populating your app's store from an API in Redux can be a bit longwinded and a bit low-level, you're forced to use a lot of `@connect` and `switch`* and React component lifecycle hooks. With Gambit it's easy.

# Key Features

## Easy-as-Hell Container Components

```javascript
// UserList.js
export default function UserList({ users }) {
  return (
    {users.map(user => {
      return <li>{user.get('name')}</li>;
    })}
  );
}

// UserListContainer.js
import { createContainer } from 'gambit';
import MyComponent from './MyComponent';
import { getUsers } from './UserActions';

export default createContainer(UserList, {
  fetch: {
    users: {
      as: (state) => state.users.get('allUsers'),
      grab: (dispatch) => asValue => {
        if (asValue.count() === 0) return dispatch(getUsers());
      }
    }
  }
});
```

And presto, you have a fully connected and contained components

## Really Quick Actions

99% of actions are largely just API calls that need to fire off events when they start, complete and fail. Gambit makes this super easy:

```javascript
// reducers/user.js
import { createReducer } from 'gambit';
import UserConstants from './constants/User';
import { fromJS } from 'immutable';

export default createReducer({
  allUsers: [new Map({}), {
    [UserConstants.GET_ALL_USERS_DONE]: ({
      { body: users },
    }) => fromJS(users),
  }],

  userFetchError: [false, {
    [UserConstants.GET_ALL_USERS_FAILED]: ({ error }) => error,
  }],

  userFetching: [false, {
    [UserConstants.GET_ALL_USERS_STARTING]: true,
    [UserConstants.GET_ALL_USERS_FAILED + UserConstants.GET_ALL_USERS_DONE]: false,
  }],
});

// actions/user.js
import { createStagedAction } from 'gambit';
import UserConstants from './constants/User';

export const getAllUsers = createStagedAction(UserConstants.GET_ALL_USERS, api => api.users.getUsers);
```

# Simple API Factory
...document tomorrow

# Easy Reducers
...document tomorrow

# Sensible Middleware
...document tomorrow

# Constant Creation
...document tomorrow

# Differences vs Marty
...document tomorrow

# Action Blockers
...document tomorrow


Roadmap:
* Actually document stuff
