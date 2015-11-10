import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {
    IsomorphicRootContainer,
    storePreloadedData,
} from 'isomorphic-relay';
import rootContainerProps from './rootContainerProps';

const data = JSON.parse(document.getElementById('preloadedData').textContent);

storePreloadedData(rootContainerProps, data).then(render, render);

function render() {
    const rootElement = document.getElementById('root');

    ReactDOM.render(<IsomorphicRootContainer {...rootContainerProps} />, rootElement);
}
