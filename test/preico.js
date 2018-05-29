var QRVnCoin = artifacts.require("./QRVnCoin.sol");
var QRVnPreIco = artifacts.require("./QRVnPreIco.sol");

contract('QRVnPreIco', function(accounts) {
    var capacity = 5000000 * Math.pow(10, 8);
    var account_one = accounts[0];
    var account_two = accounts[1];
    var account_three = accounts[2];

    it("account should get ether", function(){
        var coin;
        var pre_ico;
        var balance;

        return QRVnCoin.new().then(function(instance) {
            coin = instance;
            return QRVnPreIco.new(account_one, coin.address, account_three);
        }).then(function(instance) {
            pre_ico = instance;
            return coin.approve(pre_ico.address, capacity);
        }).then(function() {
            return pre_ico.startICO({from: account_one});
        }).then(function(){
            return web3.eth.getBalance(account_three);
        }).then(function(value){
            balance = value.toNumber();
            return web3.eth.sendTransaction({
                value: web3.toWei(1, "ether"),
                to: pre_ico.address,
                from: account_two,
                gas: 2000000
            });
        }).then(function() {
            return web3.eth.getBalance(account_three);
        }).then(function(value){
            var new_balance = value.toNumber();
            assert.equal(new_balance - balance, web3.toWei(1, "ether"), 'Account should have money');
        })
    });

    it("should not be able to send money before start and end", function () {
        var tokens = 10000 * Math.pow(10, 8);

        var coin;
        var pre_ico;

        return QRVnCoin.new().then(function(instance) {
            coin = instance;
            return QRVnPreIco.new(account_one, coin.address, account_one);
        }).then(function(instance) {
            pre_ico = instance;
            return coin.approve(pre_ico.address, capacity);
        }).then(function(){
            return web3.eth.sendTransaction({
                value: web3.toWei(1, "ether"),
                to: pre_ico.address,
                from: account_two,
                gas: 2000000
            });
        }).catch(function(error) {
            return pre_ico.startICO({from: account_one});
        }).then(function(){
            return web3.eth.sendTransaction({
                value: web3.toWei(1, "ether"),
                to: pre_ico.address,
                from: account_two,
                gas: 2000000
            });
        }).then(function(){
            return coin.balanceOf.call(account_two);
        }).then(function(value) {
            assert.equal(value.toNumber(), tokens, 'Should get 10 000 tokens');
            return pre_ico.endICO();
        }).then(function(){
            return web3.eth.sendTransaction({
                value: web3.toWei(1, "ether"),
                to: pre_ico.address,
                from: account_two,
                gas: 2000000
            });
        }).catch(function(){
            return Promise.all([pre_ico.weiRaised.call(), pre_ico.tokensSold.call()]);
        }).then(function(results){
            var weiRaised = results[0].toNumber();
            var tokensSold = results[1].toNumber();

            assert.equal(weiRaised, web3.toWei(1, 'ether'), 'Should raise 1 ether');
            assert.equal(tokensSold, tokens, 'Should sold 10 000 tokens');
        });
    });

    it("should finish ico when cap is reached", function() {
        var coin;
        var pre_ico;
        return QRVnCoin.new().then(function(instance) {
            coin = instance;
            return QRVnPreIco.new(account_one, coin.address, account_one);
        }).then(function(instance) {
            pre_ico = instance;
            return coin.approve(pre_ico.address, capacity);
        }).then(function(){
            return pre_ico.startICO();
        }).then(function() {
            return web3.eth.sendTransaction({
                value: web3.toWei(1, "ether"),
                to: pre_ico.address,
                from: account_two,
                gas: 2000000
            });
        }).then(function(){
            var promises = [];
            for (var i = 0; i<10; i++) {
                var promise = web3.eth.sendTransaction({
                    value: web3.toWei(50, "ether"),
                    to: pre_ico.address,
                    from: accounts[10+i],
                    gas: 2000000
                });
                promises.push(promise);
            }
            return Promise.all(promises);
        }).then(function() {
            var promises = [];
            for (var i = 0; i < 10; i++) {
                var promise = web3.eth.sendTransaction({
                    value: web3.toWei(50, "ether"),
                    to: accounts[10 + i],
                    from: account_one,
                    gas: 2000000
                });
                promises.push(promise);
            }
            return Promise.all(promises);
        }).then(function() {
            return Promise.all([pre_ico.weiRaised.call(), pre_ico.tokensSold.call(), pre_ico.icoState.call(), coin.balanceOf.call(account_one)]);
        }).then(function(results) {
            var weiRaised = results[0].toNumber();
            var tokensSold = results[1].toNumber();
            var icoState = results[2].toNumber();
            var balance = results[3].toNumber();
            assert.equal(weiRaised, web3.toWei(500, "ether"), 'Should collect 500 ether');
            assert.equal(tokensSold, capacity, 'Should collect sold all tokens');
            assert.equal(icoState, 2, 'Should be in finished state');
            assert.equal(balance, 0, 'Should not have tokens on main account');
        });
    });
});