import React from 'react';
import Relay from 'react-relay/classic';

const INACTIVE_READY_STATE = {
  aborted: false,
  done: false,
  error: null,
  ready: false,
  stale: false,
};

export default class IsomorphicRenderer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.mounted = true;
    this.pendingRequest = null;
    this.state = {
      active: !!props.initialReadyState,
      readyState: props.initialReadyState || INACTIVE_READY_STATE,
      retry: this._retry.bind(this),
    };
  }

  componentDidMount() {
    const { readyState } = this.state;
    if (!readyState || !readyState.done) {
      this._runQueries(this.props);
    }
  }

  _runQueries({ Container, forceFetch, queryConfig, environment, shouldFetch }) {
    if (!shouldFetch) {
      return;
    }

    const onReadyStateChange = readyState => {
      if (!this.mounted) {
        this._handleReadyStateChange({...readyState, mounted: false});
        return;
      }

      if (request !== this.pendingRequest) {
        return;
      }

      if (readyState.aborted || readyState.done || readyState.error) {
        this.pendingRequest = null;
      }

      this.setState({
        active: true,
        readyState,
      });
    };

    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }

    const querySet = Relay.getQueries(Container, queryConfig);
    const request = this.pendingRequest =
      environment[forceFetch ? 'forceFetch' : 'primeCache'](querySet, onReadyStateChange);
  }

  _retry() {
    const { readyState } = this.state;
    if (readyState && readyState.error) {
      this._runQueries(this.props);
      this.setState({ readyState: null });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.Container !== this.props.Container ||
      nextProps.environment !== this.props.environment ||
      nextProps.queryConfig !== this.props.queryConfig ||
      nextProps.shouldFetch && !this.props.shouldFetch ||
      nextProps.forceFetch && !this.props.forceFetch
    ) {
      this._runQueries(nextProps);
      this.setState({ readyState: null });
    }
  }

  componentDidUpdate({}, prevState) {
    const { readyState } = this.state;
    if (readyState && readyState !== prevState.readyState) {
      this._handleReadyStateChange({ ...readyState, mounted: true });
    }
  }

  _handleReadyStateChange(readyState) {
    if (this.props.onReadyStateChange) {
      this.props.onReadyStateChange(readyState);
    }
  }

  componentWillUnmount() {
    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }

    this.mounted = false;
  }

  render() {
    const readyState = this.state.active ? this.state.readyState : INACTIVE_READY_STATE;

    return (
      <Relay.ReadyStateRenderer
        Container={this.props.Container}
        environment={this.props.environment}
        queryConfig={this.props.queryConfig}
        readyState={readyState}
        render={this.props.render}
        retry={this.state.retry}
      />
    );
  }
}

IsomorphicRenderer.propTypes = {
  Container: Relay.PropTypes.Container,
  forceFetch: React.PropTypes.bool,
  initialReadyState: React.PropTypes.shape({
    aborted: React.PropTypes.bool.isRequired,
    done: React.PropTypes.bool.isRequired,
    error: React.PropTypes.any,
    ready: React.PropTypes.bool.isRequired,
    stale: React.PropTypes.bool.isRequired,
  }),
  onReadyStateChange: React.PropTypes.func,
  queryConfig: Relay.PropTypes.QueryConfig.isRequired,
  environment: Relay.PropTypes.Environment,
  render: React.PropTypes.func,
  shouldFetch: React.PropTypes.bool,
};

IsomorphicRenderer.defaultProps = {
  shouldFetch: true,
};
