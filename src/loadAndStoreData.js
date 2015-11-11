import Relay from 'react-relay';
import {
    queryResults,
    wasInjected,
} from './InterceptingNetworkLayer';

export default function({Component, route}) {
    if (!wasInjected()) {
        throw new Error('NetworkLayer was not injected!');
    }
    return new Promise((resolve, reject) => {
        const querySet = Relay.getQueries(Component, route);

        Relay.Store.forceFetch(querySet, ({aborted, done, error, stale}) => {
            if (error) {
                reject(error);
            } else if (aborted) {
                reject(new Error('Aborted'));
            } else if (done && !stale) {
                resolve(getQueryResults());
            }
        });

        function getQueryResults() {
            const results = {};

            Object.keys(querySet).forEach(name => {
                const result = queryResults.get(querySet[name]);
                if (!result) {
                    throw new Error(`No result for query "${name}"`);
                }
                results[name] = result;
            });
            return results;
        }
    });
}
