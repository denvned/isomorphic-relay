import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';
import rootContainerProps from './rootContainerProps';

const GRAPHQL_URL = `http://localhost:8080/graphql`;

const data = JSON.parse(document.getElementById('preloadedData').textContent);

const environment = new Relay.Environment();

environment.injectNetworkLayer(new Relay.DefaultNetworkLayer(GRAPHQL_URL));

// IsomorphicRelay.injectPreparedData(data, environment);

const rootElement = document.getElementById('root');

ReactDOM.render(
  (
    <IsomorphicRelay.RootContainer
      environment={environment}
      {...rootContainerProps}
    />
  ),
  rootElement
);
