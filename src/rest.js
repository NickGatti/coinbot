var coinbase = require('coinbase');
var client   = new coinbase.Client({'apiKey': 'HpjL5zuQMxo2NAQY', 'apiSecret': 'wp5akKtCWBTiFuZdifHYOgcu4snhGreo'});

var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient('ETH-USD');

var badCriteria = 8000;
var badCount = 0;

var buyIndex = new Array();
var sellIndex = new Array();

publicClient.getProductOrderBook({'level': 2}, function(err, data) {
    var obj = JSON.parse(data.body);
    
    buyOrders(obj);
    sellOrders(obj);
    calcBuyMargin();
    calcSellMargin();
    
    console.log('Percent of bad Orders: ' + badCount + '% || ' + badCount + ' orders were fake out of 100 orders')
    
});


function buyOrders(data){
    // Start of Buy Orders
    for (var i = 0; i < data.bids.length; i++){
        var badBid = false;
        var price = 0;
        var amount = 0;
        var numberOfOrders = 0;
        for (var z = 0; z < data.bids[i][z].length; z++){
            var stringP = data.bids[i].toString();
            var lastComma = stringP.lastIndexOf(',');
            numberOfOrders = stringP.slice(lastComma + 1, stringP.length);
            switch (z) {
                case 0:
                    price = data.bids[i][z];
                    break;
                case 1:
                    amount = data.bids[i][z];
                    break;
                default:
                    price = 'Error';
                    amount = 'Error';
            }
            if (amount == 0) {
                var firstCommaA = stringP.indexOf(',');
                var lastCommaA = stringP.lastIndexOf(',');
                amount = stringP.slice(firstCommaA + 1 , lastCommaA);
            }
            var amountNext = amount * numberOfOrders;
            var totalAmount = amountNext * price;
            if (totalAmount < badCriteria) badBid = true;
        }
        //badBid ? console.log('badbid  - @Price: ' + price + ' || Number of Coins: ' + amount + ' || Total number of orders: ' + numberOfOrders) : console.log('RealBid - @Price: ' + price + ' || Number of coins: ' + amount + ' || Total number of orders: ' + numberOfOrders)
        if (!badBid) {
            //console.log('BuyOrder - @Price: ' + price + ' || Number of coins: ' + amount + ' || Total number of orders: ' + numberOfOrders);
            buyIndex.push(price)
        } else {
            badCount++;
        }
    }
    // End of Buy Orders
}

function sellOrders(data) {
    // Start of Sell Orders
    for (var i = 0; i < data.asks.length; i++){
        var badBid = false;
        var price = 0;
        var amount = 0;
        var numberOfOrders = 0;
        for (var z = 0; z < data.asks[i][z].length; z++){
            var stringP = data.asks[i].toString();
            var lastComma = stringP.lastIndexOf(',');
            numberOfOrders = stringP.slice(lastComma + 1, stringP.length);
            switch (z) {
                case 0:
                    price = data.asks[i][z];
                    break;
                case 1:
                    amount = data.asks[i][z];
                    break;
                default:
                    price = 'Error';
                    amount = 'Error';
            }
            if (amount == 0) {
                var firstCommaA = stringP.indexOf(',');
                var lastCommaA = stringP.lastIndexOf(',');
                amount = stringP.slice(firstCommaA + 1 , lastCommaA);
            }
            var amountNext = amount * numberOfOrders;
            var totalAmount = amountNext * price;
            if (totalAmount < badCriteria) badBid = true;
        }
        //badBid ? console.log('badbid  - @Price: ' + price + ' || Number of Coins: ' + amount + ' || Total number of orders: ' + numberOfOrders) : console.log('RealBid - @Price: ' + price + ' || Number of coins: ' + amount + ' || Total number of orders: ' + numberOfOrders)
        if (!badBid) {
            //console.log('Sell Order - @Price: ' + price + ' || Number of coins: ' + amount + ' || Total number of orders: ' + numberOfOrders)
            sellIndex.push(price);
        } else {
            badCount++;
        }
    }    
    // End of Sell Orders
}

function calcBuyMargin() {
    if (buyIndex.length < sellIndex.length) {
        var subIndex = buyIndex.length;
    } else {
        var subIndex = sellIndex.length;
    }
    for (var i = 0; i < subIndex; i++) {
        var margin = sellIndex[i] / buyIndex[0]
        if (margin < 1.04) {
            console.log('Placing buy order margin calculator: Buy: $' + buyIndex[0] + ' || Sell: $' + sellIndex[i] + '|| Margins: ' + margin + ' || Minimal margin requirement not met (<4%)')
        } else {
            console.log('Placing buy order margin calculator: Buy: $' + buyIndex[0] + ' || Sell: $' + sellIndex[i] + '|| Margins: ' + margin + ' || Minimal margin requirement met (>4%)')
        }
    }
}

function calcSellMargin() {
    if (buyIndex.length < sellIndex.length) {
        var subIndex = buyIndex.length;
    } else {
        var subIndex = sellIndex.length;
    }
    for (var i = 0; i < subIndex; i++) {
        var margin = sellIndex[0] / buyIndex[i]
        if (margin < 1.04) {
            console.log('Placing sell order margin calculator: Buy: $' + buyIndex[i] + ' || Sell: $' + sellIndex[0] + '|| Margins: ' + margin + ' || Minimal margin requirement not met (<4%)')
        } else {
            console.log('Placing sell order margin calculator: Buy: $' + buyIndex[i] + ' || Sell: $' + sellIndex[0] + '|| Margins: ' + margin + ' || Minimal margin requirement met (>4%)')
        }
    }
}