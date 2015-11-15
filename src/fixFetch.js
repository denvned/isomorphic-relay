import fetch from 'isomorphic-fetch';

// HACK: fix for https://github.com/facebook/fbjs/issues/47
// TODO: remove when it is fixed in Relay
if (typeof self == 'undefined') {
    const {prototype} = module.constructor;
    const {require} = prototype;

    prototype.require = function(path) {
        if (path == 'fbjs/lib/fetch' || path == 'fbjs/lib/fetchWithRetries') {
            return fetch;
        }
        return require.call(this, path);
    };
}
