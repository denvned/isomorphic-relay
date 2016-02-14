import fromGraphQL from 'react-relay/lib/fromGraphQL';
import Relay from 'react-relay';

export default function injectPreparedData(data) {
    const storeData = Relay.Store.getStoreData();

    data.forEach(({query: concreteQuery, result}) => {
        const query = fromGraphQL.Query(concreteQuery);

        storeData.handleQueryPayload(query, result);
    });
}
