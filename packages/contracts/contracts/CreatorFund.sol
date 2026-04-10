// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    mapping(address => uint256) public creatorWeight;
    uint256 public totalWeight;

    uint256 public cumulativeRewardPerWeight;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public pendingRewards;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function _settle(address creator) internal {
        if (totalWeight > 0) {
            uint256 entitlement = (creatorWeight[creator] * cumulativeRewardPerWeight) / 1e18;
            pendingRewards[creator] += entitlement - rewardDebt[creator];
        }
    }

    function updateWeight(address creator, uint256 weight) external onlyOwner {
        _settle(creator);
        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;
        rewardDebt[creator] = (creatorWeight[creator] * cumulativeRewardPerWeight) / 1e18;
        emit WeightUpdated(creator, weight);
    }

    function updateWeightsBatch(
        address[] calldata creators,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creators.length == weights.length, "Length mismatch");
        for (uint256 i = 0; i < creators.length; i++) {
            _settle(creators[i]);
            totalWeight = totalWeight - creatorWeight[creators[i]] + weights[i];
            creatorWeight[creators[i]] = weights[i];
            rewardDebt[creators[i]] = (creatorWeight[creators[i]] * cumulativeRewardPerWeight) / 1e18;
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        uint256 entitlement = (creatorWeight[creator] * cumulativeRewardPerWeight) / 1e18;
        return pendingRewards[creator] + (entitlement - rewardDebt[creator]);
    }

    function claim() external nonReentrant {
        _settle(msg.sender);
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "Nothing to claim");

        pendingRewards[msg.sender] = 0;
        rewardDebt[msg.sender] = (creatorWeight[msg.sender] * cumulativeRewardPerWeight) / 1e18;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Claim failed");

        emit Claimed(msg.sender, amount);
    }

    receive() external payable {
        if (msg.value > 0 && totalWeight > 0) {
            cumulativeRewardPerWeight += (msg.value * 1e18) / totalWeight;
        }
    }
}
