import React from 'react';
import Relay from 'react-relay';
import checkRelayQueryData from 'react-relay/lib/checkRelayQueryData';
import flattenSplitRelayQueries from 'react-relay/lib/flattenSplitRelayQueries';
import splitDeferredRelayQueries from 'react-relay/lib/splitDeferredRelayQueries';

function IsomorphicRootContainer({
  Component,
  forceFetch,
  onReadyStateChange,
  environment,
  renderFailure,
  renderFetched,
  renderLoading,
  route,
}) {
  const isCached = !forceFetch && checkCache(environment, Component, route);
  return isCached ? (
    <Relay.ReadyStateRenderer
      Container={Component}
      environment={environment}
      queryConfig={route}
      readyState={{
        aborted: false,
        done: true,
        ready: true,
        stale: false,
      }}
      render={render}
    />
  ) : (
    <Relay.Renderer
      Container={Component}
      environment={environment}
      forceFetch={forceFetch}
      onReadyStateChange={onReadyStateChange}
      queryConfig={route}
      render={render}
    />
  );

  function render({done, error, props, retry, stale}) {
    if (error) {
      if (renderFailure) {
        return renderFailure(error, retry);
      }
    } else if (props) {
      if (renderFetched) {
        return renderFetched(props, {done, stale});
      } else {
        return <Component {...props} />;
      }
    } else {
      if (renderLoading) {
        return renderLoading();
      }
    }
    return undefined;
  }
}

function checkCache(environment, Container, queryConfig) {
  const querySet = Relay.getQueries(Container, queryConfig);
  const queuedStore = environment.getStoreData().getQueuedStore();
  let done = true;
  const ready = Object.keys(querySet).every(name =>
    flattenSplitRelayQueries(splitDeferredRelayQueries(querySet[name]))
      .every(query => {
        if (!checkRelayQueryData(queuedStore, query)) {
          done = false;
          if (!query.isDeferred()) {
            return false;
          }
        }
        return true;
      })
  );
  return done && ready;
}

IsomorphicRootContainer.propTypes = {
  Component: Relay.PropTypes.Container,
  environment: Relay.PropTypes.Environment,
  forceFetch: React.PropTypes.bool,
  onReadyStateChange: React.PropTypes.func,
  renderFailure: React.PropTypes.func,
  renderFetched: React.PropTypes.func,
  renderLoading: React.PropTypes.func,
  route: Relay.PropTypes.QueryConfig.isRequired,
};
IsomorphicRootContainer.childContextTypes = {
  route: Relay.PropTypes.QueryConfig.isRequired,
};

export default IsomorphicRootContainer;
