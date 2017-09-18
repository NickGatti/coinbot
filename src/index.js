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
                if (data.type == 'done') {
                    orderBook[objectSide][sideIndex].type = (data.type);
                }
                
                if (data.type == 'change') {
                    data.new_size ? orderBook[objectSide][sideIndex].size = (data.new_size) : orderBook[objectSide][sideIndex].size = (data.new_funds);
                }
            } else {
                if (data.type == 'open') {
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
                }
            }
        }
    }
/*
        EXAMPLE OF WEBSOCKET OUTPUT:
        
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
    let objectSide = 'Buys';
    
    for (let sideSwitch = 0; sideSwitch < 2; sideSwitch++){
        if (sideSwitch) objectSide = 'Sells';
        for(let i = 0; i < orderBook[objectSide].length; i++) {
            orderBook[objectSide].map((obj, index) => {
                if (obj.order_id == orderBook[objectSide][i].order_id && i != index) {
                    console.log('Duped Order Detected!');
                    orderBook[objectSide].splice(index, 1);
                }
            });
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
//FIX REMAINING SIZE ISSUE + OTHER CHANGING VALUES NOT USED