// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title CreatorFund
 * @notice Distributes rewards to creators based on weights.
 * Uses a cumulative rewards-per-weight accounting system for mathematical fairness.
 */
contract CreatorFund is Ownable, ReentrancyGuard {
    using Address for address payable;

    struct CreatorInfo {
        uint256 weight;
        uint256 rewardDebt;
        uint256 pending;
    }

    mapping(address => CreatorInfo) public creators;
    uint256 public totalWeight;
    uint256 public accRewardPerWeight;
    uint256 public constant PRECISION = 1e18;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);
    event RewardsReceived(uint256 amount);

    constructor() Ownable(msg.sender) {}


    // Since we receive ETH directly, we can't easily know "newFunds" unless we track the balance.
    uint256 public lastBalance;

    function updatePool() public {
        uint256 currentBalance = address(this).balance;
        uint256 newRewards = currentBalance - lastBalance;

        if (newRewards > 0 && totalWeight > 0) {
            accRewardPerWeight += (newRewards * PRECISION) / totalWeight;
            lastBalance = currentBalance;
            emit RewardsReceived(newRewards);
        } else if (newRewards > 0 && totalWeight == 0) {
            // If funds are received but no creators exist, we keep them in lastBalance
            // so they are distributed once the first creator is added.
        }
    }

    function updateWeight(address creator, uint256 weight) external onlyOwner {
        updatePool();

        CreatorInfo storage info = creators[creator];

        if (info.weight > 0) {
            uint256 pending = (info.weight * accRewardPerWeight) / PRECISION - info.rewardDebt;
            info.pending += pending;
        }

        totalWeight = totalWeight - info.weight + weight;
        info.weight = weight;
        info.rewardDebt = (info.weight * accRewardPerWeight) / PRECISION;

        emit WeightUpdated(creator, weight);
    }

    function updateWeightsBatch(
        address[] calldata creatorAddrs,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creatorAddrs.length == weights.length, "Length mismatch");
        updatePool();

        for (uint256 i = 0; i < creatorAddrs.length; i++) {
            address creator = creatorAddrs[i];
            uint256 weight = weights[i];
            CreatorInfo storage info = creators[creator];

            if (info.weight > 0) {
                uint256 pending = (info.weight * accRewardPerWeight) / PRECISION - info.rewardDebt;
                info.pending += pending;
            }

            totalWeight = totalWeight - info.weight + weight;
            info.weight = weight;
            info.rewardDebt = (info.weight * accRewardPerWeight) / PRECISION;

            emit WeightUpdated(creator, weight);
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        CreatorInfo storage info = creators[creator];
        uint256 _accRewardPerWeight = accRewardPerWeight;
        uint256 currentBalance = address(this).balance;

        if (currentBalance > lastBalance && totalWeight > 0) {
            uint256 newRewards = currentBalance - lastBalance;
            _accRewardPerWeight += (newRewards * PRECISION) / totalWeight;
        }

        uint256 pending = (info.weight * _accRewardPerWeight) / PRECISION - info.rewardDebt;
        return info.pending + pending;
    }

    function claim() external nonReentrant {
        updatePool();

        CreatorInfo storage info = creators[msg.sender];
        uint256 pending = (info.weight * accRewardPerWeight) / PRECISION - info.rewardDebt;
        uint256 amount = info.pending + pending;

        require(amount > 0, "Nothing to claim");

        info.pending = 0;
        info.rewardDebt = (info.weight * accRewardPerWeight) / PRECISION;

        lastBalance -= amount;
        payable(msg.sender).sendValue(amount);

        emit Claimed(msg.sender, amount);
    }

    receive() external payable {
        // Funds are collected here. Pool is updated on next state-changing call.
    }
}
