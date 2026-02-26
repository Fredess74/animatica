// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AnimaticaTreasury
 * @dev Simple treasury contract for receiving platform fees.
 * Always use `.call` instead of `.transfer()` for Ether transfers.
 */
contract AnimaticaTreasury is Ownable {
    event Withdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Allows the owner to withdraw funds from the treasury.
     * @param to The recipient address.
     * @param amount The amount to withdraw.
     */
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(to, amount);
    }

    receive() external payable {}
}
