var preICO = artifacts.require("./QRVnPreIco.sol");

module.exports = function(callback) {
    preICO.at(preICO.address).endICO().then(function(){
        console.log('ended');
        callback();
    }).catch(function(e){
        console.log('error ' + e.toString());
        callback();
    });
};