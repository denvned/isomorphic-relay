import IsomorphicRelay from 'isomorphic-relay';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Relay from 'react-relay';
import rootContainerProps from './rootContainerProps';

const GRAPHQL_URL = `http://localhost:8080/graphql`;

export default (res, next) => {
  const environment = new Relay.Environment();
  environment.injectNetworkLayer(new Relay.DefaultNetworkLayer(GRAPHQL_URL));
  IsomorphicRelay.prepareData(rootContainerProps, environment).then(({data, props}) => {
    const reactOutput = ReactDOMServer.renderToString(
      <IsomorphicRelay.RootContainer {...props} />
    );
    res.render(path.resolve(__dirname, '..', 'views', 'index.ejs'), {
      preloadedData: JSON.stringify(data),
      reactOutput
    });
  }, next);
}
