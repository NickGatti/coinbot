const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient('ETH-USD');

var totalOrders = new Array();

getOrderBook(2);

function getOrderBook(level) {
    publicClient.getProductOrderBook({'level': level}, function(err, data) {
        var obj = JSON.parse(data.body);
        totalOrders = [obj.bids.length, obj.asks.length, (obj.bids.length + obj.asks.length)];
    }); 
}

