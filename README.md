<p align="center">
  <img src="./res/logo.png" width="832" height="142">
</p>

The bare-bones plugin architecture for [React](https://reactjs.org/) and [React Native](https://facebook.github.io/react-native/). Adheres to [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

## 🔥 Features

  - A `Component`-based Plugin architecture that will bend to your whim.
    - Describe your dependencies, versioning and configuration structure in pure React.
    - Whenever React is improved, so are your modular Plugins.
  - A self-maintaining library.
    - Whenever you expose access to the Redacted plugin hierarchy, you are inherently writing a new Plugin which can be overrided.
  - Plugins are defined using a version control structure inspired by the `package.json`.
    - Create plugins rapidly based upon the knowledge you already have.
    - Trust [semver](https://www.npmjs.com/package/semver) to prevent incompatible combinations of Plugins from crashing your app.
    - The React DOM clearly visualizes the pattern of property inheritence.
  - Bare bones.
    - Redacted is simply the core set of abilities you need to write an application that scales, and can be dynamically configured, either statically or at runtime.
    - It has an unopionated structure, so you don't have to feel constrained.
    - Since it's described using core React components and patterns, you can trust it will respond exactly how you'd expect it to.
  

## 🚀 Getting Started

Using [`npm`]():

```sh
npm install --save redacted
```

Using [`yarn`]():

```sh
yarn add redacted
```
## 📒 Documentation

### Intro

Good plugin systems are simple, unopinionated, scale easily and behave predictably.

However the _greatest_ ones?

The greatest ones are written in React.

Redacted is a self-maintaining, `Component`-based plugin framework that allows you to effectively structure the communication, inter-dependencies and operations between decoupled modules. The vision of this project is to ensure that your plugins meet the following expectations:

  - Simple to use and configure.
  - Should be self-documenting and maintaining.
  - Must be general enough to meet the _majority_ of use-cases.
  - Be comprised of core React language features to ensure compatibility, reliability and predictability.

If this project stays true to it's goals, you can be assured that:

  - You can easily interchange modules of functionality.
  - Your application is capable of exposing a decoupled, modular internal API.
  - The frontend can survive and respond to incompatible Plugin combinations.
  - It will be simple and to share distributed functionality across your application.

### Creating a Basic Plugin

### `<Plugin />`

The easiest way of getting started with Redacted is to use the `Plugin` component:

```javascript
import React from 'react';
import Plugin from 'redacted';

export default () => (
  <Plugin
    {...{
      // XXX: This should look familiar.
      name: 'MissionControl',
      version: '2.0.1',
    }}
    api={{
      // XXX: Plugins can define a public API
      //      that is accessible to any child.
      requestLaunch: countdown => new Promise(
        resolve => setTimeout(resolve, countdown * 1000)
      )
        .then(() => console.log('💥')),
    }}
  />
);
```

`<Plugin />`s have two required properties, a `name` and a `version`. The `name` prop is used to reconcile a plugin instance within the React DOM, whilst the `version` property is used to define the compatibility level of the `<Plugin/>`, when it is consumed by a child who is dependent upon it.

The real benefit of using a `<Plugin />` is that we can define an `api` prop. This allows any child element who is exported `withRedacted` to be able to see and interact with the accumulated hierarchical API of your application.

But what _is_ a Plugin, anyway? It doesn't look like it can even render anything?

### `withRedacted`

In truth, a `<Plugin />` is nothing special. It is just a `React.Fragment` that has been `export`ed using the `withRedacted` HOC, which is the atomic building block of Redacted:

```javascript
export default withRedacted(
  ({ key, children }) => (
    <React.Fragment
      key={key}
      children={children}
    />
  ),
);
```

This has a couple of consequences. The first is that you don't have to use a `<Plugin />` to consume your internal application API at all; you can just wrap any component you want `withRedacted`. But what's really special?

> In order for your `Component` to consume the Redacted Plugin API, you _must_ yourself become a `<Plugin/>`.

At any point in your application, you can define your consumer's `name` and `version`, and can even define an additional `api` for your child elements to consume. 

This concept lies at the core of what Redacted is; it's not a very complicated idea, but it's a _good_ one:

  - Elements that have access to the Redacted context must define at the minimum some versioning information.
    - This promotes continual **documentation**.
    - It helps describe and manage feature propagation at a granular level.
    - They can define dependencies to ensure your application becomes and **robust** and resistant to configuration errors.
  - They help promote **segmentation by responsibility**.
    - You can describe successive levels of functionality and the relative consumers.
    - This matches how a thoughtfully-designed application frontend is normally structured.
  - Non-dynamic elements are **unaffected**.
    - Your codebase **doesn't have to change enormously** because you're now using Redacted.
    - This supports **incremental adoption** (If you're using other Plugin systems, that's fine!).

```javascript
import React, { useEffect } from 'react';
import Plugin, { withRedacted } from 'redacted';
import Apollo11 from './components/Apollo11';

const Spaceship = withRedacted(
  ({ require, redacted, ...extraProps }) => {
    // XXX: It is also possible to access some meta information
    //      that is internally assigned to a <Plugin /> by Redacted.
    const { id } = redacted;
    useEffect(
      () => {
        // When we mount, let's request launch!
        const { requestLaunch } = require('MissionControl');
        requestLaunch()
          .then(() => {
            // TODO: Remember to activate boosters.
          });
      },
    );
    return (
      <Apollo11
        {...extraProps}
      />
    );
  },
  {
    name: 'Spaceship',
    version: '0.0.1',
    dependencies: {
      'MissionControl': '>=2.0.0',
    },
  },
);

export default () => (
  <Plugin
    {...{
      // XXX: This should look familiar.
      name: 'MissionControl',
      version: '2.0.1',
    }}
    api={{
      // XXX: Plugins can define a public API
      //      that is accessible to any child
      //      consumer.
      requestLaunch: () => Promise
        .resolve('💥'),
    }}
  >
    <Spaceship
      astronauts={[
        'armstrong', 'aldrin',
      ]}
    />
  </Plugin>
);
```

Note how this looks like regular React, but now we've not only got some versioning control in there, but it would be quite easy to change the implementation of either our `<Spaceship />` or `<MissionControl />` and rest assured our application will respond predictably.

As you can see, the `<Spaceship />` wishes to `requestLaunch` from `<MissionControl />`. In order to fulfill this, the following criteria must be met:

  - `Spaceship` has marked `MissionControl` as a dependency.
  - `MissionControl` has satisfied the minimum version as defined in `Spaceship`'s dependencies.
  - `requestLaunch` has been published as part of `MissionControl`'s public api.



And that's it! Pretty straight forward, but hopefully, pretty extensible.

### The `useRedacted` Hook

If you don't want to roll a dedicated `<Plugin/>` component just to simply consume the evaluated Redacted API, you can `useRedacted` to require a plugin `api` dependency directly. However, implementors must note that this should be done **with care**:

```javascript
import React, { useEffect } from 'react';
import { withRedacted, useRedacted } from 'redacted';

const Pirate = withRedacted(
  React.Fragment,
  {
    version: '1.0.0',
    name: 'Pirate',
    api: {
      greet: () => console.log('Yarr, matey!'),
    },
  },
);

const Hook = () => {
  const { greet } = useRedacted('Pirate');
  useEffect(
    () => {
      greet();
    },
  );
  return (
    <div />
  );
};

export default () => (
  <Pirate
  >
    <Hook/>
  </Pirate>
);
```

In the example above, you can see that you **do not** have to specify a `version` when consuming a plugin `api`. This is done for ease of use; however it [can and will](https://en.wikipedia.org/wiki/Sod%27s_law) lead to runtime errors if your plugins change unpredictably. It is therefore recommended that if you do intend to use hooks, they should be scoped within a `<Plugin />` which specifies the appropriate configuration context in order to function as expected:

```javascript
import React from 'react';
import uuidv4 from 'uuid/v4';
import Plugin from 'redacted';

export default = ({ ...extraProps }) => (
  <Plugin
    {...{
      name: uuidv4(),
      version: '0.0.1',
      dependencies: {
        // XXX: All dependencies listed here should define the appropriate
        //      context for all calls to `useRedacted` by any nested children.
      },
    }}
  >
  </Plugin>
);
```

## ✌️ License
[MIT](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="https://www.buymeacoffee.com/cawfree">
    <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy @cawfree a coffee" width="232" height="50" />
  </a>
</p>
