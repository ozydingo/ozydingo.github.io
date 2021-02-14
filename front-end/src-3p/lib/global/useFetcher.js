// useFetcher -- custom hook for fetching data with fetching and error states
//
// USAGE
//
// function fetchMyData() {
//  // ... return your data or a promise for your data ...
// }
//
// const data = useFetcher(fetchMyData);
//   // -- OR --
// const data = useFetcher(fetchMyData, dependencies);
//
// Where, like `useEffect`, `dependencies` wil trigger the fetch to occur again.
// Bu default, `dependencies` is [], meaning the fetch will happen only once.


import { useEffect, useMemo, useState } from "react";

function useFetcher(fetcherFunction, dependencies = []) {
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(dependencies === []);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    setFetching(true);
    asyncFetch().then(setResponse).catch(setError).then(done);
  }, dependencies);

  async function asyncFetch() {
    return fetcherFunction();
  }

  function done() {
    setFetching(false);
  }

  const value = useMemo(() => {
    return {error, fetching, response};
  }, [error, fetching, response]);

  return value;
}

export default useFetcher;
