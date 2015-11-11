import GraphQLStoreChangeEmitter from 'react-relay/lib/GraphQLStoreChangeEmitter';
import {
    injectNetworkLayer,
    IsomorphicRootContainer,
    loadAndStoreData,
} from 'isomorphic-relay';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Relay from 'react-relay';
import rootContainerProps from './rootContainerProps';

injectNetworkLayer(new Relay.DefaultNetworkLayer('http://localhost:8080/graphql'));

GraphQLStoreChangeEmitter.injectBatchingStrategy(() => {});

export default (res, next) => {
    loadAndStoreData(rootContainerProps).then(data => {
        const reactOutput = ReactDOMServer.renderToString(
            <IsomorphicRootContainer {...rootContainerProps} />
        );
        res.render(path.resolve(__dirname, '..', 'views', 'index.ejs'), {
            preloadedData: JSON.stringify(data),
            reactOutput
        });
    }, next);
}
