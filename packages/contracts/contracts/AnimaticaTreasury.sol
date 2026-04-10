// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AnimaticaTreasury is Ownable {
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit Withdrawn(to, amount);
    }

    receive() external payable {}
}
