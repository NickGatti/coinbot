//=============================================
//=============================================
//=============================================
// Populate my settings
//=============================================
//=============================================
//=============================================
let populateMySettings = ((num) => {
  for (let i = 0; i < num; i++) {
    mySettings.realityCriteria.push(400);
    mySettings.realityCriteria.push(6000);
  }
  for (let i = 0; i < num * 2; i++) {
    myOrders.buy.push({
      price: false,
      state: 'buying'
    });
    myOrders.sell.push({
      price: false,
      state: 'paused'
    });
    myOrders.orderAmountMade.push(0);
  }
});
//=============================================
//=============================================
//=============================================
// Populate my settings
//=============================================
//=============================================
//=============================================
// Websocket Change Detections
//=============================================
//=============================================
//=============================================
let websocketTimeout = new Date().getTime();
let lostConnection = false;
let getWebSocketData = (() => {
  let destroy = (() => {
    console.log('WebSocket Closed!');
    websocket.removeListener('close', destroy);
    websocket.removeListener('open', report);
    websocket.removeListener('error', reportErr);
    websocket.removeListener('message', socket);
    websocket = new Gdax.WebsocketClient(['ETH-USD']);
  });
  let report = (() => {
    console.log('WebSocket Connected!');
  });
  let reportErr = ((err) => {
    console.log('Websocket Error! =>' + err.message);
  });
  let socket = ((data) => {
    if (lostConnection) {
      clearInterval(findRealisticOrders);
      resetFlag = true;
      lostConnection = false;
    }
    //if (data.type === 'match') data.size === 'sell' ? console.log('Up tick!') : console.log('Down tick!')

    if (data.type === 'ticker' || data.type === 'snapshot' || data.type === 'l2update' || data.type === 'heartbeat' || data.type === 'subscribe' || data.type === 'unsubscribe' || data.type === 'subscriptions') {
      console.log('Error on WebSocket Feed data.type === ', data.type);
      return;
    } else if (data.type === 'error') {
      console.log('Error on WebSocket Feed data.type === ', data.type);
      console.log('Error on WebSocket Feed data.message === ', data.message);
      return;
    } else if (data.side !== 'buy' && data.side !== 'sell' && data.side) {
      console.log('Error on WebSocket Feed data.type not sell or buy data.type === ', data.side);
      return;
    }
    if (catchWebSocketMessage(data)) {
      websocketTimeout = new Date().getTime();
      lostConnection = false;
    }
  });
  setInterval(() => {
    if ((new Date().getTime() - websocketTimeout) > 10000) {
      console.log('WebSocket Connection Lost...');
      orderBook = {
        'buy': [],
        'sell': []
      };
      lostConnection = true;
      websocketTimeout = new Date().getTime();
      websocket.on('close', destroy);
      websocket.on('open', report);
      websocket.on('error', reportErr);
      websocket.on('message', socket);
    }
  }, 1000);
  websocket.on('close', destroy);
  websocket.on('open', report);
  websocket.on('error', reportErr);
  websocket.on('message', socket);
});
//=============================================
//=============================================
//=============================================
// Websocket Change Detections
//=============================================
//=============================================
//=============================================
// Load datafile
//=============================================
//=============================================
//=============================================
let readData = (() => {
  fs.open('storage.json', 'r', (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('Storage file does not exist...');
        return;
      }

      throw err;
    }
    console.error('Loading from storage file...');
    readMyData();
  });
});
//=============================================
//=============================================
//=============================================
// Load datafile
//=============================================
//=============================================
//=============================================
// Global let Dec's
//=============================================
//================SERVER PORT==================
// Number for localhost
// String 'c9' for cloudnine.io
let lisenPort = 3000;
//=============================================
//=============================================
const Gdax = require('gdax');
const util = require('util');
const fs = require('fs');
const express = require('express');
const publicClient = new Gdax.PublicClient('ETH-USD');
let websocket = new Gdax.WebsocketClient(['ETH-USD']);
const getProductOrderBook = util.promisify(publicClient.getProductOrderBook.bind(publicClient));
//=============================================
//==============REALITY CRITERIA===============
//=============================================
const mySettings = {
  realityCriteria: [],
  realMargin: [
    1.0205, // 1
    1.0205, // 2
    1.0210, // 3
    1.0210, // 4
    1.0215, // 5
    1.0215, // 6
    1.0220, // 7
    1.0220, // 8
    1.0225, // 9
    1.0225, // 10
    1.0230, // 11
    1.0230, // 12
    1.0235, // 13
    1.0235, // 14
    1.0240, // 15
    1.0240, // 16
    1.0245, // 17
    1.0245, // 18
    1.0250, // 19
    1.0250 // 20
  ]
};
let myOrders = {
  'buy': [],
  'sell': [],
  'orderAmountMade': []
};
populateMySettings(10);
//=============================================
//==============REALITY CRITERIA===============
//=============================================
let orderBook = {
  'buy': [],
  'sell': []
};

let currentOrder = 0;
let orderUpdate = false;
let newOrder = {
  buy: {
    placing: false,
    price: false,
    size: false
  },
  sell: {
    placing: false,
    price: false,
    size: false
  }
};
readData();
//=============================================
//=============================================
//=============================================
// Global let Dec's
//=============================================
//=============================================
//=============================================
// Run Our Program
//=============================================
//=============================================
//=============================================
//console.log('Conneting WebSocket...');
let pauseOrderBook = false;
let resetFlag = false;
let runBenchmark = false;
let resetPause = false;
let dataIntegrityTest = false;
setInterval(() => {
  clearInterval(findRealisticOrders);
  resetFlag = true;
}, 1500000);
getWebSocketData();
//=============================================
//=============================================
//=============================================
// Run Our Program
//=============================================
//=============================================
//=============================================
// GDAX Module REST API OrderBook Fetch
//=============================================
//=============================================
//=============================================
let getOrderBook = ((level) => {
  return getProductOrderBook({
    'level': level
  }).then(((data) => {
    return JSON.parse(data.body);
  }));
});
//=============================================
//=============================================
//=============================================
// GDAX Module REST API OrderBook Fetch
//=============================================
//=============================================
//=============================================
// Call GDAX function for ASYNC letiable
//=============================================
//=============================================
//=============================================
let orderBookTimeout = null;
let downloadOrderBook = ((flag) => {
  if (orderBook['buy'][0] && orderBook['sell'][0] || flag) {

    if (flag) resetPause = true;

    pauseOrderBook = true;
    resetFlag ? console.log('Refreshing OrderBook! Downloading OrderBook...') : console.log('Downloading OrderBook...');

    let savedTime = new Date().getTime();
    let timeDown = 0;
    orderBookTimeout = setInterval(() => {
      timeDown = (new Date().getTime() - savedTime);
    }, 10);

    getOrderBook(3).then(((value) => {

      console.log('Orderbook downloaded in: ' + timeDown + 'ms');
      clearInterval(orderBookTimeout);

      let rawOrderBookData = {
        'buy': value.bids,
        'sell': value.asks
      };

      let populateOrders = (objectSide) => {
        for (let i = 0; i < rawOrderBookData[objectSide].length; i++) {
          let data = rawOrderBookData[objectSide][i];
          orderBook[objectSide][i] = {
            price: parseFloat(data[0]),
            size: Number(data[1]) ? Number(data[1]) : parseFloat(data[1]),
            order_id: data[2]
          };
        }
      };

      populateOrders('buy');
      populateOrders('sell');

      deDupe(); //how do i run dedupe while the rest of it runs?

      if (resetFlag) {
        resetFlag = false;
        resetPause = false;
        return;
      } else {
        setInterval(findRealisticOrders, 500);
      }

    })).catch(((err) => {
      console.log(err);
    }));
  }
});
//=============================================
//=============================================
//=============================================
// Call GDAX function for ASYNC variable
//=============================================
//=============================================
//=============================================
// WebSocket Message Filter
//=============================================
//=============================================
//=============================================
let catchWebSocketMessage = ((data) => {

  if (dataIntegrityTest) console.log('DataIntegrityTesting');
  let objectSide = data.side;

  if (resetFlag && !resetPause && !dataIntegrityTest) {
    //console.log('Stopping to download orderbook again...');
    orderBook = {
      'buy': [],
      'sell': []
    };
    downloadOrderBook(true);
  }

  if (data.type === 'open') {
    //sideIndex is not true here so orders are not found in the orderBook
    /*
        The order is now open on the order book.
        This message will only be sent for orders which are not fully filled immediately.
        Remaining_size will indicate how much of the order is unfilled and going on the book.
        {
            "type": "open",
            "time": "2014-11-07T08:19:27.028459Z",
            "product_id": "BTC-USD",
            "sequence": 10,
            "order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
            "price": "200.2",
            "remaining_size": "1.00",
            "side": "sell"
        }
        */
    orderBook[objectSide]
      .push({
        type: data.type,
        time: data.time,
        product_id: data.product_id,
        sequence: data.sequence,
        order_id: data.order_id,
        price: parseFloat(data.price),
        size: Number(data.remaining_size) ? Number(data.remaining_size) : parseFloat(data.remaining_size),
        side: data.side
      });
    if (!pauseOrderBook) downloadOrderBook(false);
    return true;
  } else if (data.type === 'match') {
    if (dataIntegrityTest) console.log('DataIntegrityTesting: Trade Match!');
    /*
        A trade occurred between two orders.
        The aggressor or taker order is the one executing immediately after being received and the maker order is a resting order on the book.
        The side field indicates the maker order side.
        If the side is sell this indicates the maker was a sell order and the match is considered an up-tick.
        A buy side match is a down-tick. If authenticated, and you were the taker, the message would also have the following fields:
        {
            "type": "match",
            "trade_id": 10,
            "sequence": 50,
            "maker_order_id": "ac928c66-ca53-498f-9c13-a110027a60e8",
            "taker_order_id": "132fb6ae-456b-4654-b4e0-d681ac05cea1",
            "time": "2014-11-07T08:19:27.028459Z",
            "product_id": "BTC-USD",
            "size": "5.23512",
            "price": "400.23",
            "side": "sell"
        }
        */
    orderBook[objectSide] = orderBook[objectSide].filter((item) => {
      return data.maker_order_id !== item.order_id;
    });
    orderBook[objectSide] = orderBook[objectSide].filter((item) => {
      return data.taker_order_id !== item.order_id;
    });
    return true;
  } else if (data.type === 'received') {
    if (dataIntegrityTest) console.log('DataIntegrityTesting: Received Order!');
    /*
        A valid order has been received and is now active.
        This message is emitted for every single valid order as soon as the matching engine receives it whether it fills immediately or not.
        The received message does not indicate a resting order on the order book.
        It simply indicates a new incoming order which as been accepted by the matching engine for processing.
        Received orders may cause match message to follow if they are able to begin being filled (taker behavior).
        Self-trade prevention may also trigger change messages to follow if the order size needs to be adjusted.
        Orders which are not fully filled or canceled due to self-trade prevention result in an open message and become resting orders on the order book.
        Market orders (indicated by the order_type field) may have an optional funds field which indicates how much quote currency will be used to buy or sell.
        For example, a funds field of 100.00 for the BTC-USD product would indicate a purchase of up to 100.00 USD worth of bitcoin.
        {
            "type": "received",
            "time": "2014-11-07T08:19:27.028459Z",
            "product_id": "BTC-USD",
            "sequence": 10,
            "order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
            "size": "1.34",
            "price": "502.1",
            "side": "buy",
            "order_type": "limit"
        }
        */
    return true;
  } else if (data.type === 'change') {
    if (dataIntegrityTest) console.log('DataIntegrityTesting: Changed Order!');
    /*
            An order has changed.
            This is the result of self-trade prevention adjusting the order size or available funds.
            Orders can only decrease in size or funds. change messages are sent anytime an order changes in size; this includes resting orders (open) as well as received but not yet open.
            Change messages are also sent when a new market order goes through self trade prevention and the funds for the market order have changed.
             Change messages for received but not yet open orders can be ignored when building a real-time order book.
             The side field of a change message and price can be used as indicators for whether the change message is relevant if building from a level 2 book.
            Any change message where the price is null indicates that the change message is for a market order.
            Change messages for limit orders will always have a price specified.
            {
                "type": "change",
                "time": "2014-11-07T08:19:27.028459Z",
                "sequence": 80,
                "order_id": "ac928c66-ca53-498f-9c13-a110027a60e8",
                "product_id": "BTC-USD",
                "new_size": "5.23512",
                "old_size": "12.234412",
                "price": "400.23",
                "side": "sell"
            }
        */
    for (let i = 0; i < orderBook[objectSide.length]; i++) {
      if (orderBook[objectSide].order_id === data.order_id) {
        orderBook[objectSide][i].size = Number(data.new_size) ? Number(data.new_size) : parseFloat(data.new_size);
        orderBook[objectSide][i].price = parseFloat(data.price);
        break;
      }
    }
    return true;
  } else if (data.type === 'done') {
    if (dataIntegrityTest) console.log('DataIntegrityTesting: Done Order!');
    /*
        The order is no longer on the order book.
        Sent for all orders for which there was a received message.
        This message can result from an order being canceled or filled.
        There will be no more messages for this order_id after a done message. remaining_size indicates how much of the order went unfilled;
        this will be 0 for filled orders.
        {
            "type": "done",
            "time": "2014-11-07T08:19:27.028459Z",
            "product_id": "BTC-USD",
            "sequence": 10,
            "price": "200.2",
            "order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
            "reason": "filled", // or "canceled"
            "side": "sell",
            "remaining_size": "0"
        }
        */
    orderBook[objectSide] = orderBook[objectSide].filter((item) => {
      return data.order_id !== item.order_id;
    });
    return true;
  } else if (data.type === 'activate') {
    if (dataIntegrityTest) console.log('DataIntegrityTesting: Activated Order!');
    /*
        An activate message is sent when a stop order is placed.
        When the stop is triggered the order will be placed and go through the order lifecycle.
        {
          "type": "activate",
          "product_id": "test-product",
          "timestamp": "1483736448.299000",
          "user_id": "12",
          "profile_id": "30000727-d308-cf50-7b1c-c06deb1934fc",
          "order_id": "7b52009b-64fd-0a2a-49e6-d8a939753077",
          "stop_type": "entry",
          "side": "buy",
          "stop_price": "80",
          "size": "2",
          "funds": "50",
          "taker_fee_rate": "0.0025",
          "private": true,
        }
        */
    return true;
  } else if (data.type === 'margin_profile_update') {
    if (dataIntegrityTest) console.log('DataIntegrityTesting: Margin Profile Update!');
    /*
        This feed message will only be received if you are authenticated with a margin profile.
        {
          "type": "margin_profile_update",
          "product_id": "BTC-USD",
          "timestamp": "2017-03-13T20:58:59.071Z",
          "user_id": "4fee694c4ddbe2000300017e",
          "profile_id": "df46176d-798e-40be-819c-c94b1cbf97a7",
          "nonce": 4,
          "position": "long",
          "position_size": "16.65808012",
          "position_compliment": "-21049.99999776145250000000000000",
          "position_max_size": "16.65808012",
          "call_side": "sell",
          "call_price": "750.39",
          "call_size": "16.65808012",
          "call_funds": "10025.06265440",
          "covered": false,
          "next_expire_time": "2017-04-10T18:58:59.070Z",
          "base_balance": "16.65808012",
          "base_funding": "0",
          "quote_balance": "0.00000223457250000000000000",
          "quote_funding": "9999.9999999960250000",
          "private": true
        }
        */
    return true;
  } else if (data.type === 'error') {
    console.log('Error on WebSocket Feed data.type === ', data.type);
    console.log('Message was an error: ', data.message);
    return false;
  } else {
    console.log('Uncaught WebSocket type in feed: ', data.type);
    return false;
  }
});
//=============================================
//=============================================
//=============================================
// WebSocket Message Filter
//=============================================
//=============================================
//=============================================
// DeDupe OrderBook
//=============================================
//=============================================
//=============================================
let deDupe = (() => {
  dataIntegrityTest = true;
  console.log('OrderBook Downloaded!');

  // let funt = (objectSide) => {
  //     for (let i = 0; i < orderBook[objectSide].length; i++) {
  //         for(let z = i+1; z < orderBook[objectSide].length; z++) {
  //             if (orderBook[objectSide][i].order_id === orderBook[objectSide][z].order_id) {
  //                 console.log('Duped Order Found! You should probably never really see this message!');
  //                 orderBook[objectSide].splice(z, 1);
  //             }
  //         }
  //     }
  // };

  // funt('buy');
  // funt('sell');

  //console.log('OrderBook De-duped! Running program...');
  //console.log('=============================================================================================================================================================================');
  dataIntegrityTest = false;
  runBenchmark = true;
});
//=============================================
//=============================================
//=============================================
// DeDupe OrderBook
//=============================================
//=============================================
//=============================================
// Output logging
//=============================================
//=============================================
//=============================================
let marketData = (() => {
  if (orderBook['buy'] && orderBook['sell'] && findGoodOrders()) {
    return {
      realBuys: findGoodOrders()['buy'] ? findGoodOrders()['buy'] : false,
      realSells: findGoodOrders()['sell'] ? findGoodOrders()['sell'] : false,
      totalBuys: orderBook['buy'].length ? orderBook['buy'].length : false,
      totalSells: orderBook['sell'].length ? orderBook['sell'].length : false,
      totalAmountMade: addTotalAmount() ? addTotalAmount() : false,
      amountMade: myOrders.orderAmountMade ? myOrders.orderAmountMade[currentOrder] : false,
      newOrder: newOrder ? newOrder : false
    };
  }
  return false;
});
//=============================================
//=============================================
//=============================================
let buyOrderData = (() => {
  if (!myOrders.buy[currentOrder].price) return false;
  if (!buyGapInfo()) return false;
  if (myOrders.buy[currentOrder] && buyGapInfo()) {
    return {
      orderUpdate: orderUpdate ? orderUpdate : false,
      myBuyOrder: myOrders.buy[currentOrder] ? myOrders.buy[currentOrder] : false,
      buyCount: buyGapInfo()[0] ? buyGapInfo()[0] : false,
      buyTotal: buyGapInfo()[1] ? buyGapInfo()[1] : false
    };
  }
  return false;
});
//=============================================
//=============================================
//=============================================
let sellOrderData = (() => {
  if (!myOrders.sell[currentOrder].price) return false;
  if (!sellGapInfo()) return false;
  if (myOrders.sell[currentOrder] && sellGapInfo()) {
    return {
      mySellOrder: myOrders.sell[currentOrder] ? myOrders.sell[currentOrder] : false,
      sellCount: sellGapInfo()[0] ? sellGapInfo()[0] : false,
      sellTotal: sellGapInfo()[1] ? sellGapInfo()[1] : false
    };
  }
  return false;
});
//=============================================
//=============================================
//=============================================
// Output logging
//=============================================
//=============================================
//=============================================
// SERVER
//=============================================
//=============================================
//=============================================
console.log('Starting server...');
let app = express();
app.use(((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
  return;
}));
app.get('/', ((req, res) => {
  res.sendFile(__dirname + '/index.html');
}));
app.get('/api', ((req, res) => {
  res.json({
    highestBuyPrice: findHighestBuyPrice() ? findHighestBuyPrice().price : false,
    lowestSellPrice: findLowestSellPrice() ? findLowestSellPrice().price : false,
    currentOrder: currentOrder ? currentOrder : false,
    buyState: myOrders.buy[currentOrder].state ? myOrders.buy[currentOrder].state : false,
    sellState: myOrders.sell[currentOrder].state ? myOrders.sell[currentOrder].state : false,
    marketData: marketData() ? marketData() : false,
    buyOrderData: buyOrderData() ? buyOrderData() : false,
    sellOrderData: sellOrderData() ? sellOrderData() : false
  });
}));
if (lisenPort === 'c9') {
  app.listen(process.env.PORT, process.env.IP);
} else {
  app.listen(lisenPort);
}
//=============================================
//=============================================
//=============================================
// SERVER
//=============================================
//=============================================
//=============================================
// Market Order Reality Checks
//=============================================
//=============================================
//=============================================
let findRealisticOrders = (() => {
  if (resetFlag) return;
  if (runBenchmark && !resetFlag) {

    sortBothSides();
    filterGoodOrders();

    checkVars();

    placeBuy();
    placeSell();

    resetOrderInterval();
  }
});
//=============================================
//=============================================
//=============================================
// Market Order Reality Checks
//=============================================
//=============================================
//=============================================
// Place buy order
//=============================================
//=============================================
//=============================================
let placeBuy = (() => {
  orderUpdate = false;
  if (!filterBuyOrder(findHighestBuyPrice())) {
    //console.log('Wait what? This should\'t happen!');
    return;
  }

  if (myOrders.buy[currentOrder].state === 'buying') {

    newOrder.buy = {
      placing: true,
      price: filterBuyOrder().price,
      size: 20
    };

    if (myOrders.buy[currentOrder].price) {
      myOrders.buy[currentOrder].oldPrice = parseFloat(myOrders.buy[currentOrder].price + 0.01);
    } else {
      myOrders.buy[currentOrder] = filterBuyOrder();
      myOrders.buy[currentOrder].oldPrice = parseFloat(filterBuyOrder().price + 0.01);
    }

    myOrders.buy[currentOrder] = filterBuyOrder();
    myOrders.buy[currentOrder].price = parseFloat(filterBuyOrder().price + 0.01);

    myOrders.buy[currentOrder].margin = (findHighestBuyPrice().price / myOrders.buy[currentOrder].price);

    myOrders.buy[currentOrder].oldOrdersToGo = buyGapInfo()[0];
    myOrders.buy[currentOrder].oldAmountToGo = buyGapInfo()[1];

    myOrders.buy[currentOrder].state = 'waiting';

    return;
  } else if (myOrders.buy[currentOrder].state === 'waiting') {
    if (findHighestBuyPrice().price < myOrders.buy[currentOrder].price) {

      //console.log('Purchased!');

      myOrders.buy[currentOrder].state = 'paused';
      myOrders.sell[currentOrder].state = 'selling';

      return;
    } else if (myOrders.buy[currentOrder].price) {
      if (buyGapInfo()[0] > myOrders.buy[currentOrder].oldOrdersToGo &&
        buyGapInfo()[1] > myOrders.buy[currentOrder].oldAmountToGo &&
        (findHighestBuyPrice().price / filterBuyOrder().price) > myOrders.buy[currentOrder].margin &&
        filterBuyOrder().price > myOrders.buy[currentOrder].oldPrice) {

        orderUpdate = true;

        myOrders.buy[currentOrder].oldOrdersToGo = buyGapInfo()[0];
        myOrders.buy[currentOrder].oldAmountToGo = buyGapInfo()[1];

        myOrders.buy[currentOrder].margin = (findHighestBuyPrice().price / myOrders.buy[currentOrder].price);

        myOrders.buy[currentOrder].oldPrice = parseFloat(myOrders.buy[currentOrder].price);
        myOrders.buy[currentOrder].price = parseFloat(filterBuyOrder().price + 0.01);

        return;
      }
    }
  }
});
//=============================================
//=============================================
//=============================================
// Place buy order
//=============================================
//=============================================
//=============================================
// Place sell order
//=============================================
//=============================================
//=============================================
let placeSell = (() => {
  if (!filterSellOrder()) {
    //console.log('Bubble?');
    return;
  }

  if (myOrders.sell[currentOrder].state === 'selling') {
    newOrder.sell = {
      placing: true,
      price: filterSellOrder().price,
      size: 20
    };

    myOrders.sell[currentOrder] = filterSellOrder();
    myOrders.sell[currentOrder].price = parseFloat(myOrders.sell[currentOrder].price - 0.01);
    myOrders.sell[currentOrder].margin = parseFloat(myOrders.sell[currentOrder].price / myOrders.buy[currentOrder].price);

    myOrders.sell[currentOrder].state = 'waiting';

    return;

  } else if (myOrders.sell[currentOrder].price) {
    if (myOrders.sell[currentOrder].state === 'waiting') {
      if (findLowestSellPrice().price > myOrders.sell[currentOrder].price) {

        //console.log('Sold!');

        let buyAmount = myOrders.buy[currentOrder].price * 1.04;
        myOrders.orderAmountMade[currentOrder] = parseFloat((myOrders.sell[currentOrder].price * 20) - (buyAmount * 20));
        myOrders.sell[currentOrder] = {};
        myOrders.sell[currentOrder].state = 'paused';
        myOrders.buy[currentOrder] = {};
        myOrders.buy[currentOrder].state = 'buying';

        return;

      } else if (filterSellOrder().price < myOrders.sell[currentOrder].price) {

        //console.log('Updating sell price! Good order? ' + sellOrder.goodOrder + ' Price: ' + fakeSellId.price);

        //fakeSellId = sellOrder;
        //fakeSellId.price = parseFloat(fakeSellId.price) - 0.01;

        return;
      }
    }
  }
});
//=============================================
//=============================================
//=============================================
// Place sell order
//=============================================
//=============================================
//=============================================
// Buy gap info
//=============================================
//=============================================
//=============================================
let buyGapInfo = (() => {
  if (!(myOrders.buy[currentOrder].price)) return false;
  let buyCount = 0;
  let buyTotal = 0;
  for (let i = 0; i < orderBook['buy'].length && myOrders.buy[currentOrder]; i++) {
    if (orderBook['buy'][i].price <= myOrders.buy[currentOrder].price) {
      break;
    } else {
      buyCount++;
      buyTotal += orderBook['buy'][i].price;
    }
  }
  return [buyCount, buyTotal];
});
//=============================================
//=============================================
//=============================================
// Buy gap info
//=============================================
//=============================================
//=============================================
// Sell gap info
//=============================================
//=============================================
//=============================================
let sellGapInfo = (() => {
  if (!(myOrders.sell[currentOrder].price)) return false;
  let sellCount = 0;
  let sellTotal = 0;
  for (let i = 0; i < orderBook['sell'].length && myOrders.sell[currentOrder]; i++) {
    if (orderBook['sell'][i].price >= myOrders.sell[currentOrder].price) {
      break;
    } else {
      sellCount++;
      sellTotal += orderBook['sell'][i].price;
    }
  }
  return [sellCount, sellTotal];
});
//=============================================
//=============================================
//=============================================
// Sell Gap info
//=============================================
//=============================================
//=============================================
// Sort both buy and sell
//=============================================
//=============================================
//=============================================
let sortBothSides = (() => {
  orderBook['buy']
    .sort((a, b) => {
      return b.price - a.price;
    });
  orderBook['sell']
    .sort((a, b) => {
      return a.price - b.price;
    });
});
//=============================================
//=============================================
//=============================================
// Sort both buy and sell
//=============================================
//=============================================
//=============================================
// Sort through orders and label them good or bad
//=============================================
//=============================================
//=============================================
let filterGoodOrders = (() => {
  let goodOrderOp = (objectSide) => {
    for (let i = 0; i < orderBook[objectSide].length; i++) {
      let obj = orderBook[objectSide][i];
      if ((obj.price * obj.size) > mySettings.realityCriteria[currentOrder]) {
        obj.goodOrder = true;
      } else {
        obj.goodOrder = false;
      }
    }
  };
  goodOrderOp('buy');
  goodOrderOp('sell');
});
//=============================================
let findGoodOrders = (() => {
  let good = {
    'buy': 0,
    'sell': 0
  };

  let goodOrderOp = (objectSide) => {
    for (let i = 0; i < orderBook[objectSide].length; i++) {
      let obj = orderBook[objectSide][i];
      if ((obj.price * obj.size) > mySettings.realityCriteria[currentOrder]) good[objectSide]++;
    }
  };

  goodOrderOp('buy');
  goodOrderOp('sell');

  return good;
});
//=============================================
//=============================================
//=============================================
// Sort through orders and labem them good or bad
//=============================================
//=============================================
//=============================================
// Find the highest buy price in the order book
//=============================================
//=============================================
//=============================================
let findHighestBuyPrice = (() => {
  return orderBook['buy']
    .find((data) => {
      if (data.price) return data;
    });
});
//=============================================
//=============================================
//=============================================
// Find the highest buy price in the order book
//=============================================
//=============================================
//=============================================
// Find the loweset sell price in the order book
//=============================================
//=============================================
//=============================================
let findLowestSellPrice = (() => {
  return orderBook['sell']
    .find((data) => {
      if (data.price) return data;
    });
});
//=============================================
//=============================================
//=============================================
// Find the lowest sell price in the order book
//=============================================
//=============================================
//=============================================
// Check variables
//=============================================
//=============================================
//=============================================
let checkVars = (() => {
  if (lostConnection) return;
  if (Number(findHighestBuyPrice().price)) findHighestBuyPrice().price = parseFloat(findHighestBuyPrice().price);
  if (Number(findLowestSellPrice().price)) findLowestSellPrice().price = parseFloat(findLowestSellPrice().price);

  if (!myOrders.buy[currentOrder]) placeBuy();
  if (!myOrders.sell[currentOrder]) placeSell();

  if (myOrders.buy[currentOrder].price) {
    if (Number(myOrders.buy[currentOrder].price)) myOrders.buy[currentOrder].price = parseFloat(myOrders.buy[currentOrder].price);
  }
  if (myOrders.sell[currentOrder].price) {
    if (Number(myOrders.sell[currentOrder].price)) myOrders.sell[currentOrder].price = parseFloat(myOrders.sell[currentOrder].price);
  }

  if (myOrders.orderAmountMade[currentOrder]) {
    if (Number(myOrders.orderAmountMade[currentOrder])) myOrders.orderAmountMade[currentOrder] = parseFloat(myOrders.orderAmountMade[currentOrder]);
  }
});
//=============================================
//=============================================
//=============================================
// Check variables
//=============================================
//=============================================
//=============================================
// Filter buy orders for a margin
//=============================================
//=============================================
//=============================================
let filterBuyOrder = (() => {
  return orderBook['buy'].find((data) => {
    if (data.goodOrder && (findHighestBuyPrice().price / data.price) >= mySettings.realMargin[currentOrder]) return data;
  });
});
//=============================================
//=============================================
//=============================================
// Filter buy orders for a margin
//=============================================
//=============================================
//=============================================
// Filter sell orders for a margin
//=============================================
//=============================================
//=============================================
let filterSellOrder = (() => {
  return orderBook['sell'].find((data) => {
    if (data.goodOrder && (data.price / myOrders.buy[currentOrder].price) >= ((mySettings.realMargin[currentOrder]) * 2) - 1) return data;
  });
});
//=============================================
//=============================================
//=============================================
// Filter sell orders for a margin
//=============================================
//=============================================
//=============================================
// Total amount made
//=============================================
//=============================================
//=============================================
let addTotalAmount = (() => {
  return myOrders.orderAmountMade.reduce((init, data) => {
    return init + data;
  });
});
//=============================================
//=============================================
//=============================================
// Total amount made
//=============================================
//=============================================
//=============================================
//=============================================
// Reset newOrder
//=============================================
//=============================================
//=============================================
let resetnewOrder = (() => {
  if (newOrder.buy.placing) newOrder.buy = {
    placing: false,
    price: false,
    size: false
  };
  if (newOrder.sell.placing) newOrder.sell = {
    placing: false,
    price: false,
    size: false
  };
});
//=============================================
//=============================================
//=============================================
//END Reset PlacTalk
//=============================================
//=============================================
//=============================================
// File control
//=============================================
//=============================================
//=============================================
let writeData = (() => {
  fs.open('storage.json', 'wx', (err) => {
    if (err) {
      if (err.code === 'EEXIST') {
        writeMyData();
        return;
      }

      throw err;
    }

    writeMyData();
  });
});
//=============================================
let writeMyData = (() => {
  fs.writeFile('storage.json', JSON.stringify(myOrders), (err) => {
    if (err) throw err;
    //console.log('The "data to append" was appended to file!');
  });
});
//=============================================
let readMyData = (() => {
  fs.readFile('storage.json', 'utf8', (err, data) => {
    if (err) throw err;
    myOrders = JSON.parse(data);
  });
});
/*
function appendMyData() {
    fs.appendFile('storage.json', myOrders, (err) => {
      if (err) throw err;
      //console.log('The "data to append" was appended to file!');
    });
}
*/
//=============================================
//=============================================
//=============================================
// File control
//=============================================
//=============================================
//=============================================
// Reset Orders
//=============================================
//=============================================
//=============================================
let resetOrderInterval = (() => {
  if (currentOrder < (mySettings.realityCriteria.length - 1)) {
    currentOrder++;
  } else {
    currentOrder = 0;
    writeData();
    resetnewOrder();
  }
});
//=============================================
//=============================================
//=============================================
// Reset Orders
//=============================================
//=============================================
//=============================================
