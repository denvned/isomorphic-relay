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

- Since version 0.6, the network layer is also contextual, so it is now possible to pass
request specific cookies to the GraphQL server. The [corresponding
PR](https://github.com/facebook/relay/pull/704) is merged into Relay v0.8.

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

Create a Relay network layer on the server.
And if you are using `Relay.DefaultNetworkLayer`, specify the full url to the GraphQL endpoint:
```javascript
const GRAPHQL_URL = `http://localhost:8080/graphql`;

const networkLayer = new Relay.DefaultNetworkLayer(GRAPHQL_URL);
```

When processing a request **on the server**, prepare the data using `IsomorphicRelay.prepareData`,
then render React markup using `IsomorphicRelay.Renderer` in place of `Relay.Renderer`
(pass `props` returned by  `IsomorphicRelay.prepareData`), and send the React output along with the
data to the client:
```javascript
import IsomorphicRelay from 'isomorphic-relay';

app.get('/', (req, res, next) => {
  const rootContainerProps = {
    Container: MyContainer,
    queryConfig: new MyRoute(),
  };

  IsomorphicRelay.prepareData(rootContainerProps, networkLayer).then({data, props} => {
    const reactOutput = ReactDOMServer.renderToString(
      <IsomorphicRelay.Renderer {...props} />
    );

    res.render('index.ejs', {
      preloadedData: JSON.stringify(data),
      reactOutput
    });
  }).catch(next);
});
```

On page load **in the browser**, create an instance of `Relay.Environment`, inject an Relay network
layer to it. Then inject the prepared data using `IsomorphicRelay.injectPreparedData`, prepare
initial render using `IsomorphicRelay.prepareInitialRender`, and render React using
`IsomorphicRelay.Renderer` in place of `Relay.Renderer` (pass `props` returned by
`IsomorphicRelay.prepareInitialRender`):
```javascript
import IsomorphicRelay from 'isomorphic-relay';

const environment = new Relay.Environment();

environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('/graphql'));

const data = JSON.parse(document.getElementById('preloadedData').textContent);

IsomorphicRelay.injectPreparedData(environment, data);

const rootElement = document.getElementById('root');

// use the same rootContainerProps as on the server
IsomorphicRelay.prepareInitialRender({ ...rootContainerProps, environment }).then(props => {
  ReactDOM.render(<IsomorphicRelay.Renderer {...props} />, rootElement);
});
```

Example
-------
See [here](examples/star-wars).

[npm-badge]: https://img.shields.io/npm/v/isomorphic-relay.svg
[npm]: https://www.npmjs.com/package/isomorphic-relay
