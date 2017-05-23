import Relay from 'react-relay/classic';
import toGraphQL from 'react-relay/lib/toGraphQL';

export default function prepareData(
  { Container, queryConfig },
  networkLayer,
  preloadedRequests = []
) {
  return new Promise((resolve, reject) => {
    const environment = new Relay.Environment();
    const data = [];

    const storeData = environment.getStoreData();
    for (const { query, response } of preloadedRequests) {
        storeData.handleQueryPayload(query, response);
        data.push({ query: toGraphQL.Query(query), response });
    }

    environment.injectNetworkLayer({
      sendMutation: networkLayer.sendMutation.bind(networkLayer),
      supports: networkLayer.supports.bind(networkLayer),

      sendQueries(requests) {
        for (const request of requests) {
          request.then(({ response }) => {
            data.push({ query: toGraphQL.Query(request.getQuery()), response });
          });
        }

        return networkLayer.sendQueries(requests);
      },
    });

    const querySet = Relay.getQueries(Container, queryConfig);
    environment.primeCache(querySet, onReadyStateChange);

    function onReadyStateChange(readyState) {
      if (readyState.error) {
        reject(readyState.error);
      } else if (readyState.aborted) {
        reject(new Error('Aborted'));
      } else if (readyState.done) {
        const props = {
          Container,
          environment,
          queryConfig,
          initialReadyState: readyState,
        };
        resolve({ data, props });
      }
    }
  });
}
