var Gdax = require('gdax');
var websocket = new Gdax.WebsocketClient(['ETH-USD']);

const jewCriteria = 8000;
var jewCount = 0;

var orderIndex = {
    buys: {
        price: [],
        id: []
    },
    sells: {
        price: [],
        id: []
    }
};

function getData() {

    websocket.on('message', function (data) {

        if (data.side == 'buy') {
            if (data.size * data.price > jewCriteria) {
                if (orderIndex.buys.id.includes(data.order_id)) {
                    console.log('Duped Buy Order - Skipping');
                } else {
                    orderIndex.buys.price.push(data.price);
                    orderIndex.buys.id.push(data.id);
                }
            } else {
                jewCount++;
            }
        }

        if (data.side == 'sell') {
            if (data.size * data.price > jewCriteria) {
                if (orderIndex.sells.id.includes(data.order_id)) {
                    console.log('Duped Sell Order - Skipping');
                } else {
                    orderIndex.buys.price.push(data.price);
                    orderIndex.buys.id.push(data.id);
                }
            } else {
                jewCount++;
            }
        }
        showData();
    });
};

getData();

function showData() {
    console.log(orderIndex.buys.id.length);
    /*
    for (var i = 0; i < orderIndex.buys.id.length; i++){
        console.log('Buy Order: ' + orderIndex.buys.price[i]);
    }
    console.log(orderIndex.buys.id.length)
    for (var z = 0; z < orderIndex.sells.id.length; z++){
        console.log('Sell Order: ' + orderIndex.sells.price[z]);
    }
    */
}
