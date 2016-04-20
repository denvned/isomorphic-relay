import Relay from 'react-relay';
import toGraphQL from 'react-relay/lib/toGraphQL';

export default function prepareData({Component, route}, environment) {
  return new Promise((resolve, reject) => {
    const storeData = environment.getStoreData();

    storeData.getChangeEmitter().injectBatchingStrategy(() => {});

    const data = [];

    const handleQueryPayload = storeData.handleQueryPayload;
    storeData.handleQueryPayload = (query, result, forceIndex) => {
      data.push({query: toGraphQL.Query(query), result});
      handleQueryPayload.call(storeData, query, result, forceIndex);
    };

    const querySet = Relay.getQueries(Component, route);

    environment.forceFetch(querySet, onReadyStateChange);

    function onReadyStateChange({aborted, done, error, ready, stale}) {
      if (error) {
        reject(error);
      } else if (aborted) {
        reject(new Error('Aborted'));
      } else if (done && !stale) {
        const props = {
          Component,
          environment,
          route,
        };
        resolve({data, props});
      }
    }
  });
}
