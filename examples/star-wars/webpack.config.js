var path = require('path');

module.exports = {
    entry: [
      'babel-core/polyfill',
      path.resolve(__dirname, 'lib', 'client.js'),
    ],
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'lib'),
    },
};
