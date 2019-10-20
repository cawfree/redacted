import React, { useEffect, useState, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { deepMerge, cloneDeep } from 'lodash';
import { coerce, satisfies } from 'semver';

const defaultOptions = {
  name: undefined,
  version: undefined,
  dependencies: {},
  api: {},
};

const Context = React
  .createContext(
    {
      dependencies: {},
      require: (pkg) => {
        throw new Error(
          `Redacted: Unable to require "${pkg}", as it was not present in the dependency map. 😔`,
        );
      },
    },
  );

const getMissingDependencies = (global = {}, local = {}) => {
  return Object
    .entries(local)
    .reduce(
      (arr, [ name, version ]) => {
        const supported = (typeof global[name] === 'string') && satisfies(
          coerce(
            global[name],
          ),
          version,
        );
        return [
          ...arr,
          (!supported) && ([ name, version ]),
        ];
      },
      [],
    )
      .filter(e => !!e);
};

const hasAllDependencies = (global = {}, local = {}) => getMissingDependencies(global, local).length === 0;

const Redactee = ({ name, version, Component, require, global, local, api, ...extraProps }) => {
  useEffect(
    () => {
      if (typeof name !== 'string' || name.length <= 0) {
        throw new Error(
          `Redacted: The "name" prop is a required string, but received ${name}. 😔`,
        );
      } else if (typeof version !== 'string' || version.length <= 0) {
        throw new Error(
          `Redacted: The "version" prop is a required string, but received ${version}. 😔`,
        );
      } else if (name.charAt(0) !== name.charAt(0).toUpperCase()) {
        throw new Error(
          `Redacted: At this time, it is only possible to specify plugin components using an uppercase name. (Received "${name}", should be "${name.charAt(0).toUpperCase()}${name.substring(1)}".)`,
        );
      }
    },
    [ name, version ],
  );
  const hasAll = useMemo(
    () => hasAllDependencies(global, local),
    [global, local],
  );
  if (hasAll) {
    return (
      <Context.Provider
        value={{
          require: (pkg) => {
            if (pkg === name) {
              return cloneDeep(
                api,
              );
            }
            return require(pkg);
          },
          dependencies: {
            ...global,
            [name]: version,
          },
        }}
      >
        <Component
          {...extraProps}
          require={(pkg) => {
            if (local[pkg]) {
              return require(pkg);
            }
            throw new Error(
              `Redacted: Plugin "${name}" attempted to require "${pkg}", but it is not marked as a dependency. "${pkg}" should be marked as a dependency of "${name}".`,
            );
          }}
        />
      </Context.Provider>
    );
  }
  console
    .warn(
      `Redacted: Plugin "${name}" has missing dependencies, so neither it nor it's children will be rendered. 💨\n${getMissingDependencies(global, local)
        .map(([k, v], i, arr) => `Missing: ${k}@${v}`)
        .join('\n')}`,
    );
  return null;
};

Redactee.propTypes = {
  name: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  Component: PropTypes.elementType.isRequired,
  require: PropTypes.func.isRequired,
  global: PropTypes.shape({}).isRequired,
  local: PropTypes.shape({}).isRequired,
  api: PropTypes.shape({}),
};

Redactee.defaultProps = {
  api: {},
};

export const withRedacted = (Component, options = defaultOptions) => class Redacted extends React.Component {
  static contextType = Context;
  static propTypes = {
    // eslint-disable-next-line react/forbid-foreign-prop-types
    ...(Component.propTypes || {}),
    name: (
        typeof options.name === 'string' ? PropTypes.string : PropTypes.string.isRequired
    ),
    version: (
        typeof options.version === 'string' ? PropTypes.string : PropTypes.string.isRequired
    ),
    api: PropTypes.shape({}),
    dependencies: PropTypes.shape({}),
  };
  static defaultProps = {
    ...(Component.defaultProps || {}),
    ...Redactee.defaultProps,
    ...cloneDeep(defaultOptions),
    ...(options || defaultOptions),
  };
  render() {
    const { dependencies: global,...extraContext } = this.context;
    const { dependencies: local, ...extraProps } = this.props;
    const { name, version } = options;
    return (
      <Redactee
        local={local}
        global={global}
        Component={Component}
        name={name}
        version={version}
        {...extraProps}
        {...extraContext}
      />
    );
  }
};

export const useRedacted = (...args) => useContext(Context).require(...args);

export default withRedacted(
  ({ key, children }) => (
    <React.Fragment
      key={key}
      children={children}
    />
  ),
);
