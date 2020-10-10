/**
 * @file faun.js
 * @author lenconda<i@lenconda.top>
 */

import { createBrowserHistory, History } from 'history';
import registerSubApplications from './register';
import run from './run';
import Sandbox from './sandbox';
import createHooks from './hooks';
import {
  IFaunInstanceProps,
  IFaunSubApplicationConfig,
  IFaunDependency,
  IFaunPlugin,
  IFaunLifecycleHooks,
} from './interfaces';

// internal plugins
import Events from './plugins/events';
import Store from './plugins/store';

const history = createBrowserHistory();

class Faun {
  static history: History = history;
  static async use(plugin: IFaunPlugin, options: Record<string, any> = {}) {
    if (!plugin) {
      return;
    }
    if (!plugin.install || typeof plugin.install !== 'function') {
      return console.error('[Faun] Plugin should have an `install` method, which is a instance of `Function`');
    }
    await plugin.install(Faun, options);
  }

  private props: IFaunInstanceProps;
  // global dependencies
  private deps: Array<IFaunDependency> = [];
  private history: History = history;

  constructor(appConfig: IFaunSubApplicationConfig = {}) {
    this.props = {
      // registered sub-applications information
      registeredSubApplications: [],
      // current location object
      currentLocation: {},
      // sandboxes stack
      routes: [{ sandboxes: [new Sandbox('@@default')] }],
      // stack top position
      position: 0,
      // stack cursor direction
      direction: 'forward',
      // lifecycle hooks
      hooks: createHooks() as any,
      // app config
      appConfig: {
        ...appConfig,
        // TODO: tmp set singular to true
        singular: true,
      },
    };
  }

  public run() {
    run.call(this, this.props, this.deps, this.history);
  }

  public registerSubApplications(config: any, hooks: IFaunLifecycleHooks) {
    registerSubApplications.call(this.props, config, hooks);
  }

  public addGlobalDependence(name: string, dep: any) {
    if (name && dep) {
      this.deps.push({ name, dep });
    }
  }
}

// install plugin `Events`
Faun.use(Events);
// install plugin `Store`
Faun.use(Store);

export default Faun;
