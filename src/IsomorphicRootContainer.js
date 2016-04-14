import IsomorphicRenderer from './IsomorphicRenderer';
import React from 'react';
import Relay from 'react-relay';

function IsomorphicRootContainer({
    Component,
    forceFetch,
    onReadyStateChange,
    relayEnvironment,
    renderFailure,
    renderFetched,
    renderLoading,
    route,
}) {
    return (
        <IsomorphicRenderer
            Container={Component}
            forceFetch={forceFetch}
            onReadyStateChange={onReadyStateChange}
            queryConfig={route}
            relayEnvironment={relayEnvironment}
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

IsomorphicRootContainer.defaultProps = {
    relayEnvironment: Relay.Store,
};
IsomorphicRootContainer.propTypes = {
    ...Relay.RootContainer.propTypes,
    relayEnvironment: Relay.PropTypes.Context,
};
IsomorphicRootContainer.childContextTypes = Relay.RootContainer.childContextTypes;

export default IsomorphicRootContainer;
