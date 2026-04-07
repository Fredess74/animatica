// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    using Address for address payable;

    mapping(address => uint256) public creatorWeight;
    uint256 public totalWeight;

    // Reward calculation variables
    uint256 public accRewardPerWeight;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public pendingRewards;
    uint256 private lastBalance;

    uint256 private constant MAGNITUDE = 1e18;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function updateRewards() public {
        uint256 currentBalance = address(this).balance;
        if (currentBalance > lastBalance && totalWeight > 0) {
            uint256 delta = currentBalance - lastBalance;
            accRewardPerWeight += (delta * MAGNITUDE) / totalWeight;
        }
        lastBalance = currentBalance;
    }

    function _updateWeight(address creator, uint256 weight) internal {
        updateRewards();

        if (creatorWeight[creator] > 0) {
            uint256 pending = (creatorWeight[creator] * accRewardPerWeight / MAGNITUDE) - rewardDebt[creator];
            pendingRewards[creator] += pending;
        }

        totalWeight = totalWeight - creatorWeight[creator] + weight;
        creatorWeight[creator] = weight;
        rewardDebt[creator] = creatorWeight[creator] * accRewardPerWeight / MAGNITUDE;

        emit WeightUpdated(creator, weight);
    }

    function updateWeight(address creator, uint256 weight) external onlyOwner {
        _updateWeight(creator, weight);
    }

    function updateWeightsBatch(
        address[] calldata creators,
        uint256[] calldata weights
    ) external onlyOwner {
        require(creators.length == weights.length, "Length mismatch");
        for (uint256 i = 0; i < creators.length; i++) {
            _updateWeight(creators[i], weights[i]);
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        uint256 _accRewardPerWeight = accRewardPerWeight;
        uint256 currentBalance = address(this).balance;
        if (currentBalance > lastBalance && totalWeight > 0) {
            uint256 delta = currentBalance - lastBalance;
            _accRewardPerWeight += (delta * MAGNITUDE) / totalWeight;
        }

        uint256 pending = (creatorWeight[creator] * _accRewardPerWeight / MAGNITUDE) - rewardDebt[creator];
        return pendingRewards[creator] + pending;
    }

    function claim() external nonReentrant {
        updateRewards();

        uint256 pending = (creatorWeight[msg.sender] * accRewardPerWeight / MAGNITUDE) - rewardDebt[msg.sender];
        uint256 amount = pendingRewards[msg.sender] + pending;

        require(amount > 0, "Nothing to claim");

        pendingRewards[msg.sender] = 0;
        rewardDebt[msg.sender] = creatorWeight[msg.sender] * accRewardPerWeight / MAGNITUDE;

        payable(msg.sender).sendValue(amount);
        lastBalance = address(this).balance; // Update lastBalance after sending funds

        emit Claimed(msg.sender, amount);
    }

    receive() external payable {}
}
