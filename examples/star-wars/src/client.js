import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';
import rootContainerProps from './rootContainerProps';

const data = JSON.parse(document.getElementById('preloadedData').textContent);

IsomorphicRelay.injectPreparedData(data);

const rootElement = document.getElementById('root');

ReactDOM.render(<IsomorphicRelay.RootContainer {...rootContainerProps} />, rootElement);
