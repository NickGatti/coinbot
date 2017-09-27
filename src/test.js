var orderBook = {
    'buy': [
            {
                order_id: '03FDA',
                goodOrder: false,
                price: 200,
                amount: 1
            },
            {
                order_id: 'AS331',
                goodOrder: true,
                price: 210,
                amount: 50
            },
            {
                order_id: 'AS331',
                goodOrder: true,
                price: 200,
                amount: 50
            },
            {
                order_id: 'R7D2D',
                goodOrder: true,
                price: 220,
                amount: 50
            },
            {
                order_id: 'GK8LMD',
                goodOrder: false,
                price: 200,
                amount: 1
            }
    ],
    'sell': [
            {
                order_id: '03FDA',
                goodOrder: false,
                price: 300,
                amount: 1
            },
            {
                order_id: 'AS331',
                goodOrder: true,
                price: 280,
                amount: 50
            },
            {
                order_id: 'AS331',
                goodOrder: true,
                price: 300,
                amount: 50
            },
            {
                order_id: 'R7D2D',
                goodOrder: true,
                price: 290,
                amount: 50
            },
            {
                order_id: 'GK8LMD',
                goodOrder: false,
                price: 300,
                amount: 1
            }
        ]
}

/*
let objSwitch = 'Buys'

for (let x = 0; x < 2; x++) {
    if (x) objSwitch = 'Sells'
    for (let i = 0; i < orderBook[objSwitch].length; i++) {
        for(let z = i+1; z < orderBook[objSwitch].length; z++) {
            if (orderBook[objSwitch][i].order_id == orderBook[objSwitch][z].order_id) orderBook[objSwitch].splice(z, 1);
        }
    }
    console.log(orderBook[objSwitch])
}
*/
orderBook['buy']
.sort((a, b) => {
    return b.price - a.price;
});
orderBook['sell']
.sort((a, b) => {
    return a.price - b.price;
});

let buyOrder = orderBook['buy'].find((data) => {
    if (data.goodOrder == true) return data;
});
let sellOrder = orderBook['sell'].find((data) => {
    if (data.goodOrder == true) return data;
});

console.log('Highest buy order price:',buyOrder)
console.log('Lowest sell order price:',sellOrder)