/**
 * @file run.js
 * @author lenconda<i@lenconda.top>
 */

import {
  initSandbox,
  initRoute,
  initGlobalDependencies,
} from './initialization';
import refreshLocation from './utils/refresh-location';
import {
  loadSubApplication,
  unloadSubApplication,
} from './loader';
import { handleRouteChange, handleClick } from './handlers';
import './overwrites/direction';

/**
 * essential method to start the application
 * contains the whole lifecycles, includes initialization
 * @param {IFaunProps} props
 * @param {IGlobalDependenceInfo} deps
 */
export default function(props, deps, history) {
  const _this = this;

  if (Array.isArray(deps) && deps.length) {
    initGlobalDependencies(deps);
  }

  initSandbox.call(props);

  initRoute(history.location, function(location, pathname) {
    refreshLocation.call(props, location);
    loadSubApplication(props, pathname, _this, 'PUSH');
  });

  // listen history change to load and unload sandboxes
  history.listen(function(location, action) {
    handleRouteChange(props, location, function(prev, next) {
      refreshLocation.call(props, history.location);
      if (!unloadSubApplication(props, prev, next, _this)) {
        return;
      }
      loadSubApplication(props, next, _this, action);
    });
  });

  // intercept all click events
  window.addEventListener('click', function(event) {
    handleClick(event, props, history);
  });

  window.addEventListener('forward', event => {
    props.direction = 'forward';
  });
  window.addEventListener('back', event => {
    props.direction = 'backward';
  });
}
