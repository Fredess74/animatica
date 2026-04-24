// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    mapping(address => uint256) public creatorWeight;
    uint256 public totalWeight;

    // Cumulative distribution model
    uint256 public totalPoints;
    mapping(address => uint256) public creatorPointsCorrection;
    uint256 public constant POINTS_MULTIPLIER = 1e18;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Called when the contract receives ETH
    receive() external payable {
        if (totalWeight > 0) {
            totalPoints += (msg.value * POINTS_MULTIPLIER) / totalWeight;
        }
    }

    function updateWeight(address creator, uint256 weight) external onlyOwner {
        // Claim existing rewards before changing weight
        _claim(creator);

        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;

        // Reset correction based on current totalPoints
        creatorPointsCorrection[creator] = (creatorWeight[creator] * totalPoints);

        emit WeightUpdated(creator, weight);
    }

    function updateWeightsBatch(
        address[] calldata creators,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creators.length == weights.length, "Length mismatch");
        for (uint256 i = 0; i < creators.length; i++) {
            _claim(creators[i]);
            totalWeight = totalWeight - creatorWeight[creators[i]] + weights[i];
            creatorWeight[creators[i]] = weights[i];
            creatorPointsCorrection[creators[i]] = (creatorWeight[creators[i]] * totalPoints);
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        if (creatorWeight[creator] == 0) return 0;
        uint256 accumulated = (creatorWeight[creator] * totalPoints);
        if (accumulated <= creatorPointsCorrection[creator]) return 0;
        return (accumulated - creatorPointsCorrection[creator]) / POINTS_MULTIPLIER;
    }

    function claim() external nonReentrant {
        _claim(msg.sender);
    }

    function _claim(address creator) internal {
        uint256 amount = getClaimable(creator);
        if (amount > 0) {
            creatorPointsCorrection[creator] = (creatorWeight[creator] * totalPoints);
            (bool success, ) = payable(creator).call{value: amount}("");
            require(success, "Transfer failed");
            emit Claimed(creator, amount);
        }
    }
}
