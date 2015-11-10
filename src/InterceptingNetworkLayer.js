import Relay from 'react-relay/lib/RelayPublic';

export const queryResults = new WeakMap();

const interceptingNetworkLayer = {
    sendQueries(requests) {
        requests.forEach(request => {
            request.then(({response}) => {
                queryResults.set(request.getQuery(), response);
            });
        });
        return super.sendQueries(requests);
    }
};

let _wasInjected = false;

export function wasInjected() {
    return _wasInjected;
}

export function injectNetworkLayer(networkLayer) {
    Object.setPrototypeOf(interceptingNetworkLayer, networkLayer);

    Relay.injectNetworkLayer(interceptingNetworkLayer);
    _wasInjected = true;
}
