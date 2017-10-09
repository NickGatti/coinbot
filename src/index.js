//=============================================
//=============================================
//=============================================
//START>> Global Var Dec's
//=============================================
//=============================================
//=============================================
const Gdax = require('gdax');
const util = require('util');
var express = require('express');
const publicClient = new Gdax.PublicClient('ETH-USD');
const websocket = new Gdax.WebsocketClient(['ETH-USD']);
const getProductOrderBook = util.promisify(publicClient.getProductOrderBook.bind(publicClient));
//=============================================
//==============REALITY CRITERIA===============
//=============================================
const mySettings = {
    realityCriteria: [],
    realMargin: [
        1.0205,     // 1
        1.0205,     // 2
        1.0210,     // 3
        1.0210,     // 4
        1.0215,     // 5
        1.0215,     // 6
        1.0220,     // 7
        1.0220,     // 8
        1.0225,     // 9
        1.0225,     // 10
        1.0230,     // 11
        1.0230,     // 12
        1.0235,     // 13
        1.0235,     // 14
        1.0240,     // 15
        1.0240,     // 16
        1.0245,     // 17
        1.0245,     // 18
        1.0250,     // 19
        1.0250      // 20
    ]
};
var state = {
    buy: [],
    sell: []
};
var amountMade = [];
populateMySettings(10);
//=============================================
//==============REALITY CRITERIA===============
//=============================================
var orderBook = {
    'buy': [],
    'sell': []
};

var myOrderIterator = 0;
var talkAboutUpdating = false;
var placeTalk = {
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
var myOrders = {
    buy: [],
    sell: []
};
//=============================================
//=============================================
//=============================================
//END>> Global Var Dec's
//=============================================
//=============================================
//=============================================
//START>> Run Our Program
//=============================================
//=============================================
//=============================================
//console.log('Conneting WebSocket...');
var pauseOrderBook = false;
var resetFlag = false;
var runBenchmark = false;
var resetPause = false;
var dataIntegrityTest = false;
setInterval(() => {
    resetFlag = true;
}, 2400000);
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
function getOrderBook(level) {
    return getProductOrderBook({'level': level}).then(function(data) {
        return JSON.parse(data.body);
    });
}
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
function downloadOrderBook(flag){
    if (orderBook['buy'][0] && orderBook['sell'][0] || flag) {

        if (flag) resetPause = true;

        pauseOrderBook = true;
        //resetFlag ? console.log('Refreshing OrderBook! Downloading OrderBook...') : console.log('WebSocket Connected! Downloading OrderBook...');

        getOrderBook(3).then(function(value) {

            let rawOrderBookData = {
                'buy': value.bids,
                'sell': value.asks
            };

            let populateOrders = (objectSide) => {
                for (let i = 0; i < rawOrderBookData[objectSide].length; i++){
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

        }).catch(function (err) {
            console.log(err);
        });
    }
}
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

        if (data.type == 'ticker' || data.type == 'snapshot' || data.type =='l2update' || data.type =='heartbeat' || data.type =='subscribe' || data.type =='unsubscribe' || data.type =='subscriptions') {
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
    });}
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
function catchWebSocketMessage(data) {

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
    } else if (data.type =='error') {
        console.log('Error on WebSocket Feed data.type == ', data.type);
        console.log('Message was an error: ', data.message);
    } else {
        console.log('Uncaught WebSocket type in feed: ', data.type);
    }
}
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
function deDupe() {
    dataIntegrityTest = true;
    //console.log('OrderBook Downloaded! de-Duping OrderBook!');

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
}
//=============================================
//END>> DeDupe OrderBook
//=============================================
//START>> Market Order Reality Checks
//=============================================
function findRealisticOrders() {
    if (resetFlag) return;
    if (runBenchmark && !resetFlag) {

        sortBothSides();
        filterGoodOrders();

        checkVars();

        placeBuy();
        placeSell();

        outPutLoggingGood();
        outPutLoggingEtc();
        outPutLoggingBuy();
        outPutLoggingSell();

        if (myOrderIterator < ( mySettings.realityCriteria.length - 1) ) {
            myOrderIterator++;
        } else {
            myOrderIterator = 0;
        }

    }
}
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
function placeBuy(){

    let highestBuyPrice = findHighestBuyPrice();
    let myBuyOrder = myOrders.buy[myOrderIterator];
    let currentBuyOrder = filterBuyOrder(highestBuyPrice);
    let buyInfo = buyGapInfo();

    let currentOrdersToGo = buyInfo[0];
    let currentAmountToGo = buyInfo[1];

    let currentMargin = (highestBuyPrice.price / currentBuyOrder.price);

    if (!currentBuyOrder) {
        console.log('Wait what? This should\'t happen!');
        return;
    }

    if (state.buy[myOrderIterator] == 'buying') {

        placeTalk.buy = {
            placing: true,
            price: currentBuyOrder.price,
            size: 20
        };

        if (myBuyOrder) {
            myBuyOrder.oldPrice = parseFloat(myBuyOrder.price);
        } else {
            myBuyOrder = currentBuyOrder;
            myBuyOrder.oldPrice = parseFloat(currentBuyOrder.price + 0.01);
        }

        myBuyOrder = currentBuyOrder;
        myBuyOrder.oldOrdersToGo = currentOrdersToGo;
        myBuyOrder.oldAmountToGo = currentAmountToGo;
        myBuyOrder.price = parseFloat(currentBuyOrder.price + 0.01);

        let myMargin = (highestBuyPrice.price / myBuyOrder.price);
        myBuyOrder.oldMargin = myMargin;

        myOrders.buy[myOrderIterator] = myBuyOrder;

        state.buy[myOrderIterator] = 'waiting';

        return;
    } else if (state.buy[myOrderIterator] == 'waiting') {
        if (highestBuyPrice.price < myBuyOrder.price) {

            //console.log('Purchased!');

            state.buy[myOrderIterator] = 'paused';
            state.sell[myOrderIterator] = 'selling';

            return;
        } else if (myBuyOrder) {
            if (currentOrdersToGo > myBuyOrder.oldOrdersToGo &&
                        currentAmountToGo > myBuyOrder.oldAmountToGo &&
                        currentMargin > myBuyOrder.oldMargin &&
                        currentBuyOrder.price > myBuyOrder.oldPrice)  {

                talkAboutUpdating = parseFloat(myBuyOrder.oldPrice);

                myBuyOrder.oldOrdersToGo = currentOrdersToGo;
                myBuyOrder.oldAmountToGo = currentAmountToGo;

                let myMargin = (highestBuyPrice.price / myBuyOrder.price);
                myBuyOrder.oldMargin = myMargin;

                myBuyOrder.oldPrice = parseFloat(myBuyOrder.price);
                myBuyOrder.price = parseFloat(currentBuyOrder.price + 0.01);

                myOrders.buy[myOrderIterator] = myBuyOrder;

                return;
            }
        }
    }
}
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
function placeSell(){

    let myBuyOrder = myOrders.buy[myOrderIterator];
    let mySellOrder = myOrders.sell[myOrderIterator];
    let lowestSellPrice = findLowestSellPrice();
    let currentSellOrder = filterSellOrder(myBuyOrder);

    if (!currentSellOrder) {
        //console.log('Bubble?');
        return;
    }

    if (state.sell[myOrderIterator] == 'selling') {
        placeTalk.sell = {
            placing: true,
            price: currentSellOrder.price,
            size: 20
        };

        mySellOrder = currentSellOrder;
        mySellOrder.price = parseFloat(mySellOrder.price - 0.01);

        myOrders.sell[myOrderIterator] = mySellOrder;

        state.sell[myOrderIterator] = 'waiting';

        return;

    } else if (mySellOrder) {
        if (state.sell[myOrderIterator] == 'waiting') {
            if (lowestSellPrice.price > mySellOrder.price) {

                //console.log('Sold!');

                let buyAmount = myBuyOrder.price * 1.04;
                amountMade[myOrderIterator] = parseFloat((mySellOrder.price * 20) - (buyAmount * 20));
                state.sell[myOrderIterator] = 'paused';
                state.buy[myOrderIterator] = 'buying';

                return;

            }  else if (currentSellOrder.price < mySellOrder.price) {

                //console.log('Updating sell price! Good order? ' + sellOrder.goodOrder + ' Price: ' + fakeSellId.price);

                //fakeSellId = sellOrder;
                //fakeSellId.price = parseFloat(fakeSellId.price) - 0.01;

                return;
            }
        }
    }
}
//=============================================
//=============================================
//=============================================
//END>> Place sell order
//=============================================
//=============================================
//=============================================
//START>> Output logging
//=============================================
//=============================================
//=============================================
function outPutLoggingGood(){
    let good = findGoodOrders();
    let output = false;
    if (orderBook['buy'] && orderBook['sell'] && good){
        output = {
            realBuys: good['buy'] ? good['buy'] : false,
            realSells: good['sell'] ? good['sell'] : false,
            totalBuys: orderBook['buy'].length ? orderBook['buy'].length : false,
            totalSells: orderBook['sell'].length ? orderBook['sell'].length : false,
            goodBuyPercent: parseFloat(orderBook['buy'].length / good['buy']) ? parseFloat(orderBook['buy'].length / good['buy']) : false,
            goodSellPercent: parseFloat(orderBook['sell'].length / good['sell']) ? parseFloat(orderBook['sell'].length / good['sell']) : false,
            totalBadPercent: parseFloat(100 - (parseFloat(orderBook['buy'].length / good['buy']) + parseFloat(orderBook['sell'].length / good['sell']))) ? parseFloat(100 - (parseFloat(orderBook['buy'].length / good['buy']) + parseFloat(orderBook['sell'].length / good['sell']))) : false
        };
    }
    return output;
}
//=============================================
//=============================================
//=============================================
function outPutLoggingEtc(){
    let totalAmountMade = addTotalAmount();
    totalAmountMade = parseFloat(totalAmountMade);
    amountMade[myOrderIterator] = parseFloat(amountMade[myOrderIterator]);
    let output = {
        totalAmountMade: totalAmountMade ? totalAmountMade : false,
        amountMade: amountMade ? amountMade[myOrderIterator] : false,
        placeTalk: placeTalk ? placeTalk : false
    };
    return output;
}
//=============================================
//=============================================
//=============================================
function outPutLoggingBuy(){
    let myBuyOrder = myOrders.buy[myOrderIterator];
    let buyInfo = buyGapInfo();
    if (!buyInfo) return 'noBuyInfo';
    if (!myBuyOrder) return 'noBuyOrder';
    let output = false;
    if (myBuyOrder && buyInfo) {
        if (state.buy[myOrderIterator] != 'buying') placeTalk.buy = {
            placing: false,
            price: false,
            size: false
        };
        output = {
            talkAboutUpdating: talkAboutUpdating ? talkAboutUpdating : false,
            newPriceUpdate: talkAboutUpdating ? myOrders.buy[myOrderIterator].price : false,
            oldPriceUpdate: talkAboutUpdating ? talkAboutUpdating : false,
            difference: talkAboutUpdating ? talkAboutUpdating - myOrders.buy[myOrderIterator].price : false,
            myBuyOrder: myBuyOrder ? myBuyOrder : false,
            buyCount: buyInfo[0] ? buyInfo[0] : false,
            buyTotal: buyInfo[1] ? buyInfo[1] : false
        };
    }
    return output;
}
//=============================================
//=============================================
//=============================================
function outPutLoggingSell(){
    let mySellOrder = myOrders.sell[myOrderIterator];
    let sellInfo = sellGapInfo();
    if (!sellInfo) return 'noSellInfo';
    if (!mySellOrder) return 'noSellOrder';
    let output = false;
    if (mySellOrder && sellInfo) {
        if (state.sell[myOrderIterator] != 'selling') placeTalk.sell = {
            placing: false,
            price: false,
            size: false
        };
        output = {
            mySellOrder: mySellOrder ? mySellOrder : false,
            sellCount: sellInfo[0] ? sellInfo[0] : false,
            sellTotal: sellInfo[1] ? sellInfo[1] : false
        };
    }
    return output;
}
//=============================================
//=============================================
//=============================================
//END>> Output logging
//=============================================
//=============================================
//=============================================
//START>> Buy gap info
//=============================================
//=============================================
//=============================================
function buyGapInfo(){
    let myBuyOrder = myOrders.buy[myOrderIterator];
    let buyCount = 0;
    let buyTotal = 0;
    for (let i = 0; i < orderBook['buy'].length && myBuyOrder; i++) {
        if (orderBook['buy'][i].price <= myBuyOrder.price) {
            break;
        } else {
            buyCount++;
            buyTotal += orderBook['buy'][i].price;
        }
    }
    return [buyCount, buyTotal];
}
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
function sellGapInfo(){
    let mySellOrder = myOrders.sell[myOrderIterator];
    let sellCount = 0;
    let sellTotal = 0;
    for (let i = 0; i < orderBook['sell'].length && mySellOrder; i++) {
        if (orderBook['sell'][i].price >= mySellOrder.price) {
            break;
        } else {
            sellCount++;
            sellTotal += orderBook['sell'][i].price;
        }
    }
    return [sellCount, sellTotal];
}
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
function sortBothSides(){
    orderBook['buy']
        .sort((a, b) => {
            return b.price - a.price;
        });
    orderBook['sell']
        .sort((a, b) => {
            return a.price - b.price;
        });
}
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
function filterGoodOrders(){
    let goodOrderOp = (objectSide) => {
        for (let i = 0; i < orderBook[objectSide].length; i++){
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
}
function findGoodOrders(){
    let good = {
        'buy': 0,
        'sell': 0
    };

    let goodOrderOp = (objectSide) => {
        for (let i = 0; i < orderBook[objectSide].length; i++){
            let obj = orderBook[objectSide][i];
            if ((obj.price * obj.size) > mySettings.realityCriteria[myOrderIterator]) good[objectSide]++;
        }
    };

    goodOrderOp('buy');
    goodOrderOp('sell');

    return good;
}
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
function findHighestBuyPrice(){
    let highestBuyPrice = orderBook['buy']
        .find((data) => {
            if (data.price) return data;
        });
    return highestBuyPrice;
}
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
function findLowestSellPrice(){
    let lowestSellPrice = orderBook['sell']
        .find((data) => {
            if (data.price) return data;
        });
    return lowestSellPrice;
}
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
function checkVars(){
    let highestBuyPrice = findHighestBuyPrice();
    let lowestSellPrice = findLowestSellPrice();

    let myBuyOrder = myOrders.buy[myOrderIterator];
    let mySellOrder = myOrders.sell[myOrderIterator];

    if (Number(highestBuyPrice.price)) highestBuyPrice.price = parseFloat(highestBuyPrice.price);
    if (Number(lowestSellPrice.price)) lowestSellPrice.price = parseFloat(lowestSellPrice.price);

    if (!myBuyOrder) {
        placeBuy();
        myBuyOrder = myOrders.buy[myOrderIterator];
    }
    if (!mySellOrder){
        placeSell();
        mySellOrder = myOrders.sell[myOrderIterator];
    }

    if (myBuyOrder) {
        if (Number(myBuyOrder.price)) myBuyOrder.price = parseFloat(myBuyOrder.price);
    }
    if (mySellOrder) {
        if (Number(mySellOrder.price)) mySellOrder.price = parseFloat(mySellOrder.price);
    }

    if (amountMade[myOrderIterator]) {
        if (Number(amountMade[myOrderIterator])) amountMade[myOrderIterator] = parseFloat(amountMade[myOrderIterator]);
    }
}
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
function populateMySettings(num){
    for (let i = 0; i < num; i++ ) {
        mySettings.realityCriteria.push(400);
        mySettings.realityCriteria.push(6000);
        state.buy.push('buying');
        state.buy.push('buying');
        state.sell.push('waiting');
        state.sell.push('waiting');
        amountMade.push(0);
        amountMade.push(0);
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
function filterBuyOrder(highestBuyPrice){
    let buyOrder = orderBook['buy'].find((data) => {
        if (data.goodOrder && (highestBuyPrice.price / data.price) >= mySettings.realMargin[myOrderIterator]) return data;
    });
    return buyOrder;
}
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
function filterSellOrder(myBuyOrder) {
    let sellOrder = orderBook['sell'].find((data) => {
        if (data.goodOrder && (data.price / myBuyOrder.price) >= ( ( mySettings.realMargin[myOrderIterator]) * 2 ) - 1) return data;
    });
    return sellOrder;
}
//=============================================
//=============================================
//=============================================
//END>> Filter sell orders for a margin
//=============================================
//=============================================
//=============================================
//START>> Number with commas
//=============================================
//=============================================
//=============================================
// function numberWithCommas(x) {
//     return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// }
//=============================================
//=============================================
//=============================================
//END>> Number with Commas
//=============================================
//=============================================
//=============================================
//START>> Total amount made
//=============================================
//=============================================
//=============================================
function addTotalAmount(){
    let totalAmountMade = amountMade.reduce((init, data) => {
        return init + data;
    });
    return totalAmountMade;
}
//=============================================
//=============================================
//=============================================
//END>> Total amount made
//=============================================
//=============================================
//=============================================
//START>> Backend API
//=============================================
//=============================================
//=============================================
console.log('Starting server...');
var app = express();
app.get('/api', function(req, res) {
    res.json({
        highestBuyPrice: findHighestBuyPrice() ? findHighestBuyPrice().price : false,
        lowestSellPrice: findLowestSellPrice() ? findLowestSellPrice().price : false,
        outPutLoggingGood: outPutLoggingGood() ? outPutLoggingGood() : false,
        outPutLoggingEtc: outPutLoggingEtc() ? outPutLoggingEtc() : false,
        outPutLoggingBuy: outPutLoggingBuy() ? outPutLoggingBuy() : false,
        outPutLoggingSell: outPutLoggingSell() ? outPutLoggingSell() : false,
        myOrderIterator: myOrderIterator ? myOrderIterator : false,
        buyState: state.buy[myOrderIterator] ? state.buy[myOrderIterator] : false,
        sellState: state.sell[myOrderIterator] ? state.sell[myOrderIterator] : false
    });
});

app.listen(3000);
//=============================================
//=============================================
//=============================================
//END>> Backend API
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
