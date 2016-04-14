import Relay from 'react-relay';
import RelayEnvironment from 'react-relay/lib/RelayEnvironment';
import toGraphQL from 'react-relay/lib/toGraphQL';

export default function prepareData({Component, route}) {
    return new Promise((resolve, reject) => {
        const relayEnvironment = new RelayEnvironment();
        const storeData = relayEnvironment.getStoreData();

        storeData.getChangeEmitter().injectBatchingStrategy(() => {});

        const data = [];

        const handleQueryPayload = storeData.handleQueryPayload;
        storeData.handleQueryPayload = (query, result, forceIndex) => {
            data.push({query: toGraphQL.Query(query), result});
            handleQueryPayload.call(storeData, query, result, forceIndex);
        };

        const querySet = Relay.getQueries(Component, route);

        relayEnvironment.forceFetch(querySet, onReadyStateChange);

        function onReadyStateChange({aborted, done, error, stale}) {
            if (error) {
                reject(error);
            } else if (aborted) {
                reject(new Error('Aborted'));
            } else if (done && !stale) {
                const props = {
                    Component,
                    relayEnvironment,
                    route,
                };
                resolve({data, props});
            }
        }
    });
}
