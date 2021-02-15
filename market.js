const { getOrderbook } = require("./deversifiApi");
const config = require("./config");
const BigNumber = require("bignumber.js");

let assets = {
  ETH: new BigNumber(config.assetBalance.eth),
  USD: new BigNumber(config.assetBalance.usd),
};

let bidOrders = [];
let askOrders = [];

let highestBid, lowestAsk;

const init = async () => {
  const orders = await fetchOrders();
  if (JSON.parse(orders).length === 0) throw new Error("No orders found.");

  ({ highestBid, lowestAsk } = await getBestPrices(JSON.parse(orders)));

  await placeOrders(highestBid, lowestAsk);
  await updateOrders(bidOrders, askOrders);
};

// Fetch a list of orders from Orderbook API
const fetchOrders = async () => {
  let orders = [];

  try {
    const result = await getOrderbook();
    orders = result.body;
  } catch (err) {
    console.log(
      "An error occured whilst trying to request Orderbook API: ",
      err
    );
    orders = [];
  }

  return orders;
};

const getBestPrices = async (orders) => {
  if (orders.length === 0) {
    throw new Error("No orders.");
  }

  let asks = [];
  let bids = [];

  await Promise.all(
    orders.map(async (order) => {
      if (order[2] < 0) asks.push(order);
      else bids.push(order);
    })
  );

  const highestBid = new BigNumber(Math.max(...bids.map((bid) => bid[0])));
  const lowestAsk = new BigNumber(Math.min(...asks.map((ask) => ask[0])));

  return { highestBid, lowestAsk };
};

const getValueInRange = (min, max) => {
  return Math.random() * (max - min + 1) + min;
};

/**
 * Calculation is a bit funky :) Bids look ok but I'm missing something for the asks :\
 */
const makeOrder = async (price, amount) => {
  // Get random number between range of 0 an 0.05, calculating between 0 - 5%
  let percentage = new BigNumber(getValueInRange(0, 0.05));

  const orderPrice = price.plus(price.multipliedBy(percentage));

  let orderAmount = new BigNumber(Math.abs(Math.floor(Math.random() * amount)));
  orderAmount = orderAmount.isEqualTo(0) ? new BigNumber(1) : orderAmount;

  return { orderPrice, orderAmount };
};

const placeOrders = async (highestBid, lowestAsk) => {
  for (let i = 0; i < config.market.numberOfOrders; i++) {
    const { orderPrice: bidPrice, orderAmount: bidAmount } = await makeOrder(
      highestBid,
      assets.USD
    );
    assets.USD = assets.USD.minus(bidAmount);

    bidOrders.push({
      price: bidPrice,
      amount: bidAmount.dividedBy(bidPrice),
      status: "pending",
    });

    console.log(
      "PLACE BID @ " + bidPrice + " " + bidAmount.dividedBy(bidPrice)
    );

    const { orderPrice: askPrice, orderAmount: askAmount } = await makeOrder(
      lowestAsk,
      assets.ETH
    );
    assets.ETH = assets.ETH.minus(askAmount);

    askOrders.push({
      price: askPrice,
      amount: askAmount.dividedBy(askPrice),
      status: "pending",
    });

    console.log(
      "PLACE ASK @ " + askPrice + " " + askAmount.dividedBy(askPrice)
    );
  }
};

const updateOrders = async (bidOrders, askOrders) => {
  await Promise.all(
    bidOrders.map((order) => {
      if (order.status === "pending" && order.price.isGreaterThan(highestBid)) {
        order.status = "filled";
        assets.ETH = assets.ETH.plus(order.amount);
        console.log(
          `FILLED BID @ PRICE AMOUNT ${
            order.amount
          } (ETH + ${order.amount.toFixed(8)} USD - ${order.amount
            .multipliedBy(order.price)
            .toFixed(8)})`
        );
      }
    })
  );

  await Promise.all(
    askOrders.map((order) => {
      if (order.status === "pending" && order.price.isLessThan(lowestAsk)) {
        order.status = "filled";
        assets.USD = assets.USD.plus(order.amount(multipliedBy(order.price)));
        console.log(
          `FILLED ASK @ PRICE ${
            order.price
          } AMOUNT (ETH + ${order.amount.toFixed(
            8
          )} USD - ${order.amount.multipliedBy(order.price).toFixed(8)})`
        );
      }
    })
  );
};

const getOverallBalance = () => {
  console.log("ETH: " + assets.ETH.toFixed(8).toString());
  console.log("USD: " + assets.USD.toFixed(8).toString());
};

module.exports = {
  init,
  fetchOrders,
  updateOrders,
  getOverallBalance,
};
