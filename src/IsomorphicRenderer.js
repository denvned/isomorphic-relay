import GraphQLFragmentPointer from 'react-relay/lib/GraphQLFragmentPointer';
import Relay from 'react-relay';
import RelayQuery from 'react-relay/lib/RelayQuery';
import RelayRenderer from 'react-relay/lib/RelayRenderer';
import RelayStoreData from 'react-relay/lib/RelayStoreData';

export default class IsomorphicRenderer extends RelayRenderer {
    _runQueries(props) {
        // _runQueries should not be called on server side,
        // so don't call it from constructor, and call it from componentDidMount instead
        return this.state ?
            super._runQueries(props) :
            this._createInitialIsomorphicState(props);
    }

    componentDidMount() {
        if ((!this.state.readyState || this.props.forceFetch) && !this.state.pendingRequest) {
            this.setState(super._runQueries(this.props));
        }
    }

    _createInitialIsomorphicState({Component, forceFetch, queryConfig}) {
        const querySet = Relay.getQueries(Component, queryConfig);
        const fragmentPointers = createFragmentPointersForRoots(querySet);

        return isDataReady(querySet, fragmentPointers) ? {
            activeComponent: Component,
            activeQueryConfig: queryConfig,
            pendingRequest: null,
            readyState: {
                aborted: false,
                done: true,
                error: null,
                mounted: true,
                ready: true,
                stale: forceFetch,
            },
            renderArgs: {
                done: true,
                error: null,
                props: {
                    ...queryConfig.params,
                    ...fragmentPointers,
                },
                retry: this._retry.bind(this),
                stale: forceFetch,
            },
        } : {
            activeComponent: null,
            activeQueryConfig: null,
            pendingRequest: null,
            readyState: null,
            renderArgs: {
                done: false,
                error: null,
                props: null,
                retry: this._retry.bind(this),
                stale: false,
            },
        };
    }
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
