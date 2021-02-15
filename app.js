const express = require("express");
const market = require("./market");
const config = require("./config");

let app = express();

app.listen(config.port, () => {
  console.log("App started on port " + config.port);
});

market.init();

/**
 * Show overall asset balances every 30 seconds.
 * Update market every 5 seconds.
 *
 * NOTE: The shortest time interval you can use with cron is 1 minute,
 * therefore manually add timeout to run the job every 30 seconds.
 */
const start = () => {
  setInterval(async () => await market.init(), 5000);

  setTimeout(() => market.getOverallBalance(), 30000);
};

start();
