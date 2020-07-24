# Guide

## Introduction

Faun (IPA: /ˈfɔːn/) is an implementation of concepts from [micro-frontends.org](https://micro-frontends.org/). It was designed to make it easier to build micro-frontend applications and at the same time be less intrusive migrating existed project to micro-frontend architecture.

### Concepts and Technical Terms

- Micro Frontend: technology, implemented methods or methodology to build micro-frontend apps
- Micro Frontend Apps: the projects or applications build with micro-frontend technology
- Framework: or *framework-application(s)* or *master-application(s)*, the dock to load sub-applications. It also solves the global events and stores global states.
- Sub-application(s): could be loaded by framework-application, and also be able to work independently as an independent application under certain circumstances.

### What is Micro-Frontend

> Please check the [Micro Frontends](https://micro-frontends.org/) and [Patterns for Micro Frontends - ThoughtWorks Talks Tech
](https://www.youtube.com/watch?v=tcQ1nWdb7iw&t=269s) first!

As [Michael Geers](http://geers.tv/) said in [Micro Frontends](https://micro-frontends.org/):

> The idea behind Micro Frontends is to think about a website or web app as a composition of features which are owned by independent teams. Each team has a distinct area of business or mission it cares about and specialises in. A team is cross functional and develops its features end-to-end, from database to user interface.

Opposite from [Frontend Monolith](https://www.youtube.com/watch?v=pU1gXA0rfwc), Micro-frontend apps are composition of many independent sub-applications, and the core ideas of micro-frontend are shown as below:

- **Be Technology Agnostic**

Each team should be able to choose and upgrade their stack without having to coordinate with other teams. Custom Elements are a great way to hide implementation details while providing a neutral interface to others.

- **Isolate Team Code**

Don’t share a runtime, even if all teams use the same framework. Build independent apps that are self contained. Don’t rely on shared state or global variables.

- **Establish Team Prefixes**

Agree on naming conventions where isolation is not possible yet. Namespace CSS, Events, Local Storage and Cookies to avoid collisions and clarify ownership.
Favor Native Browser Features over Custom APIs
Use Browser Events for communication instead of building a global PubSub system. If you really have to build a cross team API, try keeping it as simple as possible.

- **Build a Resilient Site**

Your feature should be useful, even if JavaScript failed or hasn’t executed yet. Use Universal Rendering and Progressive Enhancement to improve perceived performance.

### What's Different in Faun

The only difference between Faun and principles in [Micro Frontends](https://micro-frontends.org/) is, as it will probably always be, Faun uses global states, methods, dependencies, event buses to make it easier for communication between framework and sub-applications, or between sub-applications.

### How Does Faun Works

To get understand of how it works, here we put an image to show the main processes of what will Faun do when starting a micro-frontend-powered application:

![faun](../_media/faun.jpg)

Sandbox is the core of Faun, which provides a pure environment for each sub-application. When the user request a path of the application, the framework would make a request to a server to obtain the sub application configuration map for this application.

Then it would load sandbox with the top-level route. For example, if a user request a route like `https://foo.com/bar/baz` while base path was set as `http://foo.com/`, while `/bar` hits the route config, Faun will create a new sandbox to load resources, and take snapshots from `window`.

Meantime, sandbox will overwrite DOM operations on `Element.prototype` (such as `appendChild`, `insertBefore`) and `window.addEventListener` in order to catch snapshot and make some mutations.

A polyfilled `MutationObserver` would be settled in order to catch the DOM changes, push them in an array. When unloading sandbox, the elements in this array would be removed.

> It is worth paying attention that Faun will only match the first level of the route: if get a path like `/bar/baz`, it will only take `/bar` to find a matching route config. Downward routes, like `/baz`, would be taken over by sub-applications.

After finishing loading resources, sandbox will execute the bundle by `new Function()`, and the other resources by appending child nodes into targeted parent nodes.

Faun uses `history` to manage the top level routes, especially listen route changes. All the route and sandbox changes would be managed by `history` listener.

When the top level route changing, the former sandbox will unmount, then mount next sandbox with the new path. The `loading`, `loaded`, `mounted`, `beforeUnmount` and `umounted` lifecycle hooks will be triggered when changing route.

### Features

All the features are updated in [here](https://github.com/lenconda/faun/tree/docs#features)

## Quick Start

> The project is still under development, it is unrealistic to install it from npm, but you can clone this project from GitHub and bundle it into your project.

### Framework

The simplest HTML structure Faun required is:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title></title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
  </head>
  <body></body>
</html>
```

Route links that could be intercepted by Faun should be added a `data-faun-link` attribute:

In HTML/Vue template/JSX:

```html
<!-- It will be intercepted by Faun -->
<a href="/foo" data-faun-link>Foo</a>

<!-- It will not be intercepted by Faun, just jump to /foo/index.html -->
<a href="/foo"></a>
```

Install Faun:

```bash
$ npm install faun
```

Import Faun in your framework:

```javascript
// Node.js CommonJS
const Faun = require('faun');
// ES 6 Module
import Faun from 'faun';
// or by UMD
<script src="/path/to/faun.min.js"></script>
```

Initialize the framework application with:

```javascript
const app = new Faun();
```

Register sub applications map, for example:

```javascript
app.registerSubApplications({
  '/vue': {
    scripts: [
      '//localhost:8181/app.js',
    ],
    styles: [],
    mountPointID: 'app',
    useCSSPrefix: false,
  },
  '/react': {
    scripts: [
      '//localhost:8182/static/js/main.bundle.js',
      '//localhost:8182/static/js/vendors.chunk.js',
    ],
    styles: [
      '//localhost:8182/static/css/main.css',
    ],
    mountPointID: 'root',
    prefixElementSelector: () => document.body,
  },
});
```

it is also easy to load route configuration from a remote server:

```javascript
fetch('https://foo.com/api/routes')
  .then(routes =>
    app.registerModules(routes.json()
  ));
```

Create a listener for hooks:

```javascript
app.hook.unmounted = function(prev, next, sandbox) {
  console.log('unmounted', this);
  console.log('prev: ', prev);
  console.log('next: ', next);
  console.log('sandbox: ', sandbox);
};
```

Finally, run the framework:

```javascript
app.run();
```

### Sub Application

Since Faun is low invasive, we can just make a few modifications on sub-applications. The ONLY thing that you might have to pay attention to is that make sure all of the CSS and JavaScript resource URLs are right when sending to framework application.

It is usually seen that many Webpack applications has assets' `output.publicPath` like `/`. Since the application's URL is not the same as framework's, it could cause `404` errors when loading chunked assets.

To avoid this, we recommend to modify `output.publicPath` with absolute hostname. For example, an application is deployed at `example.com`, the `output.publicPath` could be `//example.com`.

Faun's sandbox also provide a more perfect method: `assetURLMapper` to modify URLs, just add it in your sub application config map:

```javascript
app.registerSubApplications({
  // ...
  '/react': {
    scripts: [
      // ...
    ],
    styles: [
      // ...
    ],
    // ...
    assetURLMapper: url => mapURL(url),
  },
});
```

the `assetURLMapper` method should return a new URL which is the right one to load resources.