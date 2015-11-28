import GraphQLStoreChangeEmitter from 'react-relay/lib/GraphQLStoreChangeEmitter';
import IsomorphicRelay from 'isomorphic-relay';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Relay from 'react-relay';
import util from 'util';
//import rootContainerProps from './rootContainerProps';
import StarWarsApp from './components/StarWarsApp';
import StarWarsAppHomeRoute from './routes/StarWarsAppHomeRoute';

const GRAPHQL_URL = `http://localhost:8080/graphql`;

Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer(GRAPHQL_URL));

GraphQLStoreChangeEmitter.injectBatchingStrategy(() => {});

export default (req, res, next) => {
    let { names, ships } = req.query;
    let rootContainerProps = {
        Component: StarWarsApp,
        route: new StarWarsAppHomeRoute({
            factionNames: (names || 'empire,rebels').split(','),
            shipCount: ships | 0
        }),
    };

    IsomorphicRelay.prepareData(rootContainerProps).then(data => {
        console.log('DATA:',util.inspect(data,false,10,true));
        const reactOutput = ReactDOMServer.renderToString(
            <IsomorphicRelay.RootContainer {...rootContainerProps} />
        );
        res.render(path.resolve(__dirname, '..', 'views', 'index.ejs'), {
            preloadedData: JSON.stringify(data),
            reactOutput
        });
    }, next);
}
