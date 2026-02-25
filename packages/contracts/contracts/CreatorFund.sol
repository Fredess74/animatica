// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreatorFund
 * @notice Distributes rewards to creators based on their weights using a pull-based model.
 * Uses the "Reward Per Share" pattern to ensure proportional distribution even when weights change.
 */
contract CreatorFund is Ownable, ReentrancyGuard {
    mapping(address => uint256) public creatorWeight;
    uint256 public totalWeight;

    uint256 public rewardPerWeightStored;
    uint256 public totalFundsReceived;

    mapping(address => uint256) public userRewardPerWeightPaid;
    mapping(address => uint256) public rewards;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);
    event FundsReceived(address indexed sender, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Updates the reward for a given account before state changes.
     */
    modifier updateReward(address account) {
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerWeightPaid[account] = rewardPerWeightStored;
        }
        _;
    }

    /**
     * @dev Calculates the amount of rewards earned by an account.
     */
    function earned(address account) public view returns (uint256) {
        return (creatorWeight[account] * (rewardPerWeightStored - userRewardPerWeightPaid[account]) / 1e18) + rewards[account];
    }

    /**
     * @dev Returns the current claimable balance for a creator.
     */
    function getClaimable(address creator) external view returns (uint256) {
        return earned(creator);
    }

    /**
     * @dev Updates the weight for a single creator.
     */
    function updateWeight(address creator, uint256 weight) external onlyOwner updateReward(creator) {
        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;
        emit WeightUpdated(creator, weight);
    }

    /**
     * @dev Updates weights for multiple creators in a batch.
     */
    function updateWeightsBatch(
        address[] calldata creators,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creators.length == weights.length, "Length mismatch");
        for (uint256 i = 0; i < creators.length; i++) {
            _updateWeight(creators[i], weights[i]);
        }
    }

    function _updateWeight(address creator, uint256 weight) internal updateReward(creator) {
        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;
        emit WeightUpdated(creator, weight);
    }

    /**
     * @dev Claims all earned rewards for the caller.
     */
    function claim() external nonReentrant updateReward(msg.sender) {
        uint256 amount = rewards[msg.sender];
        if (amount > 0) {
            rewards[msg.sender] = 0;
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "Claim transfer failed");
            emit Claimed(msg.sender, amount);
        }
    }

    /**
     * @dev Receives funds and updates the reward per weight.
     */
    receive() external payable {
        if (totalWeight > 0) {
            rewardPerWeightStored += (msg.value * 1e18) / totalWeight;
        }
        totalFundsReceived += msg.value;
        emit FundsReceived(msg.sender, msg.value);
    }
}
