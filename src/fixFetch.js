import fetch from 'isomorphic-fetch';

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
