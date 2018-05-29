var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');
var HDWalletProvider = require("truffle-hdwallet-provider");

// Get our mnemonic and create an hdwallet
// private key: f52a4a2edfdb95215940b4ce08b4b9c216c63aa66a8e636f02ebf56a677413cf
// address: 0x5570de3037bb168a4acbb79e0a4246403afb84e3
var mnemonic = "december recycle guard fox short feature chuckle castle token donate mule auto meat tortoise smoke";

var hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));

// Get the first account using the standard hd path.
var wallet_hdpath = "m/44'/60'/0'/0/0";
var wallet = hdwallet.derivePath(wallet_hdpath).getWallet();
var address = "0x" + wallet.getAddress().toString("hex");

// console.log(wallet.getPrivateKeyString());
console.log(address);

if ( ! mnemonic) {
    throw Exception('test');
}


module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        live: {
            gas: 2000000,
            gasPrice: 50000000000, // 50 Gwei
            provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/"),
            network_id: 1
        },
        ropsten: {
            gas: 2000000,
            gasPrice: 2000000000, // 2 Gwei
            provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"),
            network_id: 3 // official id of the ropsten network
        },
        test: {
            gas: 4712388,
            network_id: '*',
            host: "127.0.0.1",
            port: 7545
        }
    }
};