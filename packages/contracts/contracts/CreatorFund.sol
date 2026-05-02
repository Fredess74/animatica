// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    uint256 public constant REWARD_PRECISION = 1e12;

    mapping(address => uint256) public creatorWeight;
    uint256 public totalWeight;
    uint256 public accRewardPerWeight;

    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public accruedRewards;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);
    event RewardAdded(uint256 amount);

    constructor() Ownable(msg.sender) {}

    function updateWeight(address creator, uint256 weight) external onlyOwner {
        _accrue(creator);
        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;
        rewardDebt[creator] = (creatorWeight[creator] * accRewardPerWeight) / REWARD_PRECISION;
        emit WeightUpdated(creator, weight);
    }

    function updateWeightsBatch(
        address[] calldata creators,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creators.length == weights.length, "Length mismatch");
        for (uint256 i = 0; i < creators.length; i++) {
            address creator = creators[i];
            uint256 weight = weights[i];
            _accrue(creator);
            totalWeight = totalWeight - creatorWeight[creator] + weight;
            creatorWeight[creator] = weight;
            rewardDebt[creator] = (creatorWeight[creator] * accRewardPerWeight) / REWARD_PRECISION;
            emit WeightUpdated(creator, weight);
        }
    }

    function _accrue(address creator) internal {
        if (creatorWeight[creator] > 0) {
            accruedRewards[creator] += (creatorWeight[creator] * accRewardPerWeight) / REWARD_PRECISION - rewardDebt[creator];
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        uint256 pending = (creatorWeight[creator] * accRewardPerWeight) / REWARD_PRECISION - rewardDebt[creator];
        return accruedRewards[creator] + pending;
    }

    function claim() external nonReentrant {
        _accrue(msg.sender);
        uint256 amount = accruedRewards[msg.sender];
        require(amount > 0, "Nothing to claim");

        accruedRewards[msg.sender] = 0;
        rewardDebt[msg.sender] = (creatorWeight[msg.sender] * accRewardPerWeight) / REWARD_PRECISION;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Claim failed");

        emit Claimed(msg.sender, amount);
    }

    receive() external payable {
        if (msg.value > 0 && totalWeight > 0) {
            accRewardPerWeight += (msg.value * REWARD_PRECISION) / totalWeight;
            emit RewardAdded(msg.value);
        }
    }
}
