let savedTime = new Date().getTime();
var countdown = setInterval(() => {
    let now = new Date().getTime();
    let output = ('Orderbook re-download timeout: '+ (now - savedTime)).toString()
    console.log(output.slice(0, -3))
}, 1000);
clearInterval(countdown)