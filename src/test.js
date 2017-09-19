var orderBook = {
    'Buys': [
            {
                order_id: '03FDA'
            },
            {
                order_id: 'AS331'
            },
            {
                order_id: 'AS331'
            },
            {
                order_id: 'R7D2D'
            },
            {
                order_id: 'GK8LMD'
            }
    ],
    'Sells': [
            {
                order_id: '03FDA'
            },
            {
                order_id: 'AS331'
            },
            {
                order_id: 'AS331'
            },
            {
                order_id: 'R7D2D'
            },
            {
                order_id: 'GK8LMD'
            }
        ]
}

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

