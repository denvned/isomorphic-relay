import GraphQLFragmentPointer from 'react-relay/lib/GraphQLFragmentPointer';
import Relay from 'react-relay/lib/RelayPublic';
import RelayQuery from 'react-relay/lib/RelayQuery';
import RelayStoreData from 'react-relay/lib/RelayStoreData';

export default class IsomorphicRootContainer extends Relay.RootContainer {
    _runQueries(props) {
        // _runQueries should not be called on server side,
        // so don't call it from constructor, and call it from componentDidMount instead
        return this.state ?
            super._runQueries(props) :
            createInitialState(props);
    }

    componentDidMount() {
        if ((!this.state.readyState || this.props.forceFetch) && !this.state.pendingRequest) {
            this.setState(super._runQueries(this.props));
        }
    }
}

function createInitialState({Component, forceFetch, route}) {
    const querySet = Relay.getQueries(Component, route);
    const fragmentPointers = createFragmentPointersForRoots(querySet);

    return isDataReady(querySet, fragmentPointers) ? {
        activeComponent: Component,
        activeRoute: route,
        error: null,
        fetchState: {
            done: true,
            stale: forceFetch,
        },
        fragmentPointers,
        pendingRequest: null,
        readyState: {
            aborted: false,
            done: true,
            error: null,
            mounted: true,
            ready: true,
            stale: forceFetch,
        },
    } : {
        activeComponent: null,
        activeRoute: null,
        error: null,
        fetchState: {
            done: false,
            stale: false,
        },
        fragmentPointers: null,
        pendingRequest: null,
        readyState: null,
    };
}

const queuedStore = RelayStoreData.getDefaultInstance().getQueuedStore();

function createFragmentPointersForRoots(querySet) {
    const fragmentPointers = {};

    Object.keys(querySet).forEach(name => {
        fragmentPointers[name] = createFragmentPointerForRoot(querySet[name]);
    });
    return fragmentPointers;
}

const createFragmentPointerForRoot = query => query ?
    GraphQLFragmentPointer.createForRoot(queuedStore, query) :
    null;

const isDataReady = (querySet, fragmentPointers) =>
    Object.keys(querySet).every(name => fragmentPointers[name] || !queryHasRootFragment(querySet[name]));

const queryHasRootFragment = query => query && query.getChildren().some(child => child instanceof RelayQuery.Fragment);
