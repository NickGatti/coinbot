var google = '';
var pageData = {};
var oReq = new XMLHttpRequest();
var myAPIurl = 'http://localhost:3000/api';

loadScript('https://www.gstatic.com/charts/loader.js', (() => {
  return;
}));

setInterval(() => {
  fetch(myAPIurl, {
    method: 'GET'
  }).then(function(data) {
    return data.json();
  }).then(function(data) {
    //console.log('Yes')
    pageData = data;
    activate();
  }).catch(() => {
    //console.log('No')
    oReq.addEventListener('load', reqListener);
    oReq.open('GET', myAPIurl);
    oReq.send();
    activate();
  });
}, 400);

var reqListener = (() => {
  pageData = JSON.parse(this.responseText);
  oReq.removeEventListener('load', reqListener);
});

var activate = (() => {
  popOrderPlacementData();
  pageData.myOrderIterator % 2 ? popLowCriteraMarketData() : popHighCriteriaMarketData();
  popOtherMarketData();
  popEtcInfo();
  popBuyData();
  popSellData();
  marketData();
  makePie();
});

//=============================================
//=============================================
//=============================================
//NEW ORDER DATA
//=============================================
//=============================================
//=============================================
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
//=============================================
//=============================================
//=============================================
//NEW ORDER DATA
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//CRITERIA DATA
//=============================================
//=============================================
//=============================================
var docRealSells        = document.querySelectorAll('.realSells');
var docRealBuys         = document.querySelectorAll('.realBuys');
var docRealSellPercent  = document.querySelectorAll('.realSellPercent');
var docRealBuyPercent   = document.querySelectorAll('.realBuyPercent');
var docRealTotalPercent = document.querySelectorAll('.realTotalPercent');
var docTotalSells       = document.getElementById('totalSells');
var docTotalBuys        = document.getElementById('totalBuys');
//=============================================
//=============================================
//=============================================
//CRITERIA DATA
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//LOW CRITERIA DATA
//=============================================
//=============================================
//=============================================
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
//=============================================
//=============================================
//=============================================
//LOW CRITERIA DATA
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//HIGH CRITERIA DATA
//=============================================
//=============================================
//=============================================
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
//=============================================
//=============================================
//=============================================
//HIGH CRITERIA DATA
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//ETC INFO
//=============================================
//=============================================
//=============================================
let docTotalAmountMade = document.getElementById('totalAmountMade');
let docOrderAmountMade = document.getElementById('amountMade');
let docLowestSellPrice = document.getElementById('printSell');
let docHighestBuyPrice = document.getElementById('printBuy');
let docCurrentOrder    = document.getElementsByClassName('currentOrder');

var popEtcInfo = (() => {
  docTotalAmountMade.innerHTML              = pageData.outPutLoggingEtc.totalAmountMade
    ? '$' + pageData.outPutLoggingEtc.totalAmountMade.toFixed(2)
    : docTotalAmountMade.innerHTML          = 'N/A';

  docOrderAmountMade.innerHTML              = pageData.outPutLoggingEtc.amountMade
    ? '$' + pageData.outPutLoggingEtc.amountMade.toFixed(2)
    : docOrderAmountMade.innerHTML          = 'N/A';

  docLowestSellPrice.innerHTML               = pageData.lowestSellPrice
    ? '$' + pageData.lowestSellPrice.toFixed(2)
    : docLowestSellPrice.innerHTML = 'N/A';

  docHighestBuyPrice.innerHTML                = pageData.highestBuyPrice
    ? '$' + pageData.highestBuyPrice.toFixed(2)
    : docHighestBuyPrice.innerHTML = 'N/A';

  docCurrentOrder[0].innerHTML = pageData.myOrderIterator != undefined
    ? pageData.myOrderIterator + 1
    : docCurrentOrder[0].innerHTML = 'Restarting...';
});
//=============================================
//=============================================
//=============================================
//ETC INFO
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//BUYS
//=============================================
//=============================================
//=============================================
var docNewPriceUpdateBuy = document.getElementById('newPriceUpdateBuy');
var docOldPriceUpdateBuy = document.getElementById('oldPriceUpdateBuy');
var docDifferenceBuy     = document.getElementById('differenceBuy');
var docMyBuyID           = document.getElementById('myBuyID');
var docMyBuyPrice        = document.getElementById('myBuyPrice');
var docMyOldBuyPrice     = document.getElementById('myOldBuyPrice');
var docMyBuyMargin       = document.getElementById('buyMargin');
var docOrderGapBuy       = document.getElementById('orderGapBuy');
var docDollarGapBuy      = document.getElementById('dollarGapBuy');
var docTotalBuy          = document.getElementById('buyTotal');

var popBuyData = (() => {

  docNewPriceUpdateBuy.innerHTML     = pageData.outPutLoggingBuy.difference
    ? '$' + pageData.outPutLoggingBuy.newPriceUpdate.toFixed(2)
    : docNewPriceUpdateBuy.innerHTML = 'No new update';

  docOldPriceUpdateBuy.innerHTML     = pageData.outPutLoggingBuy.difference
    ? '$' + pageData.outPutLoggingBuy.oldPriceUpdate.toFixed(2)
    : docOldPriceUpdateBuy.innerHTML = 'N/A';

  docDifferenceBuy.innerHTML         = pageData.outPutLoggingBuy.difference
    ? '$' + pageData.outPutLoggingBuy.difference.toFixed(2)
    : docDifferenceBuy.innerHTML     = 'N/A';


  if (pageData.outPutLoggingBuy.myBuyOrder) {
    docMyBuyID.innerHTML           = pageData.outPutLoggingBuy.myBuyOrder.order_id
      ? pageData.outPutLoggingBuy.myBuyOrder.order_id
      : docMyBuyID.innerHTML       = 'N/A';

    docMyBuyPrice.innerHTML        = pageData.outPutLoggingBuy.myBuyOrder.price
      ? '$' + pageData.outPutLoggingBuy.myBuyOrder.price.toFixed(2)
      : docMyBuyPrice.innerHTML    = 'N/A';

    docMyOldBuyPrice.innerHTML     = pageData.outPutLoggingBuy.myBuyOrder.oldPrice
      ? '$' + pageData.outPutLoggingBuy.myBuyOrder.oldPrice.toFixed(2)
      : docMyOldBuyPrice.innerHTML = 'N/A';

    docMyBuyMargin.innerHTML       = pageData.outPutLoggingBuy.myBuyOrder.oldMargin
      ? pageData.outPutLoggingBuy.myBuyOrder.oldMargin.toFixed(4) + '%'
      : docMyBuyMargin.innerHTML   = 'N/A';

    docOrderGapBuy.innerHTML       = pageData.outPutLoggingBuy.myBuyOrder.oldOrdersToGo
      ? '#' + pageData.outPutLoggingBuy.myBuyOrder.oldOrdersToGo
      : docOrderGapBuy.innerHTML   = 'N/A';

    docDollarGapBuy.innerHTML      = pageData.outPutLoggingBuy.myBuyOrder.oldAmountToGo
      ? '$' + numberWithCommas(pageData.outPutLoggingBuy.myBuyOrder.oldAmountToGo.toFixed(2))
      : docDollarGapBuy.innerHTML  = 'N/A';

    docTotalBuy.innerHTML          = 20 * pageData.outPutLoggingBuy.myBuyOrder.price
      ? '$' + numberWithCommas((20 * pageData.outPutLoggingBuy.myBuyOrder.price).toFixed(2))
      : docTotalBuy.innerHTML      = 'N/A';
  } else {
    docMyBuyID.innerHTML       = 'No existing order';
    docMyBuyPrice.innerHTML    = 'No existing order';
    docMyOldBuyPrice.innerHTML = 'No existing order';
    docMyBuyMargin.innerHTML   = 'No existing order';
    docOrderGapBuy.innerHTM    = 'No existing order';
    docDollarGapBuy.innerHTML  = 'No existing order';
    docTotalBuy.innerHTML      = 'No existing order';
  }
});
//=============================================
//=============================================
//=============================================
//BUYS
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//SELLS
//=============================================
//=============================================
//=============================================
var docMySellID           = document.getElementById('mySellID');
var docMySellPrice        = document.getElementById('mySellPrice');
var docMyOldSellPrice     = document.getElementById('myOldSellPrice');
var docMySellMargin       = document.getElementById('sellMargin');
var docOrderGapSell       = document.getElementById('orderGapSell');
var docDollarGapSell      = document.getElementById('dollarGapSell');
var docTotalSell          = document.getElementById('sellTotal');

var popSellData = (() => {
  if (pageData.outPutLoggingSell.mySellOrder) {
    docMySellID.innerHTML           = pageData.outPutLoggingSell.mySellOrder.order_id
      ? pageData.outPutLoggingSell.mySellOrder.order_id
      : docMySellID.innerHTML       = 'No existing order';

    docMySellPrice.innerHTML        = pageData.outPutLoggingSell.mySellOrder.price
      ? '$' + pageData.outPutLoggingSell.mySellOrder.price.toFixed(2)
      : docMySellPrice.innerHTML    = 'N/A';

    docMyOldSellPrice.innerHTML     = pageData.outPutLoggingSell.mySellOrder.oldPrice
      ? '$' + pageData.outPutLoggingSell.mySellOrder.oldPrice.toFixed(2)
      : docMyOldSellPrice.innerHTML = 'N/A';

    docMySellMargin.innerHTML       = pageData.outPutLoggingSell.mySellOrder.oldMargin
      ? pageData.outPutLoggingSell.mySellOrder.oldMargin.toFixed(4) + '%'
      : docMySellMargin.innerHTML   = 'N/A';

    docOrderGapSell.innerHTML       = pageData.outPutLoggingSell.mySellOrder.oldOrdersToGo
      ? '#' + pageData.outPutLoggingSell.mySellOrder.oldOrdersToGo
      : docOrderGapSell.innerHTML   = 'N/A';

    docDollarGapSell.innerHTML      = pageData.outPutLoggingSell.mySellOrder.oldAmountToGo
      ? '$' + numberWithCommas(pageData.outPutLoggingSell.mySellOrder.oldAmountToGo.toFixed(2))
      : docDollarGapSell.innerHTML  = 'N/A';

    docTotalSell.innerHTML          = 20 * pageData.outPutLoggingSell.mySellOrder.price
      ? '$' + numberWithCommas((20 * pageData.outPutLoggingSell.mySellOrder.price).toFixed(2))
      : docTotalSell.innerHTML      = 'N/A';
  } else {
    docMySellID.innerHTML       = 'No existing order';
    docMySellPrice.innerHTML    = 'No existing order';
    docMyOldSellPrice.innerHTML = 'No existing order';
    docMySellMargin.innerHTML   = 'No existing order';
    docOrderGapSell.innerHTML   = 'No existing order';
    docDollarGapSell.innerHTML  = 'No existing order';
    docTotalSell.innerHTML      = 'No existing order';
  }
});
//=============================================
//=============================================
//=============================================
//SELLS
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//NUMBERS WITH COMMAS
//=============================================
//=============================================
//=============================================
var numberWithCommas = ((x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});
//=============================================
//=============================================
//=============================================
//NUMBERS WITH COMMAS
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//BAR GRAPHS
//=============================================
//=============================================
//=============================================
var marketData = (() => {
  if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerBuy')[0].style.width = pageData.outPutLoggingGood.goodBuyPercent + '%';
  if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerSell')[0].style.width = pageData.outPutLoggingGood.goodSellPercent + '%';
  if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerRest')[0].style.width = pageData.outPutLoggingGood.totalBadPercent + '%';
  if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.innerBuy')[1].style.width = pageData.outPutLoggingGood.goodBuyPercent + '%';
  if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.innerSell')[1].style.width = pageData.outPutLoggingGood.goodSellPercent + '%';
  if (!(pageData.myOrderIterator % 2)) document.querySelectorAll('.innerRest')[1].style.width = pageData.outPutLoggingGood.totalBadPercent + '%';
});
//=============================================
//=============================================
//=============================================
//BAR GRAPHS
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//PIE CHARTS
//=============================================
//=============================================
//=============================================
var makePie = (() => {
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

  var drawChart1 = (() => {
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
  });

  var drawChart2 = (() => {
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
  });
});
//=============================================
//=============================================
//=============================================
//PIE CHARTS
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//=============================================
//SCRIPT LOADER
//=============================================
//=============================================
//=============================================
function loadScript (url, callback) {

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
//=============================================
//=============================================
//=============================================
//SCRIPT LOADER
//=============================================
//=============================================
//=============================================
