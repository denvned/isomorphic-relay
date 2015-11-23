Isomorphic React Relay [![npm version][npm-badge]][npm]
======================
Adds server side rendering support to [React Relay](https://facebook.github.io/relay/).

If you are using [react-router-relay](https://github.com/relay-tools/react-router-relay),
then you might also be interested in
[isomorphic-relay-router](https://github.com/denvned/isomorphic-relay-router),
which uses *isomorphic-relay*.

Acknowledgments
---------------

Thanks to [@voideanvalue](https://github.com/voideanvalue) for the
[information](https://github.com/facebook/relay/issues/36#issuecomment-130402024)
that helped create the initial version this project. I also thanks
[@josephsavona](https://github.com/josephsavona) for valuable
[advices](https://github.com/facebook/relay/issues/589) that helped improve it.

Installation
------------

    npm install -S isomorphic-relay

How to use
----------

Make sure *isomorphic-relay* module is loaded before *react-relay* on the server,
because *isomorphic-relay* includes a hack to prevent *"self is not defined"* error
(see https://github.com/facebook/fbjs/issues/47):
```javascript
// First load isomorphic-relay:
import IsomorphicRelay from 'isomorphic-relay';

// And only then load react-relay:
import Relay from 'react-relay';
```

Don't forget to inject a network layer to Relay on the server.
And if you are using `Relay.DefaultNetworkLayer`, specify the full url to the GraphQL endpoint:
```javascript
const GRAPHQL_URL = `http://localhost:8080/graphql`;

Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer(GRAPHQL_URL));
```

Inject a no-op batching strategy into `GraphQLStoreChangeEmitter`, but **only on the server:**
```javascript
import GraphQLStoreChangeEmitter from 'react-relay/lib/GraphQLStoreChangeEmitter';

GraphQLStoreChangeEmitter.injectBatchingStrategy(() => {});
```

When processing a request **on the server**, prepare the data using `IsomorphicRelay.prepareData`,
then render React using `IsomorphicRelay.RootContainer` in place of `Relay.RootContainer`,
and send the React output along with the data to the client:
```javascript
app.get('/', (req, res, next) => {
  const rootContainerProps = {
    Component: MyContainer,
    route: new MyRoute(),
  };

  IsomorphicRelay.prepareData(rootContainerProps).then(data => {
    const reactOutput = ReactDOMServer.renderToString(
      <IsomorphicRelay.RootContainer {...rootContainerProps} />
    );

    res.render('index.ejs', {
      preloadedData: JSON.stringify(data),
      reactOutput
    });
  }, next);
});
```

On page load **in the browser**, inject the prepared data to the Relay store
using `IsomorphicRelay.injectPreparedData`, then render React using `IsomorphicRelay.RootContainer`
in place of `Relay.RootContainer`:
```javascript
const data = JSON.parse(document.getElementById('preloadedData').textContent);

IsomorphicRelay.injectPreparedData(data);

const rootElement = document.getElementById('root');

// use the same rootContainerProps as on the server
ReactDOM.render(<IsomorphicRelay.RootContainer {...rootContainerProps} />, rootElement);
```

Example
-------
See [here](examples/star-wars).

[npm-badge]: https://img.shields.io/npm/v/isomorphic-relay.svg
[npm]: https://www.npmjs.com/package/isomorphic-relay
