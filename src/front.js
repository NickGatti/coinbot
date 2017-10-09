var pageData = {};

setInterval (() => {
    fetch('http://localhost:3000/api/', {method: 'GET' }).then(function(data) {
        return data.json();
    }).then(function(data){
        pageData = data;
        popData();
    }).catch(() => {
        //console.log('ERROR: ', err);
    });
}, 400);

var popData = (() => {

    //Place talk
    document.getElementById('placingBuy').innerHTML = pageData.outPutLoggingEtc.placeTalk.buy.placing ? document.getElementById('placingBuy').innerHTML = 'Placing' : document.getElementById('placingBuy').innerHTML = 'Not Placing';
    document.getElementById('placingPriceBuy').innerHTML = pageData.outPutLoggingEtc.placeTalk.buy.price ? pageData.outPutLoggingEtc.placeTalk.buy.price : document.getElementById('placingPriceBuy').innerHTML = 'N/A';
    document.getElementById('placingSizeBuy').innerHTML = pageData.outPutLoggingEtc.placeTalk.buy.size ? pageData.outPutLoggingEtc.placeTalk.buy.size : document.getElementById('placingSizeBuy').innerHTML = 'N/A';
    document.getElementById('placingSell').innerHTML = pageData.outPutLoggingEtc.placeTalk.sell.placing ? document.getElementById('placingSell').innerHTML = 'Placing' : document.getElementById('placingSell').innerHTML = 'Not Placing';
    document.getElementById('placingPriceSell').innerHTML = pageData.outPutLoggingEtc.placeTalk.sell.price ? pageData.outPutLoggingEtc.placeTalk.sell.price : document.getElementById('placingPriceSell').innerHTML = 'N/A';
    document.getElementById('placingSizeSell').innerHTML = pageData.outPutLoggingEtc.placeTalk.sell.size ? pageData.outPutLoggingEtc.placeTalk.sell.size : document.getElementById('placingSizeSell').innerHTML = 'N/A';
    //Place talk

    //GOOD info
    document.getElementById('totalSells').innerHTML = pageData.outPutLoggingGood.totalSells ? pageData.outPutLoggingGood.totalSells : document.getElementById('totalSells').innerHTML;
    document.getElementById('totalBuys').innerHTML = pageData.outPutLoggingGood.totalBuys ? pageData.outPutLoggingGood.totalBuys : document.getElementById('totalBuys').innerHTML;
    document.getElementById('realSells').innerHTML = pageData.outPutLoggingGood.realSells ? pageData.outPutLoggingGood.realSells : document.getElementById('realSells').innerHTML;
    document.getElementById('realBuys').innerHTML = pageData.outPutLoggingGood.realBuys ? pageData.outPutLoggingGood.realBuys : document.getElementById('realBuys').innerHTML;
    document.getElementById('realSellPercent').innerHTML = pageData.outPutLoggingGood.goodSellPercent ? pageData.outPutLoggingGood.goodSellPercent : document.getElementById('realSellPercent').innerHTML;
    document.getElementById('realBuyPercent').innerHTML = pageData.outPutLoggingGood.goodBuyPercent ? pageData.outPutLoggingGood.goodBuyPercent : document.getElementById('realBuyPercent').innerHTML;
    document.getElementById('realTotalPercent').innerHTML = pageData.outPutLoggingGood.totalBadPercent ? pageData.outPutLoggingGood.totalBadPercent : document.getElementById('realTotalPercent').innerHTML;
    //GOOD Info

    //ETC info
    document.getElementById('totalAmountMade').innerHTML = pageData.outPutLoggingEtc.totalAmountMade ? pageData.outPutLoggingEtc.totalAmountMade : document.getElementById('totalAmountMade').innerHTML;
    document.getElementById('amountMade').innerHTML = pageData.outPutLoggingEtc.amountMade ? pageData.outPutLoggingEtc.amountMade : document.getElementById('amountMade').innerHTML;
    document.getElementById('printSell').innerHTML = pageData.lowestSellPrice ? pageData.lowestSellPrice : document.getElementById('printSell').innerHTML;
    document.getElementById('printBuy').innerHTML = pageData.highestBuyPrice ? pageData.highestBuyPrice : document.getElementById('printBuy').innerHTML;
    document.getElementsByClassName('currentOrder')[0].innerHTML = pageData.myOrderIterator ? pageData.myOrderIterator : document.getElementsByClassName('currentOrder')[0].innerHTML;
    document.getElementsByClassName('currentOrder')[1].innerHTML = pageData.myOrderIterator ? pageData.myOrderIterator : document.getElementsByClassName('currentOrder')[1].innerHTML;
    //ETC Info

    //BUY ORDER
    //document.getElementById('talkAboutUpdatingBuy').innerHTML = pageData.outPutLoggingBuy.talkAboutUpdating ? pageData.outPutLoggingBuy.talkAboutUpdating : document.getElementById('talkAboutUpdatingBuy').innerHTML = 'Hasn\'t Changed Price Yet';
    document.getElementById('newPriceUpdateBuy').innerHTML = pageData.outPutLoggingBuy.newPriceUpdate ? pageData.outPutLoggingBuy.newPriceUpdate.toFixed(2) : document.getElementById('newPriceUpdateBuy').innerHTML.toFixed(2);
    document.getElementById('oldPriceUpdateBuy').innerHTML = pageData.outPutLoggingBuy.oldPriceUpdate ? pageData.outPutLoggingBuy.oldPriceUpdate.toFixed(2) : document.getElementById('oldPriceUpdateBuy').innerHTML.toFixed(2);
    document.getElementById('differenceBuy').innerHTML = pageData.outPutLoggingBuy.difference ? pageData.outPutLoggingBuy.difference.toFixed(2) : document.getElementById('differenceBuy').innerHTML.toFixed(2);
    document.getElementById('myBuyID').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.order_id ? pageData.outPutLoggingBuy.myBuyOrder.order_id : document.getElementById('myBuyID').innerHTML;
    document.getElementById('myBuyPrice').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.price ? pageData.outPutLoggingBuy.myBuyOrder.price.toFixed(2) : document.getElementById('myBuyPrice').innerHTML.toFixed(2);
    document.getElementById('myOldBuyPrice').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.oldPrice ? pageData.outPutLoggingBuy.myBuyOrder.oldPrice.toFixed(2) : document.getElementById('myOldBuyPrice').innerHTML.toFixed(2);
    document.getElementById('buyMargin').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.oldMargin ? pageData.outPutLoggingBuy.myBuyOrder.oldMargin.toFixed(4) : document.getElementById('buyMargin').innerHTML.toFixed(4);
    //BUY ORDER

    //SELL ORDER
    //document.getElementById('talkAboutUpdatingSell').innerHTML = pageData.outPutLoggingSell.talkAboutUpdating ? pageData.outPutLoggingSell.talkAboutUpdating : document.getElementById('talkAboutUpdatingSell').innerHTML;
    document.getElementById('newPriceUpdateSell').innerHTML = pageData.outPutLoggingSell.newPriceUpdate ? pageData.outPutLoggingSell.newPriceUpdate : document.getElementById('newPriceUpdateSell').innerHTML;
    document.getElementById('oldPriceUpdateSell').innerHTML = pageData.outPutLoggingSell.oldPriceUpdate ? pageData.outPutLoggingSell.oldPriceUpdate : document.getElementById('oldPriceUpdateSell').innerHTML;
    document.getElementById('differenceSell').innerHTML = pageData.outPutLoggingSell.difference ? pageData.outPutLoggingSell.difference : document.getElementById('differenceSell').innerHTML;
    document.getElementById('mySellID').innerHTML = pageData.outPutLoggingSell.mySellOrder.order_id ? pageData.outPutLoggingSell.mySellOrder.order_id : document.getElementById('mySellID').innerHTML;
    document.getElementById('mySellPrice').innerHTML = pageData.outPutLoggingSell.mySellOrder.price ? pageData.outPutLoggingSell.mySellOrder.price :   document.getElementById('mySellPrice').innerHTML;
    document.getElementById('myOldSellPrice').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldPrice ? pageData.outPutLoggingSell.mySellOrder.oldPrice :   document.getElementById('myOldSellPrice').innerHTML;
    document.getElementById('sellMargin').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldMargin ? pageData.outPutLoggingSell.mySellOrder.oldMargin : document.getElementById('sellMargin').innerHTML;
    //SELL ORDER
});
