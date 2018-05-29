var QRVnCoin = artifacts.require("./QRVnCoin.sol");
var QRVnPreIco = artifacts.require("./QRVnPreIco.sol");


module.exports = function(deployer, network, accounts) {
    var address = accounts[0];
    var cap = 5000000 * Math.pow(10, 8);

    if (network == 'live') {
        var send_address = address;
    } else if (network == 'test') {
        var send_address = address;
    } else { // ropsten
        var send_address = address;
    }

    deployer.deploy(QRVnPreIco, address, QRVnCoin.address, send_address).then(function(){
        return Promise.all([QRVnCoin.deployed(), QRVnPreIco.deployed()]);
    }).then(function(results) {
        var coin = results[0];
        var pre_ico = results[1];
        return coin.approve(pre_ico.address, cap);
    });
};