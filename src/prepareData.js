import Relay from 'react-relay';
import RelayContext from 'react-relay/lib/RelayContext';
import toGraphQL from 'react-relay/lib/toGraphQL';

export default function prepareData({Component, route}) {
    return new Promise((resolve, reject) => {
        const relayContext = new RelayContext();
        const storeData = relayContext.getStoreData();

        storeData.getChangeEmitter().injectBatchingStrategy(() => {});

        const data = [];

        const handleQueryPayload = storeData.handleQueryPayload;
        storeData.handleQueryPayload = (query, result, forceIndex) => {
            data.push({query: toGraphQL.Query(query), result});
            handleQueryPayload.call(storeData, query, result, forceIndex);
        };

        const querySet = Relay.getQueries(Component, route);

        relayContext.forceFetch(querySet, onReadyStateChange);

        function onReadyStateChange({aborted, done, error, stale}) {
            if (error) {
                reject(error);
            } else if (aborted) {
                reject(new Error('Aborted'));
            } else if (done && !stale) {
                const props = {
                    Component,
                    relayContext,
                    route,
                };
                resolve({data, props});
            }
        }
    });
}
