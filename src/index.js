//=============================================
//=============================================
//=============================================
//START>> Global let Dec's
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
const websocket = new Gdax.WebsocketClient(['ETH-USD']);
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

let myOrderIterator = 0;
let talkAboutUpdating = false;
let placeTalk = {
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
//END>> Global let Dec's
//=============================================
//=============================================
//=============================================
//START>> Run Our Program
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
//END>> Run Our Program
//=============================================
//=============================================
//=============================================
//START>> GDAX Module REST API OrderBook Fetch
//=============================================
//=============================================
//=============================================
var getOrderBook = ((level) => {
  return getProductOrderBook({
    'level': level
  }).then(function(data) {
    return JSON.parse(data.body);
  });
});
//=============================================
//=============================================
//=============================================
//END>> GDAX Module REST API OrderBook Fetch
//=============================================
//=============================================
//=============================================
//START>> Call GDAX function for ASYNC variable
//=============================================
//=============================================
//=============================================
var downloadOrderBook = ((flag) => {
  if (orderBook['buy'][0] && orderBook['sell'][0] || flag) {

    if (flag) resetPause = true;

    pauseOrderBook = true;
    resetFlag ? console.log('Refreshing OrderBook! Downloading OrderBook...') : console.log('WebSocket Connected! Downloading OrderBook...');

    let savedTime = new Date().getTime();
    let timeDown = 0;
    var countdown = setInterval(() => {
      timeDown = (new Date().getTime() - savedTime);
      let output = ('Orderbook re-download timeout: ' + (timeDown)).toString();
      console.log(output.slice(0, -3));
    }, 1000);

    getOrderBook(3).then(function(value) {

      if (timeDown > 30000) {
        clearInterval(countdown);
        console.log('Orderbook re-download connection lost...');
        return;
      }

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
      clearInterval(countdown);

      if (resetFlag) {
        resetFlag = false;
        resetPause = false;
        return;
      } else {
        setInterval(findRealisticOrders, 500);
      }

    }).catch(function(err) {
      console.log(err);
    });
  }
});
//=============================================
//=============================================
//=============================================
//END>> Call GDAX function for ASYNC variable
//=============================================
//=============================================
//=============================================
//START>> Websocket Change Detections
//=============================================
//=============================================
//=============================================
function getWebSocketData() {
  websocket.on('message', function(data) {
    //if (data.type == 'match') data.size == 'sell' ? console.log('Up tick!') : console.log('Down tick!')

    if (data.type == 'ticker' || data.type == 'snapshot' || data.type == 'l2update' || data.type == 'heartbeat' || data.type == 'subscribe' || data.type == 'unsubscribe' || data.type == 'subscriptions') {
      console.log('Error on WebSocket Feed data.type == ', data.type);
      return;
    } else if (data.type == 'error') {
      console.log('Error on WebSocket Feed data.type == ', data.type);
      console.log('Error on WebSocket Feed data.message == ', data.message);
      return;
    } else if (data.side != 'buy' && data.side != 'sell' && data.side) {
      console.log('Error on WebSocket Feed data.type not sell or buy data.type == ', data.side);
      return;
    }
    catchWebSocketMessage(data);
  });
}
//=============================================
//=============================================
//=============================================
//END>> Websocket Change Detections
//=============================================
//=============================================
//=============================================
//START>> WebSocket Message Filter
//=============================================
//=============================================
//=============================================
var catchWebSocketMessage = ((data) => {

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

  if (data.type == 'open') {
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
  } else if (data.type == 'match') {
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
      return data.maker_order_id != item.order_id;
    });
    orderBook[objectSide] = orderBook[objectSide].filter((item) => {
      return data.taker_order_id != item.order_id;
    });
  } else if (data.type == 'received') {
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
  } else if (data.type == 'change') {
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
      if (orderBook[objectSide].order_id == data.order_id) {
        orderBook[objectSide][i].size = Number(data.new_size) ? Number(data.new_size) : parseFloat(data.new_size);
        orderBook[objectSide][i].price = parseFloat(data.price);
        break;
      }
    }
  } else if (data.type == 'done') {
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
      return data.order_id != item.order_id;
    });
  } else if (data.type == 'activate') {
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
  } else if (data.type == 'margin_profile_update') {
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
  } else if (data.type == 'error') {
    console.log('Error on WebSocket Feed data.type == ', data.type);
    console.log('Message was an error: ', data.message);
  } else {
    console.log('Uncaught WebSocket type in feed: ', data.type);
  }
});
//=============================================
//=============================================
//=============================================
//END>> WebSocket Message Filter
//=============================================
//=============================================
//=============================================
//START>> DeDupe OrderBook
//=============================================
//=============================================
//=============================================
var deDupe = (() => {
  dataIntegrityTest = true;
  console.log('OrderBook Downloaded! de-Duping OrderBook!');

  // let funt = (objectSide) => {
  //     for (let i = 0; i < orderBook[objectSide].length; i++) {
  //         for(let z = i+1; z < orderBook[objectSide].length; z++) {
  //             if (orderBook[objectSide][i].order_id == orderBook[objectSide][z].order_id) {
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
//END>> DeDupe OrderBook
//=============================================
//=============================================
//=============================================
//START>> Output logging
//=============================================
//=============================================
//=============================================
var outPutLoggingGood = (() => {
  if (orderBook['buy'] && orderBook['sell'] && findGoodOrders()) {
    return {
      realBuys: findGoodOrders()['buy'] ? findGoodOrders()['buy'] : false,
      realSells: findGoodOrders()['sell'] ? findGoodOrders()['sell'] : false,
      totalBuys: orderBook['buy'].length ? orderBook['buy'].length : false,
      totalSells: orderBook['sell'].length ? orderBook['sell'].length : false,
      goodBuyPercent: parseFloat(orderBook['buy'].length / findGoodOrders()['buy']) ? parseFloat(orderBook['buy'].length / findGoodOrders()['buy']) : false,
      goodSellPercent: parseFloat(orderBook['sell'].length / findGoodOrders()['sell']) ? parseFloat(orderBook['sell'].length / findGoodOrders()['sell']) : false,
      totalBadPercent: parseFloat(100 - (parseFloat(orderBook['buy'].length / findGoodOrders()['buy']) + parseFloat(orderBook['sell'].length / findGoodOrders()['sell']))) ? parseFloat(100 - (parseFloat(orderBook['buy'].length / findGoodOrders()['buy']) + parseFloat(orderBook['sell'].length / findGoodOrders()['sell']))) : false
    };
  }
  return false;
});
//=============================================
//=============================================
//=============================================
var outPutLoggingEtc = (() => {
  myOrders.orderAmountMade[myOrderIterator] = parseFloat(myOrders.orderAmountMade[myOrderIterator]);
  return {
    totalAmountMade: addTotalAmount() ? addTotalAmount() : false,
    amountMade: myOrders.orderAmountMade ? myOrders.orderAmountMade[myOrderIterator] : false,
    placeTalk: placeTalk ? placeTalk : false
  };
});
//=============================================
//=============================================
//=============================================
var outPutLoggingBuy = (() => {
  if (!buyGapInfo()) return 'noBuyInfo';
  if (!myOrders.buy[myOrderIterator]) return 'noBuyOrder';
  if (myOrders.buy[myOrderIterator] && buyGapInfo()) {
    return {
      talkAboutUpdating: talkAboutUpdating ? talkAboutUpdating : false,
      newPriceUpdate: talkAboutUpdating ? myOrders.buy[myOrderIterator].price : false,
      oldPriceUpdate: talkAboutUpdating ? talkAboutUpdating : false,
      difference: talkAboutUpdating ? myOrders.buy[myOrderIterator].price - myOrders.buy[myOrderIterator].oldPrice : false,
      myBuyOrder: myOrders.buy[myOrderIterator] ? myOrders.buy[myOrderIterator] : false,
      buyCount: buyGapInfo()[0] ? buyGapInfo()[0] : false,
      buyTotal: buyGapInfo()[1] ? buyGapInfo()[1] : false
    };
  }
  return false;
});
//=============================================
//=============================================
//=============================================
var outPutLoggingSell = (() => {
  if (!sellGapInfo()) return 'noSellInfo';
  if (!myOrders.sell[myOrderIterator]) return 'noSellOrder';
  if (myOrders.sell[myOrderIterator] && sellGapInfo()) {
    return {
      mySellOrder: myOrders.sell[myOrderIterator] ? myOrders.sell[myOrderIterator] : false,
      sellCount: sellGapInfo()[0] ? sellGapInfo()[0] : false,
      sellTotal: sellGapInfo()[1] ? sellGapInfo()[1] : false
    };
  }
  return false;
});
//=============================================
//=============================================
//=============================================
//END>> Output logging
//=============================================
//=============================================
//=============================================
//START>> SERVER
//=============================================
//=============================================
//=============================================
console.log('Starting server...');
var app = express();
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
  return;
});
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/api', function(req, res) {
  res.json({
    highestBuyPrice: findHighestBuyPrice() ? findHighestBuyPrice().price : false,
    lowestSellPrice: findLowestSellPrice() ? findLowestSellPrice().price : false,
    outPutLoggingGood: outPutLoggingGood() ? outPutLoggingGood() : false,
    outPutLoggingEtc: outPutLoggingEtc() ? outPutLoggingEtc() : false,
    outPutLoggingBuy: outPutLoggingBuy() ? outPutLoggingBuy() : false,
    outPutLoggingSell: outPutLoggingSell() ? outPutLoggingSell() : false,
    myOrderIterator: myOrderIterator ? myOrderIterator : false,
    buyState: myOrders.buy[myOrderIterator].state ? myOrders.buy[myOrderIterator].state : false,
    sellState: myOrders.sell[myOrderIterator].state ? myOrders.sell[myOrderIterator].state : false
  });
});
if (lisenPort === 'c9') {
  app.listen(process.env.PORT, process.env.IP);
} else {
  app.listen(lisenPort);
}
//=============================================
//=============================================
//=============================================
//END>> SERVER
//=============================================
//=============================================
//=============================================
//START>> Market Order Reality Checks
//=============================================
//=============================================
//=============================================
var findRealisticOrders = (() => {
  if (resetFlag) return;
  if (runBenchmark && !resetFlag) {

    let savedTime = new Date().getTime();
    let timeDown = 0;
    var countdown = setInterval(() => {
      timeDown = (new Date().getTime() - savedTime);
      let output = timeDown.toString();
      console.log('Order took: ' + output.slice(0, -2) + 'ms');
      if (timeDown > 1000) {
        console.log('Order timeout...');
        resetOrderInterval(countdown);
        return;
      }
    }, 100);

    sortBothSides();
    filterGoodOrders();

    checkVars();

    placeBuy();
    placeSell();

    resetOrderInterval(countdown);
  }
});
//=============================================
//=============================================
//=============================================
//END>> Market Order Reality Checks
//=============================================
//=============================================
//=============================================
//START>> Place buy order
//=============================================
//=============================================
//=============================================
var placeBuy = (() => {
  if (!filterBuyOrder(findHighestBuyPrice())) {
    //console.log('Wait what? This should\'t happen!');
    return;
  }

  if (myOrders.buy[myOrderIterator].state == 'buying') {

    placeTalk.buy = {
      placing: true,
      price: filterBuyOrder().price,
      size: 20
    };

    if (myOrders.buy[myOrderIterator].price) {
      myOrders.buy[myOrderIterator].oldPrice = parseFloat(myOrders.buy[myOrderIterator].price + 0.01);
    } else {
      myOrders.buy[myOrderIterator] = filterBuyOrder();
      myOrders.buy[myOrderIterator].oldPrice = parseFloat(filterBuyOrder().price + 0.01);
    }

    myOrders.buy[myOrderIterator] = filterBuyOrder();
    myOrders.buy[myOrderIterator].price = parseFloat(filterBuyOrder().price + 0.01);

    let myMargin = (findHighestBuyPrice().price / myOrders.buy[myOrderIterator].price);
    myOrders.buy[myOrderIterator].oldMargin = myMargin;

    myOrders.buy[myOrderIterator].oldOrdersToGo = buyGapInfo()[0];
    myOrders.buy[myOrderIterator].oldAmountToGo = buyGapInfo()[1];

    myOrders.buy[myOrderIterator].state = 'waiting';

    return;
  } else if (myOrders.buy[myOrderIterator].state == 'waiting') {
    if (findHighestBuyPrice().price < myOrders.buy[myOrderIterator].price) {

      //console.log('Purchased!');

      myOrders.buy[myOrderIterator].state = 'paused';
      myOrders.sell[myOrderIterator].state = 'selling';

      return;
    } else if (myOrders.buy[myOrderIterator].price) {
      if (buyGapInfo()[0] > myOrders.buy[myOrderIterator].oldOrdersToGo &&
        buyGapInfo()[1] > myOrders.buy[myOrderIterator].oldAmountToGo &&
        (findHighestBuyPrice().price / filterBuyOrder().price) > myOrders.buy[myOrderIterator].oldMargin &&
        filterBuyOrder().price > myOrders.buy[myOrderIterator].oldPrice) {

        talkAboutUpdating = parseFloat(myOrders.buy[myOrderIterator].oldPrice);

        myOrders.buy[myOrderIterator].oldOrdersToGo = buyGapInfo()[0];
        myOrders.buy[myOrderIterator].oldAmountToGo = buyGapInfo()[1];

        let myMargin = (findHighestBuyPrice().price / myOrders.buy[myOrderIterator].price);
        myOrders.buy[myOrderIterator].oldMargin = myMargin;

        myOrders.buy[myOrderIterator].oldPrice = parseFloat(myOrders.buy[myOrderIterator].price);
        myOrders.buy[myOrderIterator].price = parseFloat(filterBuyOrder().price + 0.01);

        return;
      }
    }
  }
});
//=============================================
//=============================================
//=============================================
//END>> Place buy order
//=============================================
//=============================================
//=============================================
//START>> Place sell order
//=============================================
//=============================================
//=============================================
var placeSell = (() => {
  if (!filterSellOrder()) {
    //console.log('Bubble?');
    return;
  }

  if (myOrders.sell[myOrderIterator].state == 'selling') {
    placeTalk.sell = {
      placing: true,
      price: filterSellOrder().price,
      size: 20
    };

    myOrders.sell[myOrderIterator] = filterSellOrder();
    myOrders.sell[myOrderIterator].price = parseFloat(myOrders.sell[myOrderIterator].price - 0.01);

    myOrders.sell[myOrderIterator] = myOrders.sell[myOrderIterator];

    myOrders.sell[myOrderIterator].state = 'waiting';

    return;

  } else if (myOrders.sell[myOrderIterator].price) {
    if (myOrders.sell[myOrderIterator].state == 'waiting') {
      if (findLowestSellPrice().price > myOrders.sell[myOrderIterator].price) {

        //console.log('Sold!');

        let buyAmount = myOrders.buy[myOrderIterator].price * 1.04;
        myOrders.orderAmountMade[myOrderIterator] = parseFloat((myOrders.sell[myOrderIterator].price * 20) - (buyAmount * 20));
        myOrders.sell[myOrderIterator] = {};
        myOrders.sell[myOrderIterator].state = 'paused';
        myOrders.buy[myOrderIterator] = {};
        myOrders.buy[myOrderIterator].state = 'buying';

        return;

      } else if (filterSellOrder().price < myOrders.sell[myOrderIterator].price) {

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
//END>> Place sell order
//=============================================
//=============================================
//=============================================
//START>> Buy gap info
//=============================================
//=============================================
//=============================================
var buyGapInfo = (() => {
  if (!(myOrders.buy[myOrderIterator].price)) return false;
  let buyCount = 0;
  let buyTotal = 0;
  for (let i = 0; i < orderBook['buy'].length && myOrders.buy[myOrderIterator]; i++) {
    if (orderBook['buy'][i].price <= myOrders.buy[myOrderIterator].price) {
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
//END>> Buy gap info
//=============================================
//=============================================
//=============================================
//START>> Sell gap info
//=============================================
//=============================================
//=============================================
var sellGapInfo = (() => {
  if (!(myOrders.sell[myOrderIterator].price)) return false;
  let sellCount = 0;
  let sellTotal = 0;
  for (let i = 0; i < orderBook['sell'].length && myOrders.sell[myOrderIterator]; i++) {
    if (orderBook['sell'][i].price >= myOrders.sell[myOrderIterator].price) {
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
//END>> Sell Gap info
//=============================================
//=============================================
//=============================================
//START>> Sort both buy and sell
//=============================================
//=============================================
//=============================================
var sortBothSides = (() => {
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
//END>> Sort both buy and sell
//=============================================
//=============================================
//=============================================
//START>> Sort through orders and label them good or bad
//=============================================
//=============================================
//=============================================
var filterGoodOrders = (() => {
  let goodOrderOp = (objectSide) => {
    for (let i = 0; i < orderBook[objectSide].length; i++) {
      let obj = orderBook[objectSide][i];
      if ((obj.price * obj.size) > mySettings.realityCriteria[myOrderIterator]) {
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
var findGoodOrders = (() => {
  let good = {
    'buy': 0,
    'sell': 0
  };

  let goodOrderOp = (objectSide) => {
    for (let i = 0; i < orderBook[objectSide].length; i++) {
      let obj = orderBook[objectSide][i];
      if ((obj.price * obj.size) > mySettings.realityCriteria[myOrderIterator]) good[objectSide]++;
    }
  };

  goodOrderOp('buy');
  goodOrderOp('sell');

  return good;
});
//=============================================
//=============================================
//=============================================
//END>> Sort through orders and labem them good or bad
//=============================================
//=============================================
//=============================================
//START>> Find the highest buy price in the order book
//=============================================
//=============================================
//=============================================
var findHighestBuyPrice = (() => {
  return orderBook['buy']
    .find((data) => {
      if (data.price) return data;
    });
});
//=============================================
//=============================================
//=============================================
//END>> Find the highest buy price in the order book
//=============================================
//=============================================
//=============================================
//START>> Find the loweset sell price in the order book
//=============================================
//=============================================
//=============================================
var findLowestSellPrice = (() => {
  return orderBook['sell']
    .find((data) => {
      if (data.price) return data;
    });
});
//=============================================
//=============================================
//=============================================
//END>> Find the lowest sell price in the order book
//=============================================
//=============================================
//=============================================
//START>> Check variables
//=============================================
//=============================================
//=============================================
var checkVars = (() => {
  if (Number(findHighestBuyPrice().price)) findHighestBuyPrice().price = parseFloat(findHighestBuyPrice().price);
  if (Number(findLowestSellPrice().price)) findLowestSellPrice().price = parseFloat(findLowestSellPrice().price);

  if (!myOrders.buy[myOrderIterator]) placeBuy();
  if (!myOrders.sell[myOrderIterator]) placeSell();

  if (myOrders.buy[myOrderIterator].price) {
    if (Number(myOrders.buy[myOrderIterator].price)) myOrders.buy[myOrderIterator].price = parseFloat(myOrders.buy[myOrderIterator].price);
  }
  if (myOrders.sell[myOrderIterator].price) {
    if (Number(myOrders.sell[myOrderIterator].price)) myOrders.sell[myOrderIterator].price = parseFloat(myOrders.sell[myOrderIterator].price);
  }

  if (myOrders.orderAmountMade[myOrderIterator]) {
    if (Number(myOrders.orderAmountMade[myOrderIterator])) myOrders.orderAmountMade[myOrderIterator] = parseFloat(myOrders.orderAmountMade[myOrderIterator]);
  }
});
//=============================================
//=============================================
//=============================================
//END>> Check variables
//=============================================
//=============================================
//=============================================
//START>> Populate my settings
//=============================================
//=============================================
//=============================================
function populateMySettings(num) {
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
      state: 'waiting'
    });
    myOrders.orderAmountMade.push(0);
  }
}
//=============================================
//=============================================
//=============================================
//END>> Populate my settings
//=============================================
//=============================================
//=============================================
//START>> Filter buy orders for a margin
//=============================================
//=============================================
//=============================================
var filterBuyOrder = (() => {
  return orderBook['buy'].find((data) => {
    if (data.goodOrder && (findHighestBuyPrice().price / data.price) >= mySettings.realMargin[myOrderIterator]) return data;
  });
});
//=============================================
//=============================================
//=============================================
//END>> Filter buy orders for a margin
//=============================================
//=============================================
//=============================================
//START>> Filter sell orders for a margin
//=============================================
//=============================================
//=============================================
var filterSellOrder = (() => {
  return orderBook['sell'].find((data) => {
    if (data.goodOrder && (data.price / myOrders.buy[myOrderIterator].price) >= ((mySettings.realMargin[myOrderIterator]) * 2) - 1) return data;
  });
});
//=============================================
//=============================================
//=============================================
//END>> Filter sell orders for a margin
//=============================================
//=============================================
//=============================================
//START>> Total amount made
//=============================================
//=============================================
//=============================================
var addTotalAmount = (() => {
  return myOrders.orderAmountMade.reduce((init, data) => {
    return init + data;
  });
});
//=============================================
//=============================================
//=============================================
//END>> Total amount made
//=============================================
//=============================================
//=============================================
//=============================================
//START>> Reset placeTalk
//=============================================
//=============================================
//=============================================
var resetPlaceTalk = (() => {
  if (placeTalk.buy.placing) placeTalk.buy = {
    placing: false,
    price: false,
    size: false
  };
  if (placeTalk.sell.placing) placeTalk.sell = {
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
//START>> File control
//=============================================
//=============================================
//=============================================
var writeData = (() => {
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
function readData() {
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
}
//=============================================
var writeMyData = (() => {
  fs.writeFile('storage.json', JSON.stringify(myOrders), (err) => {
    if (err) throw err;
    //console.log('The "data to append" was appended to file!');
  });
});
//=============================================
var readMyData = (() => {
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
//END>> File control
//=============================================
//=============================================
//=============================================
//START>> Reset Timer
//=============================================
//=============================================
//=============================================
var resetOrderInterval = ((countdown) => {
  if (myOrderIterator < (mySettings.realityCriteria.length - 1)) {
    myOrderIterator++;
    clearInterval(countdown);
  } else {
    myOrderIterator = 0;
    writeData();
    resetPlaceTalk();
    clearInterval(countdown);
  }
});
//=============================================
//=============================================
//=============================================
//END>> Reset Timer
//=============================================
//=============================================
//=============================================
