import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';
import rootContainerProps from './rootContainerProps';

const environment = Relay.Store;

const data = JSON.parse(document.getElementById('preloadedData').textContent);

const rootElement = document.getElementById('root');

IsomorphicRelay.injectPreparedData(environment, data);

IsomorphicRelay.prepareInitialRender({ ...rootContainerProps, environment }).then(props => {
  ReactDOM.render(<IsomorphicRelay.Renderer {...props} />, rootElement);
});
