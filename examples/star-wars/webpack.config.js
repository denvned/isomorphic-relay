var path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'lib', 'client.js'),
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'lib'),
    },
};
