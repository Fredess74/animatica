// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AnimaticaTreasury is Ownable, ReentrancyGuard {
    event Withdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function withdraw(address to, uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Withdrawal failed");
        emit Withdrawn(to, amount);
    }

    receive() external payable {}
}
