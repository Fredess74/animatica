// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreatorFund
 * @dev Distributes rewards to active creators based on weights.
 * Uses a Synthetix-style "Reward Per Share" model to handle weight changes correctly.
 */
contract CreatorFund is Ownable, ReentrancyGuard {
    uint256 public totalWeight;
    mapping(address => uint256) public creatorWeight;

    uint256 public rewardPerShare;
    mapping(address => uint256) public userRewardPerSharePaid;
    mapping(address => uint256) public rewards;

    uint256 private constant PRECISION = 1e18;

    event WeightUpdated(address indexed creator, uint256 oldWeight, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);
    event FundsReceived(address indexed source, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Updates the weight of a creator. Updates their rewards before changing weight.
     * @param creator The address of the creator.
     * @param weight The new weight.
     */
    function updateWeight(address creator, uint256 weight) public onlyOwner {
        _updateReward(creator);

        totalWeight = totalWeight - creatorWeight[creator] + weight;
        emit WeightUpdated(creator, creatorWeight[creator], weight);
        creatorWeight[creator] = weight;
    }

    /**
     * @dev Updates weights for multiple creators in a single transaction.
     * @param creators The addresses of the creators.
     * @param weights The new weights.
     */
    function updateWeightsBatch(
        address[] calldata creators,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creators.length == weights.length, "Length mismatch");
        for (uint256 i = 0; i < creators.length; i++) {
            updateWeight(creators[i], weights[i]);
        }
    }

    /**
     * @dev Internal function to update a creator's earned rewards based on current rewardPerShare.
     */
    function _updateReward(address account) internal {
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerSharePaid[account] = rewardPerShare;
        }
    }

    /**
     * @dev Calculates the amount a creator has earned since their last update.
     * @param account The creator's address.
     */
    function earned(address account) public view returns (uint256) {
        return (creatorWeight[account] * (rewardPerShare - userRewardPerSharePaid[account])) / PRECISION + rewards[account];
    }

    /**
     * @dev Claims all earned rewards for the caller.
     */
    function claim() external nonReentrant {
        _updateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Transfer failed");
            emit Claimed(msg.sender, reward);
        }
    }

    /**
     * @dev Receives funds and updates rewardPerShare.
     */
    receive() external payable {
        if (msg.value > 0) {
            require(totalWeight > 0, "No active creators to receive funds");
            rewardPerShare += (msg.value * PRECISION) / totalWeight;
            emit FundsReceived(msg.sender, msg.value);
        }
    }
}
