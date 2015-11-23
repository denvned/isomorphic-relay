import GraphQLFragmentPointer from 'react-relay/lib/GraphQLFragmentPointer';
import Relay from 'react-relay';
import RelayQuery from 'react-relay/lib/RelayQuery';
import RelayRenderer from 'react-relay/lib/RelayRenderer';
import RelayStoreData from 'react-relay/lib/RelayStoreData';

import checkRelayQueryData from 'react-relay/lib/checkRelayQueryData';
import flattenSplitRelayQueries from 'react-relay/lib/flattenSplitRelayQueries';
import splitDeferredRelayQueries from 'react-relay/lib/splitDeferredRelayQueries';

export default class IsomorphicRenderer extends RelayRenderer {
    _runQueries(props) {
        // _runQueries should not be called on server side,
        // so don't call it from constructor, and call it from componentDidMount instead
        return this.state ?
            super._runQueries(props) :
            this._buildInitialState();
    }

    _buildInitialState() {
        const {Component, forceFetch, queryConfig} = this.props;

        const querySet = Relay.getQueries(Component, queryConfig);
        const fragmentPointers = createFragmentPointersForRoots(querySet);

        const {done, ready} = checkCache(querySet);

        if (ready) {
            const props = {
                ...queryConfig.params,
                ...createFragmentPointersForRoots(querySet),
            };
            const readyState = {
                aborted: false,
                done: done && !forceFetch,
                error: null,
                mounted: true,
                ready: true,
                stale: !!forceFetch,
            };
            return this._buildState(Component, queryConfig, readyState, props);
        }

        return this._buildState(null, null, null, null);
    }

    _buildState(activeComponent, activeQueryConfig, readyState, props) {
        return {
            activeComponent,
            activeQueryConfig,
            readyState: readyState && {...readyState, mounted: true},
            renderArgs: {
                done: !!readyState && readyState.done,
                error: readyState && readyState.error,
                props,
                retry: () => this._retry(),
                stale: !!readyState && readyState.stale,
            },
        };
    }

    componentDidMount() {
        const {readyState} = this.state;
        if (!readyState || !readyState.done) {
            this._runQueries(this.props);
        }
    }
}

const queuedStore = RelayStoreData.getDefaultInstance().getQueuedStore();

function checkCache(querySet) {
    let done = true;
    const ready = Object.keys(querySet).every(name =>
        flattenSplitRelayQueries(splitDeferredRelayQueries(querySet[name]))
            .every(query => {
                if (!checkRelayQueryData(queuedStore, query)) {
                    done = false;
                    if (!query.isDeferred()) {
                        return false;
                    }
                }
                return true;
            })
    );
    return {done, ready};
}

function createFragmentPointersForRoots(querySet) {
    const fragmentPointers = {};

    Object.keys(querySet).forEach(name => {
        fragmentPointers[name] = createFragmentPointerForRoot(querySet[name]);
    });
    return fragmentPointers;
}

const createFragmentPointerForRoot = query =>
    query && GraphQLFragmentPointer.createForRoot(queuedStore, query);
