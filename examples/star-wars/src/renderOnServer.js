import GraphQLStoreChangeEmitter from 'react-relay/lib/GraphQLStoreChangeEmitter';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Relay from 'react-relay/lib/RelayPublic';
import RelayDefaultNetworkLayer from './forks/RelayDefaultNetworkLayer';
import {
    injectNetworkLayer,
    IsomorphicRootContainer,
    loadAndStoreData,
} from 'isomorphic-relay';
import rootContainerProps from './rootContainerProps';

injectNetworkLayer(new RelayDefaultNetworkLayer('http://localhost:8080/graphql'));

GraphQLStoreChangeEmitter.injectBatchingStrategy(() => {});

export default function render(res, next) {
    loadAndStoreData(rootContainerProps).then(data => {
        const reactOutput = ReactDOMServer.renderToString(
            <IsomorphicRootContainer {...rootContainerProps} />
        );
        res.render(path.resolve(__dirname, '..', 'views', 'index.ejs'), {preloadedData: JSON.stringify(data), reactOutput});
    }, next);
}
