// https://gist.github.com/Psykar/d01f6e6e9575926768123ff7af82fd11
import React from 'react'

let errorPlaceholder = <noscript/>

function logError(Component, error) {
  const errorMsg = `Error while rendering component. Check render() method of component '${Component.displayName || Component.name || '[unidentified]'}'.`

  console.error(errorMsg, 'Error details:', error); // eslint-disable-line
}

function monkeypatchRender(prototype) {
  if (prototype && prototype.render && !prototype.render.__handlingErrors) {
    const originalRender = prototype.render

    prototype.render = function monkeypatchedRender() {
      try {
        return originalRender.call(this)
      } catch (error) {
        logError(prototype.constructor, error)

        return errorPlaceholder
      }
    }

    prototype.render.__handlingErrors = true // flag render method so it's not wrapped multiple times
  }
}

const originalCreateElement = React.createElement
const statelessMap = new Map()
React.createElement = (Component, ...rest) => {
  if (typeof Component === 'function') {

    if (typeof Component.prototype.render === 'function') {
      monkeypatchRender(Component.prototype)
    }

    // stateless functional component
    if (!Component.prototype.render) {
      const originalStatelessComponent = Component
      if (statelessMap.has(originalStatelessComponent)) {
        Component = statelessMap.get(originalStatelessComponent)
      } else {
        Component = (...args) => {
          try {
            return originalStatelessComponent(...args)
          } catch (error) {
            logError(originalStatelessComponent, error)

            return errorPlaceholder
          }
        }
        Object.assign(Component, originalStatelessComponent)
        statelessMap.set(originalStatelessComponent, Component)
      }
    }
  }

  return originalCreateElement.call(React, Component, ...rest)
}


// allowing hot reload
const originalForceUpdate = React.Component.prototype.forceUpdate
React.Component.prototype.forceUpdate = function monkeypatchedForceUpdate() {
  monkeypatchRender(this)
  originalForceUpdate.call(this)
}
