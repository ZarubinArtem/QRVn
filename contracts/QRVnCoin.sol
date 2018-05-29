pragma solidity ^0.4.18;


import "../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract QRVnCoin is StandardToken {

  string public name = "QRVn";
  string public symbol = "QRVn";
  uint public decimals = 8;
  uint public INITIAL_SUPPLY = 5000000 * (10 ** uint256(decimals));  // 5 million tokens

  /**
   * @dev Contructor that gives msg.sender all of existing tokens.
   */
  function QRVnCoin() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }
}