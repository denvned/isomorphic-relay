import React from 'react';
import Relay from 'react-relay';

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
  return (
    <Relay.Renderer
      Container={Component}
      forceFetch={forceFetch}
      onReadyStateChange={onReadyStateChange}
      queryConfig={route}
      render={render}
      environment={environment}
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
