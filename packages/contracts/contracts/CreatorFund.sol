// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title CreatorFund
 * @dev Distributes rewards to creators based on their relative weights.
 * Uses a mathematically fair reward-per-weight mechanism.
 */
contract CreatorFund is Ownable, ReentrancyGuard {
    using Address for address payable;

    uint256 public constant PRECISION = 1e18;

    uint256 public totalWeight;
    uint256 public accRewardPerWeight;

    mapping(address => uint256) public creatorWeight;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public accumulatedRewards;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);
    event RewardsReceived(uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Updates the weight of a creator. Before updating, it settles existing rewards.
     */
    function updateWeight(address creator, uint256 weight) public onlyOwner {
        _settle(creator);

        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;

        rewardDebt[creator] = (creatorWeight[creator] * accRewardPerWeight) / PRECISION;

        emit WeightUpdated(creator, weight);
    }

    /**
     * @dev Batch updates creator weights.
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
     * @dev Calculates claimable rewards for a creator.
     */
    function getClaimable(address creator) public view returns (uint256) {
        uint256 currentRewardDebt = (creatorWeight[creator] * accRewardPerWeight) / PRECISION;
        uint256 pending = 0;
        if (currentRewardDebt > rewardDebt[creator]) {
            pending = currentRewardDebt - rewardDebt[creator];
        }
        return accumulatedRewards[creator] + pending;
    }

    /**
     * @dev Allows creators to claim their rewards.
     */
    function claim() external nonReentrant {
        _settle(msg.sender);

        uint256 amount = accumulatedRewards[msg.sender];
        require(amount > 0, "Nothing to claim");

        accumulatedRewards[msg.sender] = 0;
        payable(msg.sender).sendValue(amount);

        emit Claimed(msg.sender, amount);
    }

    /**
     * @dev Settles rewards for a creator into their accumulatedRewards balance.
     */
    function _settle(address creator) internal {
        if (creatorWeight[creator] > 0) {
            uint256 currentRewardDebt = (creatorWeight[creator] * accRewardPerWeight) / PRECISION;
            if (currentRewardDebt > rewardDebt[creator]) {
                accumulatedRewards[creator] += (currentRewardDebt - rewardDebt[creator]);
            }
        }
        rewardDebt[creator] = (creatorWeight[creator] * accRewardPerWeight) / PRECISION;
    }

    /**
     * @dev Receives funds and updates accRewardPerWeight.
     */
    receive() external payable {
        if (msg.value > 0 && totalWeight > 0) {
            accRewardPerWeight += (msg.value * PRECISION) / totalWeight;
            emit RewardsReceived(msg.value);
        }
    }
}
