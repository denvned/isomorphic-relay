Isomorphic React Relay
======================
Adds server side rendering support to React Relay.

Thanks to [@voideanvalue](https://github.com/voideanvalue) for the [information](https://github.com/facebook/relay/issues/36#issuecomment-130402024) that helped to build this package.

Installation
------------

    npm install -S isomorphic-relay

How to use
----------

Inject a network layer to *isomorphic-relay* **on the server**:
```javascript
import {injectNetworkLayer} from 'isomorphic-relay';
injectNetworkLayer(new MyNetworkLayer('http://localhost:8080/graphql'));
```
And import `react-relay/lib/RelayPublic` module instead of `react-relay` everywhere to prevent automatic loading of `RelayDefaultNetworkLayer`, which throws an exception on the server (see [facebook/fbjs#47](https://github.com/facebook/fbjs/issues/47)). But you should import `react-relay` at least once in the browser (e.g. in the browser entry script), if you don't inject a custom network layer in the browser.

Inject a no-op batching strategy into `GraphQLStoreChangeEmitter` **on the server**:
```javascript
import GraphQLStoreChangeEmitter from 'react-relay/lib/GraphQLStoreChangeEmitter';
GraphQLStoreChangeEmitter.injectBatchingStrategy(() => {});
```
When processing a request **on the server**, preload data using `loadAndStoreData`, render React using `IsomorphicRootContainer` in place of `Relay.RootContainer`, and send the React output with the data to the browser:
```javascript
import {
  IsomorphicRootContainer,
  loadAndStoreData
} from 'isomorphic-relay';

app.get('/', (req, res, next) => {
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
On initial page load **in the browser**, store the preloaded data in the Relay store using `storePreloadedData`, render React using `IsomorphicRootContainer` in place of `Relay.RootContainer`:
```javascript
import {
  IsomorphicRootContainer,
  storePreloadedData,
} from 'isomorphic-relay';
import rootProps from './rootContainerProps';

const data = JSON.parse(document.getElementById('preloadedData').textContent);

storePreloadedData(rootContainerProps, data).then(render, render);

function render() {
  const rootElement = document.getElementById('root');

  ReactDOM.render(<IsomorphicRootContainer {...rootContainerProps} />, rootElement);
}
```
**Important note:** pass the same properties containing `Component` and `route` to `loadAndStoreData`, `storePreloadedData`, and `IsomorphicRootContainer` when processing request on the server, and on initial page load in the browser.

Example
-------
See [here](https://github.com/denvned/isomorphic-relay/tree/master/examples/star-wars).
