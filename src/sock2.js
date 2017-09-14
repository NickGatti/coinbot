//=============================================
const Gdax = require('gdax');
const util = require('util');
const publicClient = new Gdax.PublicClient('ETH-USD');
const websocket = new Gdax.WebsocketClient(['ETH-USD']);
const getProductOrderBook = util.promisify(publicClient.getProductOrderBook.bind(publicClient));
//=============================================
//==============REALITY CRITERIA===============
var realityCriteria = 10000;
var realMargin = 1.04;
//==============REALITY CRITERIA===============
//=============================================
var restBuys = [];
var restSells = [];
//=============================================
//START>> GDAX Module REST API OrderBook Fetch
function getOrderBook(level) {
    return getProductOrderBook({'level': level}).then(function(data) {
        var obj = JSON.parse(data.body);
        return [obj.bids.length, obj.asks.length, (obj.bids.length + obj.asks.length), obj];
    }); 
}
//END>> GDAX Module REST API OrderBook Fetch
//=============================================
//START>> Call GDAX function for ASYNC variable
getOrderBook(3).then(function(value) {
    
    //console.log(`Total buys: ${value[0]} Total sells: ${value[1]} Total: ${value[2]}`);
    let level3buysIndex = value[3].bids;
    let level3sellsIndex = value[3].asks;
    
    level3buysIndex.map((iter, i) => {
        //console.log(`Index[0]: ${level3buysIndex[0]} Index[1]: ${level3buysIndex[1]} Index[2] ${level3buysIndex[2]}`)
        restBuys[i] = {
            price: iter[i][0],
            size: iter[i][1],
            order_id: iter[i][2]
        }
    });
    
    level3sellsIndex.map((iter, i) => {
        //console.log(`Index[0]: ${level3sellsIndex[0]} Index[1]: ${level3sellsIndex[1]} Index[2] ${level3sellsIndex[2]}`)
        restSells[i] = {
            price: iter[i][0],
            size: iter[i][1],
            order_id: iter[i][2]
        }
    });
    
    getWebSocketData();
    var realityCheckInterval = setInterval(findRealisticOrders, 2000);
    //var marginCheckInterval = setInterval(checkMargins, 4000);
    
}).catch(function (err) {
    console.log(err);
});
//END>> Call GDAX function for ASYNC variable
//=============================================
//START>> Websocket Change Detections
function getWebSocketData() { 
    
    websocket.on('message', function(data) { 
    
    //if (data.type == 'match') data.size == 'sell' ? console.log('Up tick!') : console.log('Down tick!')
    //Start of buy orders
    if (data.side == 'buy') {
        if (restBuys.map((obj) => { 
            return (obj.order_id.includes(data.order_id));
        })) {
            let buyIndex = restBuys.map((obj, index) => {
                if (obj.order_id == data.order_id) return index
            });
            if (data.type == 'done') {
                restBuys[buyIndex].type = (data.type);
            }
            if (data.type == 'change') {
                data.new_size ? restBuys[buyIndex].size = (data.new_size) : restBuys[buyIndex].size = (data.new_funds);
            }
        } else {
            if (data.type == 'open') {
                restBuys.push({
                    type: data.type,
                    time: data.time,
                    product_id: data.product_id,
                    sequence: data.sequence,
                    order_id: data.order_id,
                    size: data.size,
                    side: data.size,
                    order_type: data.order_type
            });
            }
        }
    }
    //End of buy orders    
    
    
/*
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
        

    //Start of sell orders
    if (data.side == 'sell') {
        if (restSells.map((obj) => { 
            return (obj.order_id.includes(data.order_id));
        })) {
            let sellIndex = restSells.map((obj, index) => {
                if (obj.order_id == data.order_id) return index
            });
            if (data.type == 'done') {
                restSells[sellIndex].type = (data.type);
            }
            if (data.type == 'change') {
                data.new_size ? restSells[sellIndex].size = (data.new_size) : restSells[sellIndex].size = (data.new_funds);
            }
        } else {
            if (data.type == 'open') {
                restSells.push({
                    type: data.type,
                    time: data.time,
                    product_id: data.product_id,
                    sequence: data.sequence,
                    order_id: data.order_id,
                    size: data.size,
                    side: data.size,
                    order_type: data.order_type
            });
            }
        }
    }
    //End of sell orders
})}
//END>> Websocket Change Detections
//=============================================
//START>> Market Order Reality Checks
function findRealisticOrders() {

    var goodBuyOrderCounter = 0;
    var goodSellOrderCounter = 0;
    
    restBuys.map((obj, index) => {
        if ((obj.price * obj.size) > realityCriteria) {
            restBuys[index].goodOrder = true;
            goodBuyOrderCounter++;
        }
    })
    
    restSells.map((obj, index) => {
        if ((obj.price * obj.size) > realityCriteria) {
            restSells[index].goodOrder = true;
            goodSellOrderCounter++;
        }
    })

    var goodBuyPercent = (goodBuyOrderCounter / restBuys.length).toFixed(2);
    var goodSellPercent = (goodSellOrderCounter / restSells.length).toFixed(2);
    var totalBadPercent = (100 - (goodBuyPercent + goodSellPercent));
    console.log('Market Order Benchmark:')
    console.log(`Realistic buy  orders: ${goodBuyOrderCounter} out of a total of ${restBuys.price.length} buy orders ||| ${goodBuyPercent}% good buy orders`);
    console.log(`Realistic sell orders: ${goodSellOrderCounter} out of a total of ${restSells.price.length} sell orders ||| ${goodSellPercent}% good sell orders`);
    console.log(`${totalBadPercent}% Total market orders do not meet criteria requirement`);
    console.log('=====================================================================================================');
    checkMargins();
}
//End>> Market Order Reality Checks
//=============================================
//Start>> Margin Checks of Real Orders
function checkMargins(){
    
    var foundWorkingMargin = false;
    var margin = 0;
    var buyAmountInBetween = 0;
    var sellAmountInBetween = 0;
    var buyCount = 0;
    var sellCount = 0;
    
    
    /*
    for (var i = 0; (i < restBook.buys.price.length && !foundWorkingMargin); i++){
        buyCount++;
        if (restBook.buys.goodOrder[i]) {
            for (var z = 0; (z < restBook.sells.price.length && !foundWorkingMargin); z++){
                sellCount++;
                //restBook.sells.goodOrder[z] ? console.log(`${(restBook.sells.price[z] / restBook.buys.price[i])} has to be more than 4.02%`) : 0;
                if ((restBook.sells.goodOrder[z]) && ((restBook.sells.price[z] / restBook.buys.price[i]) > realMargin)) {
                    var totalCount = buyCount + sellCount;
                    var totalAmountInBetween = 0;
                    margin = (restBook.sells.price[z] / restBook.buys.price[i]);
                    for (var x = 0; x < buyCount; x++) {
                        buyAmountInBetween =+ (restBook.buys.price[x] * restBook.buys.remaining_size[x]);
                    }
                    for (var x = 0; x < sellCount; x++) {
                        sellAmountInBetween =+ (restBook.sells.price[x] * restBook.sells.remaining_size[x]);
                    }
                    totalAmountInBetween = buyAmountInBetween + sellAmountInBetween;
                    console.log('Margin Data:');
                    console.log('UNSORTED ORDERS IGNORE AS REAL DATA -- SORT FUNCTION ADDED SOON');
                    console.log(`Found good margin (${margin}%) || These matched real orders have ${totalCount} fake orders filling their gap`);
                    console.log(`$${Math.round(buyAmountInBetween * 100) / 100} amount of USD needs to fill for the fake order *buy* gap`);
                    console.log(`$${Math.round(sellAmountInBetween * 100) / 100} amount of USD needs to fill for the fake order *sell* gap`);
                    console.log(`$${Math.round(totalAmountInBetween * 100) / 100} *total* amount of USD needs to fill for the fake order gap`);
                    console.log('=====================================================================================================');
                    foundWorkingMargin = true;
                }
            }
        }
    }
    */
}
//End>> Margin Checks of Real Orders
//=============================================
//Start>> Sort
function sort() {
    //CONCATONATE A LARGE INTEGER TO THE LAST PART OF THE SORTED ARRAY INDEX TO SAVE THE INDEX POSITION
    //PASRE OFF FIXED AMOUNT OF POSITIONS FOR INDEX AFTER
}