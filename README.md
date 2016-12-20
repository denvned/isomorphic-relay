Isomorphic React Relay [![npm version][npm-badge]][npm]
======================

Enables server-side rendering of [React Relay](https://facebook.github.io/relay/) containers.

If you use [react-router-relay](https://github.com/relay-tools/react-router-relay)
you might also become interested in
[isomorphic-relay-router](https://github.com/denvned/isomorphic-relay-router).

Acknowledgments
---------------

Thank you to everyone who helped in the development of this project with suggestions,
testing, reported issues, pull-requests. Thank you to the Facebook employees who reviewed
my [contributions](https://github.com/facebook/relay/commits/master?author=denvned)
to Relay, which helped to improve the server-side rendering support.

Installation
------------

    npm install --save isomorphic-relay

How to Use
----------

Here is an example with detailed comments of how *isomorphic-relay*
can be used **on the server:**
```jsx
import IsomorphicRelay from 'isomorphic-relay';

const rootContainerProps = {
  Container: MyContainer,
  queryConfig: new MyRoute(),
};

app.get('/', (req, res, next) => {
  // Create a Relay network layer. Note that on the server you need to specify
  // the absolute URL of your GraphQL server endpoint.
  // Here we also pass the user cookies on to the GraphQL server to allow them
  // to be used there, e.g. for authentication.
  const networkLayer = new Relay.DefaultNetworkLayer(
    'http://localhost:8080/graphql',
    { headers: { cookie: req.headers.cookie } },
  );

  // Use IsomorphicRelay.prepareData() to prefetch the data required for
  // rendering of the Relay container.
  IsomorphicRelay.prepareData(rootContainerProps, networkLayer).then(({ data, props }) => {
    // Use <IsomorphicRelay.Renderer> to render your Relay container when the data is ready.
    // Note that we cannot use the standard <Relay.Renderer> because at the first render
    // it renders an empty/loading screen even when all the required data is already available.
    // Unlike that, <IsomorphicRelay.Renderer> in that case renders normally right at
    // the first render, and it is important for server side rendering
    // where we do not have a second render.
    const reactOutput = ReactDOMServer.renderToString(
      <IsomorphicRelay.Renderer {...props} />
    );

    // To allow the data to be reused in the browser, serialize and embed it
    // in the page together with the React markup.
    res.render('index.ejs', {
      preloadedData: JSON.stringify(data),
      reactOutput
    });
  }).catch(next);
});
```

And here is an example of the code that can be used **in the browser:**
```jsx
import IsomorphicRelay from 'isomorphic-relay';

const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('/graphql'));

// Deserialize the data preloaded on the server.
const data = JSON.parse(document.getElementById('preloadedData').textContent);

// Use IsomorphicRelay.injectPreparedData() to inject the data into the Relay cache,
// so Relay doesn't need to make GraphQL requests to fetch the data.
IsomorphicRelay.injectPreparedData(environment, data);

// Use IsomorphicRelay.prepareInitialRender() to wait until all the required data
// is ready for rendering of the Relay container.
// Note that it is important to use the same rootContainerProps as on the server to
// avoid additional GraphQL requests.
IsomorphicRelay.prepareInitialRender({ ...rootContainerProps, environment }).then(props => {
  // Use <IsomorphicRelay.Renderer> to render your Relay container when the data is ready.
  // Like on the server we cannot use the standard <Relay.Renderer>, bacause here
  // we also need to render normally right at the initial render, otherwise we would get
  // React markup mismatch with the markup prerendered on the server.
  ReactDOM.render(<IsomorphicRelay.Renderer {...props} />, document.getElementById('root'));
});
```

Also see the [Star Wars](examples/star-wars) example.

[npm-badge]: https://img.shields.io/npm/v/isomorphic-relay.svg
[npm]: https://www.npmjs.com/package/isomorphic-relay
