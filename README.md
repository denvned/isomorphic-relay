Isomorphic React Relay
======================
Adds server side rendering support to React Relay.

Thanks to [@voideanvalue](https://github.com/voideanvalue) for the [information](https://github.com/facebook/relay/issues/36#issuecomment-130402024) that helped to build this package.

Installation
------------

    npm install -S isomorphic-relay

How to use
----------

Make sure *isomorphic-relay* module is loaded before *react-relay* on the server, because it prevents *"self is not defined"* error (see [facebook/fbjs#47](https://github.com/facebook/fbjs/issues/47)).

Inject a network layer to *isomorphic-relay* (but not to Relay itself) **on the server**:
```javascript
import {injectNetworkLayer} from 'isomorphic-relay';
injectNetworkLayer(new Relay.DefaultNetworkLayer('http://localhost:8080/graphql'));
```
Inject a no-op batching strategy into `GraphQLStoreChangeEmitter` **on the server**:
```javascript
import GraphQLStoreChangeEmitter from 'react-relay/lib/GraphQLStoreChangeEmitter';
GraphQLStoreChangeEmitter.injectBatchingStrategy(() => {});
```
When processing a request **on the server**, preload data using `loadAndStoreData`, then render React using `IsomorphicRootContainer` in place of `Relay.RootContainer`, and send the React output along with the data to the client:
```javascript
import {
  IsomorphicRootContainer,
  loadAndStoreData
} from 'isomorphic-relay';

app.get('/', (req, res, next) => {
  const rootContainerProps = {
    Component: MyContainer,
    route: new MyRoute(),
  };
  loadAndStoreData(rootContainerProps).then(data => {
    const reactOutput = ReactDOMServer.renderToString(
      <IsomorphicRootContainer {...rootContainerProps} />
    );
    res.render('index.ejs', {
      preloadedData: JSON.stringify(data),
      reactOutput
    });
  }, next);
});
```
On initial page load **in the browser**, store the preloaded data in the Relay store using `storePreloadedData`, then render React using `IsomorphicRootContainer` in place of `Relay.RootContainer`:
```javascript
import {
  IsomorphicRootContainer,
  storePreloadedData,
} from 'isomorphic-relay';
import rootProps from './rootContainerProps';

const rootContainerProps = {
  Component: MyContainer,
  route: new MyRoute(),
};
const data = JSON.parse(document.getElementById('preloadedData').textContent);

storePreloadedData(rootContainerProps, data).then(render, render);

function render() {
  const rootElement = document.getElementById('root');

  ReactDOM.render(<IsomorphicRootContainer {...rootContainerProps} />, rootElement);
}
```
**Important note:** pass the same properties (i.e. containing the same `Component`, and the same `route` with the same route parameters) to `loadAndStoreData` on the server, to `storePreloadedData` in the browser, and to `IsomorphicRootContainer` both on the server, and in the browser on initial page load.

Example
-------
See [here](https://github.com/denvned/isomorphic-relay/tree/master/examples/star-wars).
