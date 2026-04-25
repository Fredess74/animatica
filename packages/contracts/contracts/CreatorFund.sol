// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    uint256 public totalWeight;
    uint256 public rewardPoints;
    uint256 private constant ACC_PRECISION = 1e18;

    mapping(address => uint256) public creatorWeight;
    mapping(address => uint256) public userRewardPointsPaid;
    mapping(address => uint256) public rewards;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);
    event RewardAdded(uint256 reward);

    constructor() Ownable(msg.sender) {}

    modifier updateReward(address account) {
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPointsPaid[account] = rewardPoints;
        }
        _;
    }

    function earned(address account) public view returns (uint256) {
        return (creatorWeight[account] * (rewardPoints - userRewardPointsPaid[account]) / ACC_PRECISION) + rewards[account];
    }

    function updateWeight(address creator, uint256 weight) external onlyOwner updateReward(creator) {
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
            address creator = creators[i];
            uint256 weight = weights[i];

            rewards[creator] = earned(creator);
            userRewardPointsPaid[creator] = rewardPoints;

            totalWeight = totalWeight - creatorWeight[creator] + weight;
            creatorWeight[creator] = weight;
            emit WeightUpdated(creator, weight);
        }
    }

    function claim() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Claim failed");
            emit Claimed(msg.sender, reward);
        }
    }

    receive() external payable {
        if (msg.value > 0 && totalWeight > 0) {
            rewardPoints += (msg.value * ACC_PRECISION / totalWeight);
        }
        emit RewardAdded(msg.value);
    }
}
