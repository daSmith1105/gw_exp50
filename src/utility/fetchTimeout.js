const fetchTimeout = ( ms, promise ) => {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error("timeout"))
    }, ms )
    promise.then(resolve, reject)
  });
};

export default fetchTimeout;
