var google = '';
let pageData = {};
let oReq = new XMLHttpRequest();
//local for localhost | c9 for cloudnine
let myAPIurl = 'local';

if (myAPIurl === 'c9') {
  myAPIurl = 'https://bot-nickgatti.c9users.io';
} else if (myAPIurl === 'local') {
  myAPIurl = 'http://localhost:3000/api';
} else {
  console.log('Error need fetch url');
  myAPIurl = false;
}

loadScript('https://www.gstatic.com/charts/loader.js', (() => {
  return;
}));

if (myAPIurl) setInterval(() => {
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

let reqListener = (() => {
  pageData = JSON.parse(this.responseText);
  oReq.removeEventListener('load', reqListener);
});

let activate = (() => {
  popOrderPlacementData();
  pageData.myOrderIterator % 2 === 0 ? popLowCriteraMarketData() : popHighCriteriaMarketData();
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
let docBuyStateID  = document.getElementById('placingBuy');
let docBuyPriceID  = document.getElementById('placingPriceBuy');
let docBuySizeID   = document.getElementById('placingSizeBuy');
let docSellStateID = document.getElementById('placingSell');
let docSellPriceID = document.getElementById('placingPriceSell');
let docSellSizeID  = document.getElementById('placingSizeSell');

let popOrderPlacementData = (() => {
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
let docRealSells        = document.querySelectorAll('.realSells');
let docRealBuys         = document.querySelectorAll('.realBuys');
let docRealSellPercent  = document.querySelectorAll('.realSellPercent');
let docRealBuyPercent   = document.querySelectorAll('.realBuyPercent');
let docRealTotalPercent = document.querySelectorAll('.realTotalPercent');
let docTotalSells       = document.getElementById('totalSells');
let docTotalBuys        = document.getElementById('totalBuys');
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
let popLowCriteraMarketData = (() => {
  let realSellPercent     = (((pageData.outPutLoggingGood.realSells / pageData.outPutLoggingGood.totalSells) * 10000) / 100);
  let realBuyPercent      = (((pageData.outPutLoggingGood.realBuys / pageData.outPutLoggingGood.totalBuys) * 10000) / 100);
  let realTotalPercent    = (100 - ((pageData.outPutLoggingGood.realSells + pageData.outPutLoggingGood.realBuys) / (pageData.outPutLoggingGood.totalBuys + pageData.outPutLoggingGood.totalSells) * 10000) / 100);
  docRealSells[0].innerHTML        = pageData.outPutLoggingGood.realSells
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.realSells)
    : 'Error loading Data';
  docRealBuys[0].innerHTML         = pageData.outPutLoggingGood.realBuys
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.realBuys)
    : 'Error loading Data';
  docRealSellPercent[0].innerHTML  = realSellPercent.toFixed(2) + '%';
  docRealBuyPercent[0].innerHTML   = realBuyPercent.toFixed(2) + '%';
  docRealTotalPercent[0].innerHTML = realTotalPercent.toFixed(2) + '%';
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
let popHighCriteriaMarketData = (() => {
  let realSellPercent     = (((pageData.outPutLoggingGood.realSells / pageData.outPutLoggingGood.totalSells) * 10000) / 100);
  let realBuyPercent      = (((pageData.outPutLoggingGood.realBuys / pageData.outPutLoggingGood.totalBuys) * 10000) / 100);
  let realTotalPercent    = (100 - ((pageData.outPutLoggingGood.realSells + pageData.outPutLoggingGood.realBuys) / (pageData.outPutLoggingGood.totalBuys + pageData.outPutLoggingGood.totalSells) * 10000) / 100);
  docRealSells[1].innerHTML        = pageData.outPutLoggingGood.realSells
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.realSells)
    : 'Error loading Data';
  docRealBuys[1].innerHTML         = pageData.outPutLoggingGood.realBuys
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.realBuys)
    : 'Error loading Data';
  docRealSellPercent[1].innerHTML  = realSellPercent.toFixed(2) + '%';
  docRealBuyPercent[1].innerHTML   = realBuyPercent.toFixed(2) + '%';
  docRealTotalPercent[1].innerHTML = realTotalPercent.toFixed(2) + '%';
});
//=============================================
//=============================================
//=============================================
//OTHER DATA
//=============================================
//=============================================
//=============================================
let popOtherMarketData = (() => {
  docTotalBuys.innerHTML  = pageData.outPutLoggingGood.totalBuys
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.totalBuys)
    : 'Error loading Data';

  docTotalSells.innerHTML = pageData.outPutLoggingGood.totalSells
    ? '#' + numberWithCommas(pageData.outPutLoggingGood.totalSells)
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

let popEtcInfo = (() => {
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
let docNewPriceUpdateBuy = document.getElementById('newPriceUpdateBuy');
let docOldPriceUpdateBuy = document.getElementById('oldPriceUpdateBuy');
let docDifferenceBuy     = document.getElementById('differenceBuy');
let docMyBuyID           = document.getElementById('myBuyID');
let docMyBuyPrice        = document.getElementById('myBuyPrice');
let docMyOldBuyPrice     = document.getElementById('myOldBuyPrice');
let docMyBuyMargin       = document.getElementById('buyMargin');
let docOrderGapBuy       = document.getElementById('orderGapBuy');
let docDollarGapBuy      = document.getElementById('dollarGapBuy');
let docTotalBuy          = document.getElementById('buyTotal');

let popBuyData = (() => {

  docNewPriceUpdateBuy.innerHTML     = pageData.outPutLoggingBuy.orderUpdate
    ? '$' + pageData.outPutLoggingBuy.myBuyOrder.price.toFixed(2)
    : docNewPriceUpdateBuy.innerHTML = 'No new update';

  docOldPriceUpdateBuy.innerHTML     = pageData.outPutLoggingBuy.orderUpdate
    ? '$' + pageData.outPutLoggingBuy.myBuyOrder.oldPrice.toFixed(2)
    : docOldPriceUpdateBuy.innerHTML = 'N/A';

  docDifferenceBuy.innerHTML         = pageData.outPutLoggingBuy.orderUpdate
    ? '$' + (pageData.outPutLoggingBuy.myBuyOrder.price - pageData.outPutLoggingBuy.myBuyOrder.oldPrice).toFixed(2)
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

    docMyBuyMargin.innerHTML       = pageData.outPutLoggingBuy.myBuyOrder.margin
      ? pageData.outPutLoggingBuy.myBuyOrder.margin.toFixed(4) + '%'
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
let docMySellID           = document.getElementById('mySellID');
let docMySellPrice        = document.getElementById('mySellPrice');
let docMySellMargin       = document.getElementById('sellMargin');
let docOrderGapSell       = document.getElementById('orderGapSell');
let docDollarGapSell      = document.getElementById('dollarGapSell');
let docTotalSell          = document.getElementById('sellTotal');

let popSellData = (() => {
  if (pageData.outPutLoggingSell.mySellOrder) {
    docMySellID.innerHTML           = pageData.outPutLoggingSell.mySellOrder.order_id
      ? pageData.outPutLoggingSell.mySellOrder.order_id
      : docMySellID.innerHTML       = 'No existing order';

    docMySellPrice.innerHTML        = pageData.outPutLoggingSell.mySellOrder.price
      ? '$' + pageData.outPutLoggingSell.mySellOrder.price.toFixed(2)
      : docMySellPrice.innerHTML    = 'N/A';

    docMySellMargin.innerHTML       = pageData.outPutLoggingSell.mySellOrder.margin
      ? pageData.outPutLoggingSell.mySellOrder.margin.toFixed(4) + '%'
      : docMySellMargin.innerHTML   = 'N/A';

    docOrderGapSell.innerHTML       = pageData.outPutLoggingSell.sellCount
      ? '#' + pageData.outPutLoggingSell.sellCount
      : docOrderGapSell.innerHTML   = 'N/A';

    docDollarGapSell.innerHTML      = pageData.outPutLoggingSell.sellTotal
      ? '$' + numberWithCommas(pageData.outPutLoggingSell.sellTotal.toFixed(2))
      : docDollarGapSell.innerHTML  = 'N/A';

    docTotalSell.innerHTML          = 20 * pageData.outPutLoggingSell.mySellOrder.price
      ? '$' + numberWithCommas((20 * pageData.outPutLoggingSell.mySellOrder.price).toFixed(2))
      : docTotalSell.innerHTML      = 'N/A';
  } else {
    docMySellID.innerHTML       = 'No existing order';
    docMySellPrice.innerHTML    = 'No existing order';
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
let numberWithCommas = ((x) => {
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
let marketData = (() => {
  let realSellPercent     = (((pageData.outPutLoggingGood.realSells / (pageData.outPutLoggingGood.totalSells + pageData.outPutLoggingGood.totalBuys)) * 10000) / 100);
  let realBuyPercent      = (((pageData.outPutLoggingGood.realBuys / (pageData.outPutLoggingGood.totalSells + pageData.outPutLoggingGood.totalBuys)) * 10000) / 100);
  let realTotalPercent    = (100 - (realSellPercent + realBuyPercent));
  if (pageData.myOrderIterator % 2 === 0) document.querySelectorAll('.innerBuy')[0].style.width = realBuyPercent + '%';
  if (pageData.myOrderIterator % 2 === 0) document.querySelectorAll('.innerSell')[0].style.width = realSellPercent + '%';
  if (pageData.myOrderIterator % 2 === 0) document.querySelectorAll('.innerRest')[0].style.width = realTotalPercent + '%';
  if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerBuy')[1].style.width = realBuyPercent + '%';
  if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerSell')[1].style.width = realSellPercent + '%';
  if (pageData.myOrderIterator % 2) document.querySelectorAll('.innerRest')[1].style.width = realTotalPercent + '%';
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
let makePie = (() => {
  let buyPercent = pageData.outPutLoggingGood.realBuys;
  let sellPercent = pageData.outPutLoggingGood.realSells;
  let totalBadPercent = ((pageData.outPutLoggingGood.totalBuys + pageData.outPutLoggingGood.totalSells) - (pageData.outPutLoggingGood.realSells + pageData.outPutLoggingGood.realBuys));
  if (pageData.myOrderIterator % 2 === 0) {
    google.charts.load('current', {
      'packages': ['corechart']
    });
    let data = google.visualization.arrayToDataTable([
      ['Task', 'Orders valued over 400 USD'],
      ['Good Sells', sellPercent],
      ['Good Buys', buyPercent],
      ['Ignored orders', totalBadPercent]
    ]);
    let options = {
      title: 'Orders valued over 400 USD'
    };
    google.charts.setOnLoadCallback(drawChart1(data, options));


  } else {
    google.charts.load('current', {
      'packages': ['corechart']
    });
    let data = google.visualization.arrayToDataTable([
      ['Task', 'Orders valued over 6000 USD'],
      ['Good Sells', sellPercent],
      ['Good Buys', buyPercent],
      ['Ignored orders', totalBadPercent]
    ]);
    let options = {
      title: 'Orders valued over 6000 USD'
    };
    google.charts.setOnLoadCallback(drawChart2(data, options));
  }

  function drawChart1(data, options) {
    let chart = new google.visualization.PieChart(document.getElementById('piechart1'));
    chart.draw(data, options);
  }

  function drawChart2(data, options) {
    let chart = new google.visualization.PieChart(document.getElementById('piechart2'));
    chart.draw(data, options);
  }
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
      if (script.readyState === 'loaded' ||
        script.readyState === 'complete') {
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
