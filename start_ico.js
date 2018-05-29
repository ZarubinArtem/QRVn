var preICO = artifacts.require("./QRVnPreIco.sol");

module.exports = function(callback) {
    return preICO.deployed().then(function(instance) {
        return instance.startICO();
    }).then(function(){
        console.log('started');
        callback();
    }).catch(function(e){
        console.log('error ' + e.toString());
        callback();
    });
};