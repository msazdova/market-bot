require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    deversifiApi: {
        url: process.env.DEVERSIFI_API_URL,
        version: process.env.DEVERSIFI_API_VERSION,
    },
    assetBalance: {
        eth: process.env.INIT_ETH_BALANCE || 10,
        usd: process.env.INIT_ETH_BALANCE || 2000,
    },
    market: {
        refreshSeconds: process.env.MARKET_REFRESH_SECONDS || 5,
        overallRefreshSeconds: process.env.MARKET_OVERALL_REFRESH_SECONDS || 30,
        numberOfOrders: process.env.MARKET_NUMBER_OF_ORDERS || 5,
    },
};

module.exports = config;