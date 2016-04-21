import fromGraphQL from 'react-relay/lib/fromGraphQL';
import Relay from 'react-relay';

export default function injectPreparedData(environment, { Container, queryConfig }, data) {
  return new Promise(resolve => {
    const storeData = environment.getStoreData();

    for (const { query: concreteQuery, response } of data) {
      const query = fromGraphQL.Query(concreteQuery);
      storeData.handleQueryPayload(query, response);
    }

    const querySet = Relay.getQueries(Container, queryConfig);
    environment.primeCache(querySet, onReadyStateChange);

    function onReadyStateChange(readyState) {
      if (readyState.aborted || readyState.error || readyState.ready) {
        const props = {
          Container,
          environment,
          queryConfig,
          initialReadyState: readyState,
        };
        resolve(props);
      }
    }
  });
}
