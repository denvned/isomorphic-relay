import Relay from 'react-relay';
import RelayPendingQueryTracker from 'react-relay/lib/RelayPendingQueryTracker';
import RelayQuery from 'react-relay/lib/RelayQuery';
import RelayStoreData from 'react-relay/lib/RelayStoreData';
import toGraphQL from 'react-relay/lib/toGraphQL';

// HACK: Do not memoize concrete node produced by toGraphQL,
// because it changes RelayQuery.Fragment.getConcreteFragmentID()
// whereas RelayQuery is supposed to be immutable.
// TODO: remove when it is fixed in Relay
RelayQuery.Node.prototype.getConcreteQueryNode = onCacheMiss => onCacheMiss();

const globalStoreData = RelayStoreData.getDefaultInstance();

export default function prepareData({Component, route}) {
    return new Promise((resolve, reject) => {
        const data = [];

        const storeData = new class extends RelayStoreData {
            handleQueryPayload(query, result, forceIndex) {
                data.push({query: toGraphQL.Query(query), result});

                globalStoreData.handleQueryPayload(query, result, forceIndex);
            }
        };

        const querySet = Relay.getQueries(Component, route);

        RelayPendingQueryTracker.resetPending();
        storeData.getQueryRunner().forceFetch(querySet, onReadyStateChange);

        function onReadyStateChange({aborted, done, error, stale}) {
            if (error) {
                reject(error);
            } else if (aborted) {
                reject(new Error('Aborted'));
            } else if (done && !stale) {
                resolve(data);
            }
        }
    });
}
