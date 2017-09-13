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
var restBook = {
    buys: {
        type: [],
        time: [],
        product_id: [],
        sequence: [],
        order_id: [],
        price: [],
        remaining_size: [],
        side: [],
        goodOrder: []
    },
    sells: {
        type: [],
        time: [],
        product_id: [],
        sequence: [],
        order_id: [],
        price: [],
        remaining_size: [],
        side: [],
        goodOrder: []
    }
};
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
    
    for (let i = 0; i < level3buysIndex.length; i++){
        //console.log(`Index[0]: ${level3buysIndex[0]} Index[1]: ${level3buysIndex[1]} Index[2] ${level3buysIndex[2]}`)
        restBook.buys.price[i] = level3buysIndex[i][0];
        restBook.buys.remaining_size[i] = level3buysIndex[i][1];
        restBook.buys.order_id[i] = level3buysIndex[i][2];
    }    
    for (let i = 0; i < level3sellsIndex.length; i++){
        //console.log(`Index[0]: ${levelsellsIndex[0]} Index[1]: ${level3sellsIndex[1]} Index[2] ${level3sellsIndex[2]}`)
        restBook.sells.price[i] = level3sellsIndex[i][0];
        restBook.sells.remaining_size[i] = level3sellsIndex[i][1];
        restBook.sells.order_id[i] = level3sellsIndex[i][2];
    }
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
        if (restBook.buys.order_id.includes(data.order_id)) {
            let buyIndex = restBook.buys.order_id.indexOf(data.order_id);
            if (data.type == 'done') {
                //console.log('Filled Buy Order!');
                restBook.buys.type[buyIndex] = (data.type);
            }
            if (data.type == 'change') {
                //console.log('Changed Buy Order!');
                restBook.buys.remaining_size[buyIndex] = (data.new_funds);
            }
        } else {
            if (data.type == 'open') {
                //console.log('New Open Buy Order!');
                restBook.buys.type.push(data.type);
                restBook.buys.time.push(data.time);
                restBook.buys.product_id.push(data.order_id);
                restBook.buys.sequence.push(data.type);
                restBook.buys.order_id.push(data.price);
                restBook.buys.price.push(data.size);
                restBook.buys.remaining_size.push(data.type);
                restBook.buys.side.push(data.side);
                restBook.buys.goodOrder.push(false);
            }
        }
    }
    //End of buy orders
    //Start of sell orders
    if (data.side == 'sell') {
        if (restBook.sells.order_id.includes(data.order_id)) {
            let sellIndex = restBook.sells.order_id.indexOf(data.order_id);
            if (data.type == 'done') {
                //console.log('Filled Sell Order!');
                restBook.sells.type[sellIndex] = (data.type);
            }
            if (data.type == 'change') {
                //console.log('Changed Sell Order!');
                restBook.sells.remaining_size[sellIndex] = (data.new_funds);
            }
        } else {
            if (data.type == 'open') {
                //console.log('New Open Sell Order!');
                restBook.sells.type.push(data.type);
                restBook.sells.time.push(data.time);
                restBook.sells.product_id.push(data.order_id);
                restBook.sells.sequence.push(data.type);
                restBook.sells.order_id.push(data.price);
                restBook.sells.price.push(data.size);
                restBook.sells.remaining_size.push(data.type);
                restBook.sells.side.push(data.side);
                restBook.sells.goodOrder.push(false);
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
    
    for (var i = 0; i < restBook.buys.price.length; i++){
        if (realityCriteria < (restBook.buys.remaining_size[i] * restBook.buys.price[i])) {
            restBook.buys.goodOrder[i] = true;
            goodBuyOrderCounter++;
        }
    }
    for (var i = 0; i < restBook.sells.price.length; i++){
        if (realityCriteria < (restBook.sells.remaining_size[i] * restBook.sells.price[i])) {
            restBook.sells.goodOrder[i] = true;
            goodSellOrderCounter++;
        }
    }
    var goodBuyPercent = Math.round(goodBuyOrderCounter / restBook.buys.price.length * 10000) / 100;
    var goodSellPercent = Math.round(goodSellOrderCounter / restBook.sells.price.length * 10000) / 100;
    var totalBadPercent = (100 - (goodBuyPercent + goodSellPercent));
    console.log('Market Order Benchmark:')
    console.log(`Realistic buy  orders: ${goodBuyOrderCounter} out of a total of ${restBook.buys.price.length} buy orders ||| ${goodBuyPercent}% good buy orders`);
    console.log(`Realistic sell orders: ${goodSellOrderCounter} out of a total of ${restBook.sells.price.length} sell orders ||| ${goodSellPercent}% good sell orders`);
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
}
//End>> Margin Checks of Real Orders
//=============================================
//Start>> Sort
function sort() {
    //CONCATONATE A LARGE INTEGER TO THE LAST PART OF THE SORTED ARRAY INDEX TO SAVE THE INDEX POSITION
    //PASRE OFF FIXED AMOUNT OF POSITIONS FOR INDEX AFTER
}