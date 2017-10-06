fetch('http://localhost:3000/api/', {method: 'GET' }).then(function(data) {
    return data.json();
}).then(function(data){
    console.log(data) ;
    document.getElementById('printBuy').innerHTML = data.highestBuyPrice;
    document.getElementById('printSell').innerHTML = data.lowestSellPrice;
}).catch((err) => {
    console.log('ERROR: ', err);
});
