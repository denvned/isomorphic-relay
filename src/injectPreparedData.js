import fromGraphQL from 'react-relay/lib/fromGraphQL';
import Relay from 'react-relay';
import RelayMetaRoute  from 'react-relay/lib/RelayMetaRoute';
import RelayQuery from 'react-relay/lib/RelayQuery';
import RelayStoreData from 'react-relay/lib/RelayStoreData';

const storeData = RelayStoreData.getDefaultInstance();

export default function injectPreparedData(data) {
    data.forEach(({query: concreteQuery, result}) => {
        const query = fromGraphQL.Query(concreteQuery);

        storeData.handleQueryPayload(query, result);
    });
}
