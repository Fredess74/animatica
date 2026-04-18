// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    mapping(address => uint256) public creatorWeight;
    uint256 public totalWeight;
    mapping(address => uint256) public lastClaimBalance;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Called by backend oracle to update weights based on:
    // content minutes, views, donations, retention, activity
    function updateWeight(address creator, uint256 weight) external onlyOwner {
        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;
        emit WeightUpdated(creator, weight);
    }

    function updateWeightsBatch(
        address[] calldata creators,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creators.length == weights.length, "Length mismatch");
        for (uint256 i = 0; i < creators.length; i++) {
            totalWeight = totalWeight - creatorWeight[creators[i]] + weights[i];
            creatorWeight[creators[i]] = weights[i];
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        if (totalWeight == 0) return 0;
        return (address(this).balance * creatorWeight[creator]) / totalWeight;
    }

    function claim() external nonReentrant {
        uint256 amount = getClaimable(msg.sender);
        require(amount > 0, "Nothing to claim");
        payable(msg.sender).transfer(amount);
        emit Claimed(msg.sender, amount);
    }

    receive() external payable {}
}
