var sells = [5, 9, 7, 6, 8]
var buys = [4.99, 4, 2, 1, 3]


buys.sort((a, b) => {
    return b - a
})
sells.sort((a, b) => {
    return a - b
})

console.log(sells)
console.log(buys)
