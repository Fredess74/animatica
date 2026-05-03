// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    uint256 public accRewardPerWeight;
    uint256 public totalWeight;

    struct CreatorInfo {
        uint256 weight;
        uint256 rewardDebt;
    }

    mapping(address => CreatorInfo) public creators;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);

    constructor() Ownable(msg.sender) {}

    receive() external payable {
        if (totalWeight > 0 && msg.value > 0) {
            accRewardPerWeight += (msg.value * 1e12) / totalWeight;
        }
    }

    function updateWeight(address creator, uint256 weight) external onlyOwner {
        _updateCreator(creator);
        totalWeight = totalWeight - creators[creator].weight + weight;
        creators[creator].weight = weight;
        creators[creator].rewardDebt = (creators[creator].weight * accRewardPerWeight) / 1e12;
        emit WeightUpdated(creator, weight);
    }

    function _updateCreator(address creator) internal {
        uint256 pending = (creators[creator].weight * accRewardPerWeight) / 1e12 - creators[creator].rewardDebt;
        if (pending > 0) {
            (bool success, ) = creator.call{value: pending}("");
            require(success, "Claim failed");
            emit Claimed(creator, pending);
        }
    }

    function claim() external nonReentrant {
        _updateCreator(msg.sender);
        creators[msg.sender].rewardDebt = (creators[msg.sender].weight * accRewardPerWeight) / 1e12;
    }

    function getPending(address creator) public view returns (uint256) {
        return (creators[creator].weight * accRewardPerWeight) / 1e12 - creators[creator].rewardDebt;
    }
}
