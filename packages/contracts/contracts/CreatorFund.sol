// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    mapping(address => uint256) public creatorWeight;
    uint256 public totalWeight;

    uint256 public totalFundsReceived;
    mapping(address => uint256) public claimedBy;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Called by backend oracle to update weights
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
            emit WeightUpdated(creators[i], weights[i]);
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        if (totalWeight == 0) return 0;
        uint256 totalFunds = totalFundsReceived;
        uint256 entitled = (totalFunds * creatorWeight[creator]) / totalWeight;
        if (entitled <= claimedBy[creator]) return 0;
        return entitled - claimedBy[creator];
    }

    function claim() external nonReentrant {
        uint256 amount = getClaimable(msg.sender);
        require(amount > 0, "Nothing to claim");

        claimedBy[msg.sender] += amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Claim transfer failed");

        emit Claimed(msg.sender, amount);
    }

    receive() external payable {
        totalFundsReceived += msg.value;
    }
}
