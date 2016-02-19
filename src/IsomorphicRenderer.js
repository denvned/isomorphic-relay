import React from 'react';
import Relay from 'react-relay';
import RelayFragmentPointer from 'react-relay/lib/RelayFragmentPointer';
import StaticContainer from 'react-static-container';

import checkRelayQueryData from 'react-relay/lib/checkRelayQueryData';
import flattenSplitRelayQueries from 'react-relay/lib/flattenSplitRelayQueries';
import invariant from 'fbjs/lib/invariant';
import mapObject from 'fbjs/lib/mapObject';
import splitDeferredRelayQueries from 'react-relay/lib/splitDeferredRelayQueries';

class IsomorphicRenderer extends React.Component {
  constructor(props, context) {
    super(props, context);
    const garbageCollector =
      this.props.relayContext.getStoreData().getGarbageCollector();
    this.gcHold = garbageCollector && garbageCollector.acquireHold();
    this.mounted = true;
    this.pendingRequest = null;
    this.state = this._buildInitialState();
  }

  _buildInitialState() {
    const {Container, forceFetch, queryConfig, relayContext} = this.props;

    const querySet = Relay.getQueries(Container, queryConfig);

    const {done, ready} = checkCache(relayContext, querySet);

    if (ready) {
      const props = {
        ...queryConfig.params,
        ...mapObject(
          querySet,
          query => createFragmentPointerForRoot(relayContext, query)
        ),
      };
      const readyState = {
        aborted: false,
        done: done && !forceFetch,
        error: null,
        mounted: true,
        ready: true,
        stale: !!forceFetch,
      };
      return this._buildState(Container, relayContext, queryConfig, readyState, props);
    }

    return this._buildState(null, null, null, null, null);
  }

  _buildState(activeContainer, activeContext, activeQueryConfig, readyState, props) {
    return {
      activeContainer,
      activeContext,
      activeQueryConfig,
      readyState: readyState && {...readyState, mounted: true},
      renderArgs: {
        done: !!readyState && readyState.done,
        error: readyState && readyState.error,
        props,
        retry: () => this._retry(),
        stale: !!readyState && readyState.stale,
      },
    };
  }

  _buildAndSetState(activeContainer, activeContext, activeQueryConfig, readyState, props) {
    this.setState(this._buildState(
      activeContainer,
      activeContext,
      activeQueryConfig,
      readyState,
      props
    ));
  }

  getChildContext() {
    const {queryConfig: route, relayContext: relay} = this.props;
    return {relay, route};
  }

  componentDidMount() {
    const {readyState} = this.state;
    if (!readyState || !readyState.done) {
      this._runQueries(this.props);
    }
  }

  _runQueries(props) {
    const {Container, forceFetch, queryConfig, relayContext} = props;
    const querySet = Relay.getQueries(Container, queryConfig);
    const onReadyStateChange = readyState => {
      if (!this.mounted) {
        this._handleReadyStateChange({...readyState, mounted: false});
        return;
      }
      if (request !== this.pendingRequest) {
        return;
      }
      let {props, stale} = this.state.renderArgs;
      if (props && !readyState.ready) {
        // Do not regress the prepared ready state.
        readyState = {...readyState, ready: true, stale};
      }
      if (readyState.aborted || readyState.done || readyState.error) {
        this.pendingRequest = null;
      } else if (props && stale === readyState.stale) {
        // Do not override the prepared state if there is nothing new.
        return;
      }
      if (readyState.ready && !props) {
        props = {
          ...queryConfig.params,
          ...mapObject(
            querySet,
            query => createFragmentPointerForRoot(relayContext, query)
          ),
        };
      }
      this._buildAndSetState(Container, relayContext, queryConfig, readyState, props);
    };

    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }

    const request = this.pendingRequest = forceFetch ?
      (
        props.onForceFetch ?
          props.onForceFetch(querySet, onReadyStateChange) :
          relayContext.forceFetch(querySet, onReadyStateChange)
      ) :
      (
        props.onPrimeCache ?
          props.onPrimeCache(querySet, onReadyStateChange) :
          relayContext.primeCache(querySet, onReadyStateChange)
      );
  }

  _runQueriesAndSetState(props) {
    this._runQueries(props);
    this._buildAndSetState(
      this.state.activeContainer,
      this.state.activeContext,
      this.state.activeQueryConfig,
      null,
      null
    );
  }

  _shouldUpdate() {
    const {activeContainer, activeContext, activeQueryConfig} = this.state;
    const {Container, queryConfig, relayContext} = this.props;
    return (
      (!activeContainer || Container === activeContainer) &&
      (!activeContext || relayContext === activeContext) &&
      (!activeQueryConfig || queryConfig === activeQueryConfig)
    );
  }
  
  _retry() {
    const {readyState} = this.state;
    invariant(
      readyState && readyState.error,
      'RelayRenderer: You tried to call `retry`, but the last request did ' +
      'not fail. You can only call this when the last request has failed.'
    );
    this._runQueriesAndSetState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.Container !== this.props.Container ||
        nextProps.queryConfig !== this.props.queryConfig ||
        nextProps.relayContext !== this.props.relayContext ||
        (nextProps.forceFetch && !this.props.forceFetch)) {
      if (nextProps.relayContext !== this.props.relayContext) {
        if (this.gcHold) {
          this.gcHold.release();
        }
        const garbageCollector =
          nextProps.relayContext.getStoreData().getGarbageCollector();
        this.gcHold = garbageCollector && garbageCollector.acquireHold();
      }
      this._runQueriesAndSetState(nextProps);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {readyState} = this.state;
    if (readyState) {
      if (!prevState || readyState !== prevState.readyState) {
        this._handleReadyStateChange(readyState);
      }
    }
  }

  _handleReadyStateChange(readyState) {
    const {onReadyStateChange} = this.props;
    if (onReadyStateChange) {
      onReadyStateChange(readyState);
    }
  }

  componentWillUnmount() {
    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }
    if (this.gcHold) {
      this.gcHold.release();
    }
    this.gcHold = null;
    this.mounted = false;
  }

  render() {
    let children;
    let shouldUpdate = this._shouldUpdate();
    if (shouldUpdate) {
      const {Container, render} = this.props;
      const {renderArgs} = this.state;
      if (render) {
        children = render(renderArgs);
      } else if (renderArgs.props) {
        children = <Container {...renderArgs.props} />;
      }
    }
    if (children === undefined) {
      children = null;
      shouldUpdate = false;
    }
    return (
      <StaticContainer shouldUpdate={shouldUpdate}>
        {children}
      </StaticContainer>
    );
  }
}

function checkCache(relayContext, querySet) {
  const queuedStore = relayContext.getStoreData().getQueuedStore();

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
  return {done, ready};
}

function createFragmentPointerForRoot(relayContext, query) {
  return query ?
    RelayFragmentPointer.createForRoot(
      relayContext.getStoreData().getQueuedStore(),
      query
    ) :
    null;
}

IsomorphicRenderer.propTypes = {
  Container: Relay.PropTypes.Container,
  forceFetch: React.PropTypes.bool,
  onReadyStateChange: React.PropTypes.func,
  queryConfig: Relay.PropTypes.QueryConfig.isRequired,
  relayContext: Relay.PropTypes.Context,
  render: React.PropTypes.func,
};

IsomorphicRenderer.childContextTypes = {
  relay: Relay.PropTypes.Context,
  route: Relay.PropTypes.QueryConfig.isRequired,
};

export default IsomorphicRenderer;
