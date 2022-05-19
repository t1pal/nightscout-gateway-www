
 var axios = require('axios');

 function create_client (opts) {
  var instance = axios.create({
    baseURL: opts.baseURL,
    headers: {
      authorization: "Bearer " + opts.token
    }
  });
  return instance;
 }

 module.exports = create_client;
 
