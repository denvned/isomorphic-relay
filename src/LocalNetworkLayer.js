import { graphql } from 'graphql';

export default class LocalNetworkLayer {
  constructor(schema, rootValue) {
    this._schema = schema;
    this._rootValue = rootValue;
  }

  _sendRequest(request) {
    graphql(this._schema, request.getQueryString(), this._rootValue, request.getVariables()).then(result => {
      if(result.errors) {
        const error = new Error(`Executing query "${request.getDebugName()}" has failed for the following reasons: ${result.errors}`);
        error.errors = result.errors;
        request.reject(error);
      } else {
        request.resolve({ response: result.data });
      }
    });
  }

  sendMutation(request) {
    const files = request.getFiles();
    if(files && Object.keys(files).length !== 0) {
      request.reject(new Error(`It makes no sense to send files through LocalNetworkLayer. Please make sure you are not trying to do so with "${request.getDebugName()}" mutation on the server.`));
    } else {
      this._sendRequest(request);
    }
  }

  sendQueries(requests) {
    for(const request of requests) {
      this._sendRequest(request);
    }
  }

  supports(...options) {
    // currently the only defined option is "defer" and we don't support it
    return false;
  }
}
