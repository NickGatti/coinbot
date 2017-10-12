var google = '';
var pageData = {};

loadScript('https://www.gstatic.com/charts/loader.js', (() => {
  return;
}));

setInterval(() => {
  fetch('https://multicoinbot-nickgatti.c9users.io/api', {
    method: 'GET'
  }).then(function(data) {
    return data.json();
  }).then(function(data) {
    pageData = data;
    popOrderPlacementData();
    pageData.myOrderIterator % 2 ? popLowCriteraMarketData() : popHighCriteriaMarketData();
    popOtherMarketData();
    popData();
    marketData();
    makePie();
  }).catch(() => {
    //console.log('ERROR: ', err);
  });
}, 400);

var docBuyStateID  = document.getElementById('placingBuy');
var docBuyPriceID  = document.getElementById('placingPriceBuy');
var docBuySizeID   = document.getElementById('placingSizeBuy');
var docSellStateID = document.getElementById('placingSell');
var docSellPriceID = document.getElementById('placingPriceSell');
var docSellSizeID  = document.getElementById('placingSizeSell');

var popOrderPlacementData = (() => {
  docBuyStateID.innerHTML      = pageData.buyState
    ? docBuyStateID.innerHTML  = pageData.buyState.charAt(0).toUpperCase() + pageData.buyState.slice(1)
    : docBuyStateID.innerHTML  = 'N/A';

  docBuyPriceID.innerHTML      = pageData.outPutLoggingEtc.placeTalk.buy.price
    ? '$' + pageData.outPutLoggingEtc.placeTalk.buy.price.toFixed(2)
    : docBuyPriceID.innerHTML  = 'Not placing';

  docBuySizeID.innerHTML       = pageData.outPutLoggingEtc.placeTalk.buy.size
    ? '#' + pageData.outPutLoggingEtc.placeTalk.buy.size
    : docBuySizeID.innerHTML   = 'Not placing';

  docSellStateID.innerHTML     = pageData.sellState
    ? pageData.sellState.charAt(0).toUpperCase() + pageData.sellState.slice(1)
    : docSellStateID.innerHTML = 'N/A';

  docSellPriceID.innerHTML     = pageData.outPutLoggingEtc.placeTalk.sell.price
    ? '$' + pageData.outPutLoggingEtc.placeTalk.sell.price.toFixed(2)
    : docSellPriceID.innerHTML = 'Not placing';

  docSellSizeID.innerHTML      = pageData.outPutLoggingEtc.placeTalk.sell.size
    ? '#' + pageData.outPutLoggingEtc.placeTalk.sell.size
    : docSellSizeID.innerHTML  = 'Not placing';

});

var docRealSells        = document.querySelectorAll('.realSells');
var docRealBuys         = document.querySelectorAll('.realBuys');
var docRealSellPercent  = document.querySelectorAll('.realSellPercent');
var docRealBuyPercent   = document.querySelectorAll('.realBuyPercent');
var docRealTotalPercent = document.querySelectorAll('.realTotalPercent');
var docTotalSells       = document.getElementById('totalSells');
var docTotalBuys        = document.getElementById('totalBuys');

var popLowCriteraMarketData = (() => {
  docRealSells[0].innerHTML        = pageData.outPutLoggingGood.realSells
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.realSells)
    : 'Error loading Data';
  docRealBuys[0].innerHTML = pageData.outPutLoggingGood.realBuys
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.realBuys)
    : 'Error loading Data';
  docRealSellPercent[0].innerHTML  = pageData.outPutLoggingGood.goodSellPercent
    ? pageData.outPutLoggingGood.goodSellPercent.toFixed(2) + '%'
    : 'Error loading Data';
  docRealBuyPercent[0].innerHTML   = pageData.outPutLoggingGood.goodBuyPercent
    ? pageData.outPutLoggingGood.goodBuyPercent.toFixed(2) + '%'
    : 'Error loading Data';
  docRealTotalPercent[0].innerHTML = pageData.outPutLoggingGood.totalBadPercent
    ? pageData.outPutLoggingGood.totalBadPercent.toFixed(2) + '%'
    : 'Error loading Data';
});

var popHighCriteriaMarketData = (() => {
  docRealSells[1].innerHTML        = pageData.outPutLoggingGood.realSells
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.realSells)
    : 'Error loading Data';

  docRealBuys[1].innerHTML         = pageData.outPutLoggingGood.realBuys
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.realBuys)
    : 'Error loading Data';

  docRealSellPercent[1].innerHTML  = pageData.outPutLoggingGood.goodSellPercent
    ? pageData.outPutLoggingGood.goodSellPercent.toFixed(2) + '%'
    : 'Error loading Data';

  docRealBuyPercent[1].innerHTML   = pageData.outPutLoggingGood.goodBuyPercent
    ? pageData.outPutLoggingGood.goodBuyPercent.toFixed(2) + '%'
    : 'Error loading Data';

  docRealTotalPercent[1].innerHTML = pageData.outPutLoggingGood.totalBadPercent
    ? pageData.outPutLoggingGood.totalBadPercent.toFixed(2) + '%'
    : 'Error loading Data';
});

var popOtherMarketData = (() => {
  docTotalBuys.innerHTML  = pageData.outPutLoggingGood.totalSells
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.totalSells)
    : 'Error loading Data';
    
  docTotalSells.innerHTML = pageData.outPutLoggingGood.totalBuys
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.totalBuys)
    : 'Error loading Data';
});

var popData = (() => {

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
    document.getElementById('buyTotal').innerHTML = 20 * pageData.outPutLoggingBuy.myBuyOrder.price ? '$' + numberWithCommas((20 * pageData.outPutLoggingBuy.myBuyOrder.price).toFixed(2)) : document.getElementById('buyTotal').innerHTML = 'N/A';
  } else {
    document.getElementById('myBuyID').innerHTML = 'No existing order';
    document.getElementById('myBuyPrice').innerHTML = 'No existing order';
    document.getElementById('myOldBuyPrice').innerHTML = 'No existing order';
    document.getElementById('buyMargin').innerHTML = 'No existing order';
    document.getElementById('orderGapBuy').innerHTML = 'No existing order';
    document.getElementById('dollarGapBuy').innerHTML = 'No existing order';
    document.getElementById('buyTotal').innerHTML = 'No existing order';
  }
  //BUY ORDER

  //SELL ORDER
  if (pageData.outPutLoggingSell.mySellOrder) {
    document.getElementById('mySellID').innerHTML = pageData.outPutLoggingSell.mySellOrder.order_id ? pageData.outPutLoggingSell.mySellOrder.order_id : document.getElementById('mySellID').innerHTML = 'No existing order';
    document.getElementById('mySellPrice').innerHTML = pageData.outPutLoggingSell.mySellOrder.price ? '$' + pageData.outPutLoggingSell.mySellOrder.price.toFixed(2) : document.getElementById('mySellPrice').innerHTML = 'N/A';
    document.getElementById('myOldSellPrice').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldPrice ? '$' + pageData.outPutLoggingSell.mySellOrder.oldPrice.toFixed(2) : document.getElementById('myOldSellPrice').innerHTML = 'N/A';
    document.getElementById('sellMargin').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldMargin ? pageData.outPutLoggingSell.mySellOrder.oldMargin.toFixed(4) + '%' : document.getElementById('sellMargin').innerHTML = 'N/A';
    document.getElementById('orderGapSell').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldOrdersToGo ? '#' + pageData.outPutLoggingSell.mySellOrder.oldOrdersToGo : document.getElementById('orderGapSell').innerHTML = 'N/A';
    document.getElementById('dollarGapSell').innerHTML = pageData.outPutLoggingSell.mySellOrder.oldAmountToGo ? '$' + numberWithCommas(pageData.outPutLoggingSell.mySellOrder.oldAmountToGo.toFixed(2)) : document.getElementById('dollarGapSell').innerHTML = 'N/A';
    document.getElementById('sellTotal').innerHTML = 20 * pageData.outPutLoggingSell.mySellOrder.price ? '$' + numberWithCommas((20 * pageData.outPutLoggingSell.mySellOrder.price).toFixed(2)) : document.getElementById('sellTotal').innerHTML = 'N/A';
  } else {
    document.getElementById('mySellID').innerHTML = 'No existing order';
    document.getElementById('mySellPrice').innerHTML = 'No existing order';
    document.getElementById('myOldSellPrice').innerHTML = 'No existing order';
    document.getElementById('sellMargin').innerHTML = 'No existing order';
    document.getElementById('orderGapSell').innerHTML = 'No existing order';
    document.getElementById('dollarGapSell').innerHTML = 'No existing order';
    document.getElementById('sellTotal').innerHTML = 'No existing order';
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
    google.charts.load('current', {
      'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(drawChart1);
  } else {
    google.charts.load('current', {
      'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(drawChart2);
  }

  function drawChart1() {
    let firstBuyPercent = pageData.outPutLoggingGood.goodBuyPercent;
    let firstSellPercent = pageData.outPutLoggingGood.goodSellPercent;
    let firstTotalBadPercent = pageData.outPutLoggingGood.totalBadPercent;
    var data = google.visualization.arrayToDataTable([
      ['Task', 'Orders valued over 400 USD'],
      ['Good Buys', firstBuyPercent],
      ['Good Sells', firstSellPercent],
      ['Ignored orders', firstTotalBadPercent]
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
      ['Good Buys', secondBuyPercent],
      ['Good Sells', secondSellPercent],
      ['Ignored orders', secondTotalBadPercent]
    ]);

    var options = {
      title: 'Orders valued over 6000 USD'
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart2'));

    chart.draw(data, options);
  }
}

function loadScript(url, callback) {

  var script = document.createElement('script');
  script.type = 'text/javascript';

  if (script.readyState) { //IE
    script.onreadystatechange = function() {
      if (script.readyState == 'loaded' ||
        script.readyState == 'complete') {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else { //Others
    script.onload = function() {
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
