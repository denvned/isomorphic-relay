Isomorphic React Relay [![npm version][npm-badge]][npm]
======================
Adds server side rendering support to [React Relay](https://facebook.github.io/relay/).

If you are using [react-router-relay](https://github.com/relay-tools/react-router-relay),
then you might also be interested in
[isomorphic-relay-router](https://github.com/denvned/isomorphic-relay-router),
which uses *isomorphic-relay*.

What's new
----------

- Since version 0.5 Isomorphic Relay uses a separate Relay store for each HTTP request. So, now
Relay store does not grow boundlessly, also one user never see data intended for another user. :v:
This became possible because of merging [this](https://github.com/facebook/relay/pull/761) and
[this](https://github.com/facebook/relay/pull/698) PRs into Relay v0.7.

Unfortunately, the network layer is still not contextual, so it is still not possible to pass
request specific cookies to the GraphQL server. But it will be possible when
[this PR](https://github.com/facebook/relay/pull/704) is merged. For now there are workarounds,
e.g. passing user session data as GraphQL query params.

Acknowledgments
---------------

Thanks to [@voideanvalue](https://github.com/voideanvalue) for the
[information](https://github.com/facebook/relay/issues/36#issuecomment-130402024)
that helped create the initial version this project. I also thank
[@josephsavona](https://github.com/josephsavona) for valuable
[advices](https://github.com/facebook/relay/issues/589) that helped improve it.

Installation
------------

    npm install -S isomorphic-relay

How to use
----------

Don't forget to inject a network layer to the Relay Environment.
And if you are using `Relay.DefaultNetworkLayer`, specify the full url to the GraphQL endpoint:
```javascript
const GRAPHQL_URL = `http://localhost:8080/graphql`;
const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer(GRAPHQL_URL));
```

When processing a request **on the server**, prepare the data using `IsomorphicRelay.prepareData`,
then render React markup using `IsomorphicRelay.RootContainer` in place of `Relay.RootContainer`
(pass `props` returned by  `IsomorphicRelay.prepareData`), and send the React output along with the
data to the client:
```javascript
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';

app.get('/', (req, res, next) => {
  const rootContainerProps = {
    Component: MyContainer,
    route: new MyRoute(),
  };

  const environment = new Relay.Environment();
  environment.injectNetworkLayer(new Relay.DefaultNetworkLayer(GRAPHQL_URL));

  IsomorphicRelay.prepareData(rootContainerProps, environment).then({data, props} => {
    const reactOutput = ReactDOMServer.renderToString(
      <IsomorphicRelay.RootContainer {...props} />
    );

    res.render('index.ejs', {
      preloadedData: JSON.stringify(data),
      reactOutput
    });
  }, next);
});
```

On page load **in the browser**, inject the prepared data to the Relay environment
using `IsomorphicRelay.injectPreparedData`, then render React using `IsomorphicRelay.RootContainer`
in place of `Relay.RootContainer`:
```javascript
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';

const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer(GRAPHQL_URL));

const data = JSON.parse(document.getElementById('preloadedData').textContent);
IsomorphicRelay.injectPreparedData(data, environment);

const rootElement = document.getElementById('root');

const rootContainerProps = {
  Component: MyContainer,
  environment,
  route: new MyRoute(),
};

ReactDOM.render(<IsomorphicRelay.RootContainer {...rootContainerProps} />, rootElement);
```

Example
-------
See [here](examples/star-wars).

[npm-badge]: https://img.shields.io/npm/v/isomorphic-relay.svg
[npm]: https://www.npmjs.com/package/isomorphic-relay
