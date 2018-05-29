pragma solidity ^0.4.18;

import './QRVnCoin.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';


contract QRVnPreIco is Ownable {
  using SafeMath for uint256;

  uint256 public constant MAX_GAS_PRICE = 100000000000;    // 100 gwei maximum gas price for contribution transactions

  // address where funds are collected
  address public wallet_address;

  // address of the token
  address public token_address;

  // send address
  address public send_address;

  // 1 eth {rate} tokens
  uint256 public rate = 10000;  // 1 eth = 10000 tokens

  // amount of raised money in wei
  uint256 public weiRaised;
  uint256 public tokensSold;

  uint256 public hardCap = 500 ether;
  uint256 public hardCapTokens = 5000000 * 10**8;  // 5 million tokens

  // ico state
  enum IcoStateChoices { Ready, Started, Finished }

  IcoStateChoices public icoState = IcoStateChoices.Ready;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  // verifies that the gas price is lower than 100 gwei
  modifier validGasPrice() {
    require(tx.gasprice <= MAX_GAS_PRICE);
    _;
  }

  modifier icoActive() {
    require(icoState == IcoStateChoices.Started);
    _;
  }

  function QRVnPreIco(address _wallet_address, address _token_address, address _send_address) public {
    require(_wallet_address != 0x0);
    require(_token_address != 0x0);

    wallet_address = _wallet_address;
    token_address = _token_address;
    send_address = _send_address;
  }

  // fallback function can be used to buy tokens
  function () public payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) validGasPrice icoActive private {
    require(beneficiary != 0x0);

    uint256 weiAmount = msg.value;

    uint256 change = 0;
    uint256 tmpWei = weiRaised.add(weiAmount);
    if (tmpWei > hardCap) {
        change = tmpWei.sub(hardCap);
        weiAmount = weiAmount.sub(change);
        beneficiary.transfer(change);
    }

    uint256 tokens = convertWeiToTokens(weiAmount);
    uint256 tmpTokens = tokensSold.add(tokens);
    if (tmpTokens > hardCapTokens) {
      uint256 diff = tmpTokens.sub(hardCapTokens);
      tokens = tokens.sub(diff);
    }

    send_address.transfer(weiAmount);
    QRVnCoin tok = QRVnCoin(token_address);
    if (tok.transferFrom(wallet_address, beneficiary, tokens)) {
      // update state
      weiRaised = weiRaised.add(weiAmount);
      tokensSold = tokensSold.add(tokens);
      if (weiRaised >= hardCap) {
        icoState = IcoStateChoices.Finished;
      }
      TokenPurchase(beneficiary, beneficiary, weiAmount, tokens);
    }
  }

  function convertWeiToTokens(uint256 weiAmount) constant public returns (uint256) {
    // calculate token amount
    uint256 tokens = weiAmount.div(10 ** 10).mul(rate);
    return tokens;
  }

  function endICO() onlyOwner public {
    require(icoState == IcoStateChoices.Started);
    icoState = IcoStateChoices.Finished;
  }

  function startICO() onlyOwner public {
    require(icoState == IcoStateChoices.Ready);
    icoState = IcoStateChoices.Started;
  }
}