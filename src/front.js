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
    marketData();
    makePie();
}, 400);

var popData = (() => {

    //Place talk
    document.getElementById('placingBuy').innerHTML = pageData.buyState ? document.getElementById('placingBuy').innerHTML = pageData.buyState.charAt(0).toUpperCase() + pageData.buyState.slice(1) : document.getElementById('placingBuy').innerHTML = 'N/A';
    document.getElementById('placingPriceBuy').innerHTML = pageData.outPutLoggingEtc.placeTalk.buy.price ? '$' + pageData.outPutLoggingEtc.placeTalk.buy.price.toFixed(2) : document.getElementById('placingPriceBuy').innerHTML = 'N/A';
    document.getElementById('placingSizeBuy').innerHTML = pageData.outPutLoggingEtc.placeTalk.buy.size ? '#' + pageData.outPutLoggingEtc.placeTalk.buy.size : document.getElementById('placingSizeBuy').innerHTML = 'N/A';
    document.getElementById('placingSell').innerHTML = pageData.sellState ? pageData.sellState.charAt(0).toUpperCase() + pageData.sellState.slice(1) : document.getElementById('placingSell').innerHTML = 'N/A';
    document.getElementById('placingPriceSell').innerHTML = pageData.outPutLoggingEtc.placeTalk.sell.price ? '$' + pageData.outPutLoggingEtc.placeTalk.sell.price.toFixed(2) : document.getElementById('placingPriceSell').innerHTML = 'N/A';
    document.getElementById('placingSizeSell').innerHTML = pageData.outPutLoggingEtc.placeTalk.sell.size ? '#' + pageData.outPutLoggingEtc.placeTalk.sell.size : document.getElementById('placingSizeSell').innerHTML = 'N/A';
    //Place talk

    //GOOD info
    document.getElementById('totalSells').innerHTML = pageData.outPutLoggingGood.totalSells ? '#' + numberWithCommas(pageData.outPutLoggingGood.totalSells) : document.getElementById('totalSells').innerHTML;
    document.getElementById('totalBuys').innerHTML = pageData.outPutLoggingGood.totalBuys ? '#' + numberWithCommas(pageData.outPutLoggingGood.totalBuys) : document.getElementById('totalBuys').innerHTML;
    if (pageData.myOrderIterator % 2) document.querySelectorAll('.realSells')[0].innerHTML = pageData.outPutLoggingGood.realSells ? '#' + numberWithCommas(pageData.outPutLoggingGood.realSells) : document.getElementById('realSells').innerHTML;
    if (pageData.myOrderIterator % 2) document.querySelectorAll('.realBuys')[0].innerHTML = pageData.outPutLoggingGood.realBuys ? '#' + numberWithCommas(pageData.outPutLoggingGood.realBuys) : document.getElementById('realBuys').innerHTML;
    if (pageData.myOrderIterator % 2) document.querySelectorAll('.realSellPercent')[0].innerHTML = pageData.outPutLoggingGood.goodSellPercent ? pageData.outPutLoggingGood.goodSellPercent.toFixed(2) + '%' : document.getElementById('realSellPercent').innerHTML;
    if (pageData.myOrderIterator % 2) document.querySelectorAll('.realBuyPercent')[0].innerHTML = pageData.outPutLoggingGood.goodBuyPercent ? pageData.outPutLoggingGood.goodBuyPercent.toFixed(2) + '%' : document.getElementById('realBuyPercent').innerHTML;
    if (pageData.myOrderIterator % 2) document.querySelectorAll('.realTotalPercent')[0].innerHTML = pageData.outPutLoggingGood.totalBadPercent ? pageData.outPutLoggingGood.totalBadPercent.toFixed(2) + '%' : document.getElementById('realTotalPercent').innerHTML;
    if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.realSells')[1].innerHTML = pageData.outPutLoggingGood.realSells ? '#' + numberWithCommas(pageData.outPutLoggingGood.realSells) : document.getElementById('realSells').innerHTML;
    if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.realBuys')[1].innerHTML = pageData.outPutLoggingGood.realBuys ? '#' + numberWithCommas(pageData.outPutLoggingGood.realBuys) : document.getElementById('realBuys').innerHTML;
    if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.realSellPercent')[1].innerHTML = pageData.outPutLoggingGood.goodSellPercent ? pageData.outPutLoggingGood.goodSellPercent.toFixed(2) + '%' : document.getElementById('realSellPercent').innerHTML;
    if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.realBuyPercent')[1].innerHTML = pageData.outPutLoggingGood.goodBuyPercent ? pageData.outPutLoggingGood.goodBuyPercent.toFixed(2) + '%' : document.getElementById('realBuyPercent').innerHTML;
    if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.realTotalPercent')[1].innerHTML = pageData.outPutLoggingGood.totalBadPercent ? pageData.outPutLoggingGood.totalBadPercent.toFixed(2) + '%' : document.getElementById('realTotalPercent').innerHTML;
    //GOOD Info

    //ETC info
    document.getElementById('totalAmountMade').innerHTML = pageData.outPutLoggingEtc.totalAmountMade ? '$' + pageData.outPutLoggingEtc.totalAmountMade.toFixed(2) : document.getElementById('totalAmountMade').innerHTML = 'N/A';
    document.getElementById('amountMade').innerHTML = pageData.outPutLoggingEtc.amountMade ? '$' + pageData.outPutLoggingEtc.amountMade.toFixed(2) : document.getElementById('amountMade').innerHTML = 'N/A';
    document.getElementById('printSell').innerHTML = pageData.lowestSellPrice ? '$' + pageData.lowestSellPrice.toFixed(2) : document.getElementById('printSell').innerHTML = 'N/A';
    document.getElementById('printBuy').innerHTML = pageData.highestBuyPrice ? '$' + pageData.highestBuyPrice.toFixed(2) : document.getElementById('printBuy').innerHTML = 'N/A';
    document.getElementsByClassName('currentOrder')[0].innerHTML = pageData.myOrderIterator != undefined ? pageData.myOrderIterator + 1 : document.getElementsByClassName('currentOrder')[0].innerHTML = 'Restarting...';
    //ETC Info

    //BUY ORDER
    //document.getElementById('talkAboutUpdatingBuy').innerHTML = pageData.outPutLoggingBuy.talkAboutUpdating ? pageData.outPutLoggingBuy.talkAboutUpdating : document.getElementById('talkAboutUpdatingBuy').innerHTML = 'Hasn\'t Changed Price Yet';
    document.getElementById('newPriceUpdateBuy').innerHTML = pageData.outPutLoggingBuy.difference ? '$' + pageData.outPutLoggingBuy.newPriceUpdate.toFixed(2) : document.getElementById('newPriceUpdateBuy').innerHTML = 'No new update';
    document.getElementById('oldPriceUpdateBuy').innerHTML = pageData.outPutLoggingBuy.difference ? '$' + pageData.outPutLoggingBuy.oldPriceUpdate.toFixed(2) : document.getElementById('oldPriceUpdateBuy').innerHTML = 'N/A';
    document.getElementById('differenceBuy').innerHTML = pageData.outPutLoggingBuy.difference ? '$' + pageData.outPutLoggingBuy.difference.toFixed(2) : document.getElementById('differenceBuy').innerHTML = 'N/A';
    if (pageData.outPutLoggingBuy.myBuyOrder) {
        document.getElementById('myBuyID').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.order_id ? pageData.outPutLoggingBuy.myBuyOrder.order_id : document.getElementById('myBuyID').innerHTML = 'N/A';
        document.getElementById('myBuyPrice').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.price ? '$' + pageData.outPutLoggingBuy.myBuyOrder.price.toFixed(2) : document.getElementById('myBuyPrice').innerHTML = 'N/A';
        document.getElementById('myOldBuyPrice').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.oldPrice ? '$' + pageData.outPutLoggingBuy.myBuyOrder.oldPrice.toFixed(2) : document.getElementById('myOldBuyPrice').innerHTML = 'N/A';
        document.getElementById('buyMargin').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.oldMargin ? pageData.outPutLoggingBuy.myBuyOrder.oldMargin.toFixed(4) + '%' : document.getElementById('buyMargin').innerHTML = 'N/A';
        document.getElementById('orderGapBuy').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.oldOrdersToGo ? '#' + pageData.outPutLoggingBuy.myBuyOrder.oldOrdersToGo : document.getElementById('orderGapBuy').innerHTML = 'N/A';
        document.getElementById('dollarGapBuy').innerHTML = pageData.outPutLoggingBuy.myBuyOrder.oldAmountToGo ? '$' + numberWithCommas(pageData.outPutLoggingBuy.myBuyOrder.oldAmountToGo.toFixed(2)) : document.getElementById('dollarGapBuy').innerHTML = 'N/A';
        document.getElementById('buyTotal').innerHTML = 20 * pageData.outPutLoggingBuy.myBuyOrder.price ? '$' + numberWithCommas( (20 * pageData.outPutLoggingBuy.myBuyOrder.price).toFixed(2) ) : document.getElementById('buyTotal').innerHTML = 'N/A';
    } else {
        document.getElementById('myBuyID').innerHTML = 'N/A';
        document.getElementById('myBuyPrice').innerHTML = 'N/A';
        document.getElementById('myOldBuyPrice').innerHTML = 'N/A';
        document.getElementById('buyMargin').innerHTML = 'N/A';
        document.getElementById('orderGapBuy').innerHTML = 'N/A';
        document.getElementById('dollarGapBuy').innerHTML = 'N/A';
        document.getElementById('buyTotal').innerHTML = 'N/A';
    }
    //BUY ORDER

    //SELL ORDER
    if (pageData.outPutLoggingSell.mySellOrder) {
        document.getElementById('mySellID').innerHTML = pageData.outPutLoggingSell.mySellOrder.order_id ? pageData.outPutLoggingSell.mySellOrder.order_id : document.getElementById('mySellID').innerHTML = 'N/A';
        document.getElementById('mySellPrice').innerHTML = pageData.outPutLoggingSell.mySellOrder.price ? '$' + pageData.outPutLoggingSell.mySellOrder.price.toFixed(2) : document.getElementById('mySellPrice').innerHTML = 'N/A';
        document.getElementById('myOldSellPrice').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldPrice ? '$' + pageData.outPutLoggingSell.mySellOrder.oldPrice.toFixed(2) : document.getElementById('myOldSellPrice').innerHTML = 'N/A';
        document.getElementById('sellMargin').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldMargin ? pageData.outPutLoggingSell.mySellOrder.oldMargin.toFixed(4) + '%' : document.getElementById('sellMargin').innerHTML = 'N/A';
        document.getElementById('orderGapSell').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldOrdersToGo ? '#' + pageData.outPutLoggingSell.mySellOrder.oldOrdersToGo : document.getElementById('orderGapSell').innerHTML = 'N/A';
        document.getElementById('dollarGapSell').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldAmountToGo ? '$' + numberWithCommas(pageData.outPutLoggingSell.mySellOrder.oldAmountToGo.toFixed(2)) : document.getElementById('dollarGapSell').innerHTML = 'N/A';
        document.getElementById('sellTotal').innerHTML = 20 * pageData.outPutLoggingSell.mySellOrder.price ? '$' + numberWithCommas( (20 * pageData.outPutLoggingSell.mySellOrder.price).toFixed(2) ) : document.getElementById('sellTotal').innerHTML = 'N/A';
    } else {
        document.getElementById('mySellID').innerHTML = 'N/A';
        document.getElementById('mySellPrice').innerHTML = 'N/A';
        document.getElementById('myOldSellPrice').innerHTML = 'N/A';
        document.getElementById('sellMargin').innerHTML = 'N/A';
        document.getElementById('orderGapSell').innerHTML = 'N/A';
        document.getElementById('dollarGapSell').innerHTML = 'N/A';
        document.getElementById('sellTotal').innerHTML = 'N/A';
    }
    //SELL ORDER
});

//START>> Number with commas
//=============================================
//=============================================
//=============================================
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
//=============================================
//=============================================
//=============================================
//END>> Number with Commas
//=============================================
//=============================================
//=============================================
function marketData() {
    if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerBuy')[0].style.width = pageData.outPutLoggingGood.goodBuyPercent + '%';
    if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerSell')[0].style.width = pageData.outPutLoggingGood.goodSellPercent + '%';
    if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerRest')[0].style.width = pageData.outPutLoggingGood.totalBadPercent + '%';
    if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.innerBuy')[1].style.width = pageData.outPutLoggingGood.goodBuyPercent + '%';
    if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.innerSell')[1].style.width = pageData.outPutLoggingGood.goodSellPercent + '%';
    if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.innerRest')[1].style.width = pageData.outPutLoggingGood.totalBadPercent + '%';
}

function makePie() {
  if (pageData.myOrderIterator % 2) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart1);
  } else {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart2);
  }

  function drawChart1() {
    let firstBuyPercent = pageData.outPutLoggingGood.goodBuyPercent;
    let firstSellPercent = pageData.outPutLoggingGood.goodSellPercent;
    let firstTotalBadPercent = pageData.outPutLoggingGood.totalBadPercent;
    var data = google.visualization.arrayToDataTable([
      ['Task', 'Orders valued over 400 USD'],
      ['Good Buys',     firstBuyPercent],
      ['Good Sells',      firstSellPercent],
      ['Ignored orders',  firstTotalBadPercent]
    ]);

    var options = {
      title: 'Orders valued over 400 USD'
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart1'));

    chart.draw(data, options);
  }

  function drawChart2() {
    let secondBuyPercent = pageData.outPutLoggingGood.goodBuyPercent;
    let secondSellPercent = pageData.outPutLoggingGood.goodSellPercent;
    let secondTotalBadPercent = pageData.outPutLoggingGood.totalBadPercent;
    var data = google.visualization.arrayToDataTable([
      ['Task', 'Orders valued over 6000 USD'],
      ['Good Buys',     secondBuyPercent],
      ['Good Sells',      secondSellPercent],
      ['Ignored orders',  secondTotalBadPercent]
    ]);

    var options = {
      title: 'Orders valued over 6000 USD'
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart2'));

    chart.draw(data, options);
  }
}
