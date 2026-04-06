// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreatorFund
 * @dev Distributes rewards based on creator weights.
 *      Uses a pull-payment pattern to ensure fairness and prevent DoS.
 */
contract CreatorFund is Ownable, ReentrancyGuard {
    uint256 public totalWeight;
    mapping(address => uint256) public creatorWeight;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public lastPointsAtClaim;

    uint256 public totalPoints;
    uint256 private constant MAGNITUDE = 1e18;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);
    event Deposited(address indexed from, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Track total points for fair distribution as rewards are deposited
    receive() external payable {
        if (totalWeight > 0) {
            totalPoints += (msg.value * MAGNITUDE) / totalWeight;
        }
        emit Deposited(msg.sender, msg.value);
    }

    function updateWeight(address creator, uint256 weight) external onlyOwner {
        _updateCreatorRewards(creator);

        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;

        lastPointsAtClaim[creator] = totalPoints;
        emit WeightUpdated(creator, weight);
    }

    function updateWeightsBatch(
        address[] calldata creators,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creators.length == weights.length, "Length mismatch");
        for (uint256 i = 0; i < creators.length; i++) {
            _updateCreatorRewards(creators[i]);

            totalWeight = totalWeight - creatorWeight[creators[i]] + weights[i];
            creatorWeight[creators[i]] = weights[i];

            lastPointsAtClaim[creators[i]] = totalPoints;
            emit WeightUpdated(creators[i], weights[i]);
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        uint256 newPoints = totalPoints - lastPointsAtClaim[creator];
        uint256 earned = (creatorWeight[creator] * newPoints) / MAGNITUDE;
        return rewards[creator] + earned;
    }

    function claim() external nonReentrant {
        _updateCreatorRewards(msg.sender);

        uint256 amount = rewards[msg.sender];
        require(amount > 0, "Nothing to claim");

        rewards[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Claim transfer failed");

        emit Claimed(msg.sender, amount);
    }

    function _updateCreatorRewards(address creator) internal {
        uint256 newPoints = totalPoints - lastPointsAtClaim[creator];
        uint256 earned = (creatorWeight[creator] * newPoints) / MAGNITUDE;
        rewards[creator] += earned;
        lastPointsAtClaim[creator] = totalPoints;
    }
}
