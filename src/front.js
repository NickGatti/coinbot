var pageData = {};

setInterval (() => {
    fetch('http://localhost:3000/api/', {method: 'GET' }).then(function(data) {
        return data.json();
    }).then(function(data){
        pageData = data;
        popData();
    }).catch((err) => {
        console.log('ERROR: ', err);
    });
}, 400);

var popData = (() => {
    document.getElementById('printSell').innerHTML = pageData.lowestSellPrice;
    document.getElementById('printBuy').innerHTML = pageData.highestBuyPrice;
    document.getElementById('totalSells').innerHTML = pageData.outPutLoggingGood.totalSells;
    document.getElementById('totalBuys').innerHTML = pageData.outPutLoggingGood.totalBuys;
    document.getElementById('realSells').innerHTML = pageData.outPutLoggingGood.realSells;
    document.getElementById('realBuys').innerHTML = pageData.outPutLoggingGood.realBuys;
    document.getElementById('realSellPercent').innerHTML = pageData.outPutLoggingGood.goodSellPercent;
    document.getElementById('realBuyPercent').innerHTML = pageData.outPutLoggingGood.goodBuyPercent;
    document.getElementById('realTotalPercent').innerHTML = pageData.outPutLoggingGood.totalBadPercent;
});
