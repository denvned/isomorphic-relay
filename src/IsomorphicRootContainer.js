import IsomorphicRenderer from './IsomorphicRenderer';
import React from 'react';
import Relay from 'react-relay';

function IsomorphicRootContainer({
    Component,
    forceFetch,
    onReadyStateChange,
    renderFailure,
    renderFetched,
    renderLoading,
    route,
}) {
    return (
        <IsomorphicRenderer
            Component={Component}
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

Object.setPrototypeOf(IsomorphicRootContainer, Relay.RootContainer);

export default IsomorphicRootContainer;
