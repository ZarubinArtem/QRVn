var QRVnCoin = artifacts.require("./QRVnCoin.sol");

contract('QRVnCoin', function (accounts) {
    it("should put 5000000 QRVnCoin in the first account", function () {
        return QRVnCoin.deployed().then(function (instance) {
            return instance.balanceOf.call(accounts[0]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 5000000 * Math.pow(10, 8), "5000000 wasn't in the first account");
        });
    });

    it("should send coin correctly", function () {
        var meta;

        // Get initial balances of first and second account.
        var account_one = accounts[0];
        var account_two = accounts[1];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        var amount = 10;

        return QRVnCoin.new().then(function (instance) {
            meta = instance;
            return meta.balanceOf.call(account_one);
        }).then(function (balance) {
            account_one_starting_balance = balance.toNumber();
            return meta.balanceOf.call(account_two);
        }).then(function (balance) {
            account_two_starting_balance = balance.toNumber();
            return meta.transfer(account_two, amount, {from: account_one});
        }).then(function () {
            return meta.balanceOf.call(account_one);
        }).then(function (balance) {
            account_one_ending_balance = balance.toNumber();
            return meta.balanceOf.call(account_two);
        }).then(function (balance) {
            account_two_ending_balance = balance.toNumber();

            assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
        });
    });
});
