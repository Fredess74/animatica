// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    uint256 public totalWeight;
    uint256 public rewardPerWeightStored;

    mapping(address => uint256) public creatorWeight;
    mapping(address => uint256) public userRewardPerWeightPaid;
    mapping(address => uint256) public rewards;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);
    event RewardAdded(uint256 reward);

    constructor() Ownable(msg.sender) {}

    // This contract receives ETH from DonationPool.
    // To keep it simple and robust, we use a pull-based distribution model.
    // However, native ETH doesn't have a "notifyRewardAmount" hook easily.
    // For this specific architecture, we'll use a snapshot or a simpler fair-share model.

    // Improved logic: Track total rewards ever received.
    uint256 public totalRewardsReceived;

    receive() external payable {
        if (totalWeight > 0) {
            rewardPerWeightStored += (msg.value * 1e18) / totalWeight;
        }
        totalRewardsReceived += msg.value;
        emit RewardAdded(msg.value);
    }

    function updateWeight(address creator, uint256 weight) external onlyOwner {
        _updateCreatorReward(creator);
        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;
        userRewardPerWeightPaid[creator] = rewardPerWeightStored;
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
            _updateCreatorReward(creator);
            totalWeight = totalWeight - creatorWeight[creator] + weight;
            creatorWeight[creator] = weight;
            userRewardPerWeightPaid[creator] = rewardPerWeightStored;
        }
    }

    function _updateCreatorReward(address creator) internal {
        rewards[creator] = _getClaimable(creator);
    }

    function _getClaimable(address creator) internal view returns (uint256) {
        return (creatorWeight[creator] * (rewardPerWeightStored - userRewardPerWeightPaid[creator])) / 1e18 + rewards[creator];
    }

    function getClaimable(address creator) public view returns (uint256) {
        return _getClaimable(creator);
    }

    function claim() external nonReentrant {
        uint256 amount = _getClaimable(msg.sender);
        require(amount > 0, "Nothing to claim");

        rewards[msg.sender] = 0;
        userRewardPerWeightPaid[msg.sender] = rewardPerWeightStored;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Claimed(msg.sender, amount);
    }
}
