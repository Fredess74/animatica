// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title AnimaticaTreasury
 * @dev Simple platform treasury to receive and manage platform fees.
 */
contract AnimaticaTreasury is Ownable {
    using Address for address payable;

    event Withdrawn(address indexed to, uint256 amount);
    event Received(address indexed from, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Allows the owner to withdraw funds from the treasury.
     */
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");

        payable(to).sendValue(amount);

        emit Withdrawn(to, amount);
    }

    /**
     * @dev Allows the contract to receive ETH.
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
