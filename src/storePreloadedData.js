import DliteFetchModeConstants from 'react-relay/lib/DliteFetchModeConstants';
import Relay from 'react-relay';
import RelayPendingQueryTracker from 'react-relay/lib/RelayPendingQueryTracker';
import RelayStoreData from 'react-relay/lib/RelayStoreData';

const queryRunner = RelayStoreData.getDefaultInstance().getQueryRunner();

export default function({Component, route}, queryResults) {
    const querySet = Relay.getQueries(Component, route);

    const request = new Promise((resolve, reject) => {
        queryRunner.run(querySet, ({aborted, done, error}) => {
            if (error) {
                reject(error);
            } else if (aborted) {
                reject(new Error('Aborted'));
            } else if (done) {
                resolve();
            }
        }, DliteFetchModeConstants.FETCH_MODE_PRELOAD);
    });
    Object.keys(querySet).forEach(name => {
        const result = queryResults[name];
        if (!result) {
            throw new Error(`No result for query "${name}"`);
        }
        RelayPendingQueryTracker.resolvePreloadQuery(querySet[name].getID(), {response: result});
    });
    return request;
}
