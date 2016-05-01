import Relay from 'react-relay';

export default function prepareInitialRender(props) {
  return new Promise(resolve => {
    const querySet = Relay.getQueries(props.Container, props.queryConfig);
    const fetchMethod = props.forceFetch ? 'forceFetch' : 'primeCache';
    const request = props.environment[fetchMethod](querySet, onReadyStateChange);

    function onReadyStateChange(readyState) {
      if (readyState.aborted || readyState.error || readyState.ready) {
        request.abort();
        
        resolve({
          ...props,
          initialReadyState: readyState,
        });
      }
    }
  });
}
