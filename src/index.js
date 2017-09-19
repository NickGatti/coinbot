//=============================================
//START>> Global Var Dec's
//=============================================
const Gdax = require('gdax');
const util = require('util');
const publicClient = new Gdax.PublicClient('ETH-USD');
const websocket = new Gdax.WebsocketClient(['ETH-USD']);
const getProductOrderBook = util.promisify(publicClient.getProductOrderBook.bind(publicClient));
//=============================================
//==============REALITY CRITERIA===============
const realityCriteria = 10000;
const realMargin = 1.04;
//==============REALITY CRITERIA===============
//=============================================
var orderBook = {
    'Buys': [],
    'Sells': []
    };
//END>> Global Var Dec's
//=============================================
//START>> Run Our Program
console.log('Conneting WebSocket...');
var pauseOrderBook = false;
var runBenchmark = false;
getWebSocketData();
//END>> Run Our Program
//=============================================
//START>> GDAX Module REST API OrderBook Fetch
function getOrderBook(level) {
    return getProductOrderBook({'level': level}).then(function(data) {
        let obj = JSON.parse(data.body);
        return [obj.bids.length, obj.asks.length, (obj.bids.length + obj.asks.length), obj];
    }); 
}
//END>> GDAX Module REST API OrderBook Fetch
//=============================================
//START>> Call GDAX function for ASYNC variable
function downloadOrderBook(){
    if (orderBook['Buys'][0] && orderBook['Sells'][0]) {
        
        pauseOrderBook = true;
        console.log('WebSocket Connected! Downloading OrderBook...');
        
        getOrderBook(3).then(function(value) {
            
            let rawOrderBookData = {
                'Buys': value[3].bids,
                'Sells': value[3].asks
            };
            
            let objectSide = 'Buys';
            for (let sideSwitch = 0; sideSwitch < 2; sideSwitch++) {
                if (sideSwitch) objectSide = 'Sells'
                rawOrderBookData[objectSide].map((data, i) => {
                    orderBook[objectSide][i] = {
                        price: data[0],
                        size: data[1],
                        order_id: data[2]
                    };
                });                
            }
            
            deDupe();
            setInterval(findRealisticOrders, 2000);

        }).catch(function (err) {
            console.log(err);
        });
    }
}
//END>> Call GDAX function for ASYNC variable
//=============================================
//START>> Websocket Change Detections
function getWebSocketData() { 
    
    websocket.on('message', function(data) { 
    
    //if (data.type == 'match') data.size == 'sell' ? console.log('Up tick!') : console.log('Down tick!')
    let objectSide = 'Buys';
    let dataSide = 'buy';
    
    for (let sideSwitch = 0; sideSwitch < 2; sideSwitch++){
        if (sideSwitch) {
            objectSide = 'Sells';
            dataSide = 'sell';
        }
        if (data.side == dataSide) {
            let sideIndex = false;
            orderBook[objectSide].map((obj, index) => {
                if (obj.order_id == data.order_id) sideIndex = index;
            });
            if (sideIndex) {
                /*
                
                RAPE THE FUCK OUT OF SIDE INDEX
                RAPE THE FUCK OUT OF SIDE INDEX
                RAPE THE FUCK OUT OF SIDE INDEX
                RAPE THE FUCK OUT OF SIDE INDEX
                RAPE THE FUCK OUT OF SIDE INDEX
                
                */
                
                
                
                
                
                
                
                //If sideIndex is true then the orderID is found in the orderBook already
                if (data.type == 'change') {
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
                    data.new_size ? orderBook[objectSide][sideIndex].size = (data.new_size) : orderBook[objectSide][sideIndex].size = (data.new_funds);
                } else if (data.type == 'done') {
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
                } else if (data.type == 'ticker') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type == 'snapshot') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='l2update') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='heartbeat') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='subscribe') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='unsubscribe') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='subscriptions') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='error') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                    console.log('Message was an error: ', data.message);
                } else {
                    console.log('Error! data.type not caught!: ', data.type);
                    console.log('Message: ', data.message);
                }
            } else if (data.type == 'open') {
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
                        size: data.size,
                        side: data.size,
                        order_type: data.order_type
                    });
                    if (!pauseOrderBook) downloadOrderBook();
                } else if (data.type == 'match') {
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
                } else if (data.type == 'ticker') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type == 'snapshot') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='l2update') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='heartbeat') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='subscribe') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='unsubscribe') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='subscriptions') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                } else if (data.type =='error') {
                    console.log('Error on WebSocket Feed data.type == ', data.type);
                    console.log('Message was an error: ', data.message);
                } else {
                    console.log('Uncaught WebSocket type in feed: ', data.type);
                }
        }
    }
/*
        EXAMPLE OF WEBSOCKET OUTPUT:
        
{
    "type": "open", // "received" | "open" | "done" | "match" | "change" | "activate"
    "user_id": "5844eceecf7e803e259d0365",
    "profile_id": "765d1549-9660-4be2-97d4-fa2d65fa3352",
}
        
        "type": "received",
        "time": "2014-11-07T08:19:27.028459Z",
        "product_id": "BTC-USD",
        "sequence": 10,
        "order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
        "size": "1.34",
        "price": "502.1",
        "side": "buy",
        "order_type": "limit"
*/
})}
//END>> Websocket Change Detections
//=============================================
//>>START DeDupe OrderBook
function deDupe() {
    console.log('OrderBook Downloaded! de-Duping OrderBook!');

    let objSwitch = 'Buys';
    
    for (let x = 0; x < 2; x++) {
        if (x) objSwitch = 'Sells';
        for (let i = 0; i < orderBook[objSwitch].length; i++) {
            for(let z = i+1; z < orderBook[objSwitch].length; z++) {
                if (orderBook[objSwitch][i].order_id == orderBook[objSwitch][z].order_id) {
                    console.log('Duped Order Found! You should probably never really see this message!');
                    orderBook[objSwitch].splice(z, 1);
                }
            }
        }
    }
    
    console.log('OrderBook De-duped! Running program...');
    runBenchmark = true;
}
//>>END DeDupe OrderBook
//=============================================
//START>> Market Order Reality Checks
function findRealisticOrders() {
    if (runBenchmark) {
        let good = {
            'Buys': 0,
            'Sells': 0
        };
        let objectSide = 'Buys';
        
        for (let sideSwitch = 0; sideSwitch < 2; sideSwitch++){
            if (sideSwitch) objectSide = 'Sells';
            orderBook[objectSide].map((obj, index) => {
                if ((obj.price * obj.size) > realityCriteria) {
                    orderBook[objectSide][index].goodOrder = true;
                    good[objectSide]++;
                }
            });
        }
        
        let goodBuyPercent = Number(good['Buys'] / orderBook['Buys'].length);
        let goodSellPercent = Number(good['Sells'] / orderBook['Sells'].length);
        let totalBadPercent = Number(100 - (goodBuyPercent + goodSellPercent));
        console.log('Market Order Benchmark:');
        console.log(`Realistic buy  orders: ${good['Buys']} out of a total of ${orderBook['Buys'].length} buy  orders || ${goodBuyPercent.toFixed(2)}% good buy orders`);
        console.log(`Realistic sell orders: ${good['Sells']} out of a total of ${orderBook['Sells'].length} sell orders || ${goodSellPercent.toFixed(2)}% good sell orders`);
        console.log(`${totalBadPercent.toFixed(2)}% Total market orders do not meet criteria requirement`);
        console.log('=====================================================================================================');
        checkMargins();
    }
}
//End>> Market Order Reality Checks
//=============================================
//Start>> Margin Checks of Real Orders
function checkMargins(){
    
    let foundWorkingMargin = false;
    let orderData = {
        amountBetween: {
            'Buys': 0,
            'Sells': 0
        },
        count: {
            'Buys': 0,
            'Sells': 0
        }
    };
    
    orderBook['Buys']
    .sort((a, b) => {
        return b.price - a.price;
    });
    orderBook['Sells']
    .sort((a, b) => {
        return a.price - b.price;
    });
    
    for (let i = 0; (i < orderBook['Buys'].length && !foundWorkingMargin); i++){
        orderData.count['Buys']++;
        if (orderBook['Buys'][i].goodOrder) {
            for (let z = 0; (z < orderBook['Sells'].length && !foundWorkingMargin); z++){
                orderData.count['Sells']++;
                if ((orderBook['Sells'][z].goodOrder) && ((orderBook['Sells'][z].price / orderBook['Buys'][i].price) > realMargin)) {
                    let totalCount = orderData.count['Buys'] + orderData.count['Sells'];
                    let totalAmountInBetween = 0;
                    let margin = (orderBook['Sells'][z].price / orderBook['Buys'][i].price);
                    for (let x = 0; x < orderData.count['Buys']; x++) {
                        orderData.amountBetween['Buys'] =+ Number(orderBook['Buys'][x].price * orderBook['Buys'][x].size);
                    }
                    for (let x = 0; x < orderData.count['Sells']; x++) {
                        orderData.amountBetween['Sells'] =+ Number(orderBook['Sells'][x].price * orderBook['Sells'][x].size);
                    }
                    totalAmountInBetween = orderData.amountBetween['Buys'] + orderData.amountBetween['Sells'];
                    console.log('Margin Data:');
                    console.log(`Found good margin (${margin.toFixed(2).slice(2)}%) || These matched real orders have ${totalCount} fake orders filling their gap`);
                    console.log(`$${orderData.amountBetween['Buys'].toFixed(2)} amount of USD needs to fill for the fake order *buy* gap`);
                    console.log(`$${orderData.amountBetween['Sells'].toFixed(2)} amount of USD needs to fill for the fake order *sell* gap`);
                    console.log(`$${totalAmountInBetween.toFixed(2)} *total* amount of USD needs to fill for the fake order gap`);
                    console.log('=====================================================================================================');
                    foundWorkingMargin = true;
                }
            }
        }
    }
}
//End>> Margin Checks of Real Orders
//=============================================


//TODO
//FIX WEBSOCKET FEED DATA