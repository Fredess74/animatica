// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title AnimaticaTreasury
 * @notice Receives and manages platform fees.
 */
contract AnimaticaTreasury is Ownable {
    using Address for address payable;

    event Withdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(to).sendValue(amount);
        emit Withdrawn(to, amount);
    }

    receive() external payable {}
}
