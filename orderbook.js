const request = require('request-promise-native');
const config = require('./config.js');

exports.getOrderbook = () => {
    const params = {
        symbol: "tETHUSD",
        precision: "P0",
    };

    const requestOptions = {
        resolveWithFullResponse: true,
        uri: config.deversifiApi.url + config.deversifiApi.version + "/book/" + params.symbol + "/" + params.precision,
    };
    
    return request(requestOptions);
}

