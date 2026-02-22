# Smart Contracts

## Overview

Three core contracts + one marketplace contract. All deployed on **Base (Coinbase L2)** or **Avalanche C-Chain**. Written in Solidity 0.8.20+, tested and deployed with Hardhat.

---

## Contract 1: DonationPool.sol

The main entry point for all donations. Splits funds automatically.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DonationPool is Ownable, ReentrancyGuard {
    uint256 public constant CREATOR_BPS = 7000;   // 70%
    uint256 public constant FUND_BPS = 2000;       // 20%
    uint256 public constant PLATFORM_BPS = 1000;   // 10%
    uint256 public constant BPS_DENOMINATOR = 10000;

    address public creatorFund;
    address public treasury;

    struct Film {
        bool exists;
        address[] creators;
        uint256[] shares;        // basis points per creator (must sum to 10000)
        uint256 totalDonations;
    }

    mapping(uint256 => Film) public films;

    event FilmRegistered(uint256 indexed filmId, address[] creators, uint256[] shares);
    event Donated(address indexed donor, uint256 indexed filmId, uint256 amount);

    constructor(address _creatorFund, address _treasury) Ownable(msg.sender) {
        creatorFund = _creatorFund;
        treasury = _treasury;
    }

    function registerFilm(
        uint256 filmId,
        address[] calldata creators,
        uint256[] calldata shares
    ) external onlyOwner {
        require(!films[filmId].exists, "Film already registered");
        require(creators.length == shares.length, "Length mismatch");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares == BPS_DENOMINATOR, "Shares must sum to 10000");

        films[filmId] = Film({
            exists: true,
            creators: creators,
            shares: shares,
            totalDonations: 0
        });

        emit FilmRegistered(filmId, creators, shares);
    }

    function donate(uint256 filmId) external payable nonReentrant {
        require(msg.value > 0, "Must send value");
        Film storage film = films[filmId];
        require(film.exists, "Film not registered");

        uint256 creatorTotal = (msg.value * CREATOR_BPS) / BPS_DENOMINATOR;
        uint256 fundAmount = (msg.value * FUND_BPS) / BPS_DENOMINATOR;
        uint256 platformAmount = msg.value - creatorTotal - fundAmount;

        // Split creator share among all creators by their weights
        for (uint256 i = 0; i < film.creators.length; i++) {
            uint256 creatorAmount = (creatorTotal * film.shares[i]) / BPS_DENOMINATOR;
            payable(film.creators[i]).transfer(creatorAmount);
        }

        payable(creatorFund).transfer(fundAmount);
        payable(treasury).transfer(platformAmount);

        film.totalDonations += msg.value;
        emit Donated(msg.sender, filmId, msg.value);
    }
}
```

---

## Contract 2: CreatorFund.sol

Receives 20% of donations and distributes to all active creators.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CreatorFund is Ownable, ReentrancyGuard {
    mapping(address => uint256) public creatorWeight;
    uint256 public totalWeight;
    mapping(address => uint256) public lastClaimBalance;

    event WeightUpdated(address indexed creator, uint256 newWeight);
    event Claimed(address indexed creator, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Called by backend oracle to update weights based on:
    // content minutes, views, donations, retention, activity
    function updateWeight(address creator, uint256 weight) external onlyOwner {
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
            totalWeight = totalWeight - creatorWeight[creators[i]] + weights[i];
            creatorWeight[creators[i]] = weights[i];
        }
    }

    function getClaimable(address creator) public view returns (uint256) {
        if (totalWeight == 0) return 0;
        return (address(this).balance * creatorWeight[creator]) / totalWeight;
    }

    function claim() external nonReentrant {
        uint256 amount = getClaimable(msg.sender);
        require(amount > 0, "Nothing to claim");
        payable(msg.sender).transfer(amount);
        emit Claimed(msg.sender, amount);
    }

    receive() external payable {}
}
```

---

## Contract 3: AnimaticaTreasury.sol

Platform treasury — receives 10%.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AnimaticaTreasury is Ownable {
    event Withdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(to).transfer(amount);
        emit Withdrawn(to, amount);
    }

    receive() external payable {}
}
```

---

## Contract 4: AssetMarketplace.sol

Buy/sell/rent assets on-chain.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AssetMarketplace is Ownable, ReentrancyGuard {
    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%

    struct Asset {
        address creator;
        uint256 price;
        uint256 royaltyBps;
        bool isActive;
        uint256 totalSales;
    }

    mapping(uint256 => Asset) public assets;
    address public treasury;

    event AssetListed(uint256 indexed assetId, address creator, uint256 price);
    event AssetPurchased(uint256 indexed assetId, address buyer, uint256 price);

    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
    }

    function listAsset(uint256 assetId, uint256 price, uint256 royaltyBps) external {
        require(!assets[assetId].isActive, "Already listed");
        require(royaltyBps <= 1000, "Max 10% royalty");

        assets[assetId] = Asset({
            creator: msg.sender,
            price: price,
            royaltyBps: royaltyBps,
            isActive: true,
            totalSales: 0
        });

        emit AssetListed(assetId, msg.sender, price);
    }

    function purchase(uint256 assetId) external payable nonReentrant {
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Not listed");
        require(msg.value >= asset.price, "Insufficient payment");

        uint256 fee = (msg.value * PLATFORM_FEE_BPS) / 10000;
        uint256 creatorAmount = msg.value - fee;

        payable(asset.creator).transfer(creatorAmount);
        payable(treasury).transfer(fee);

        asset.totalSales++;
        emit AssetPurchased(assetId, msg.sender, msg.value);
    }
}
```

---

## Deployment

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  // 1. Deploy Treasury
  const Treasury = await ethers.getContractFactory("AnimaticaTreasury");
  const treasury = await Treasury.deploy();

  // 2. Deploy Creator Fund
  const Fund = await ethers.getContractFactory("CreatorFund");
  const fund = await Fund.deploy();

  // 3. Deploy Donation Pool
  const Pool = await ethers.getContractFactory("DonationPool");
  const pool = await Pool.deploy(fund.target, treasury.target);

  // 4. Deploy Asset Marketplace
  const Market = await ethers.getContractFactory("AssetMarketplace");
  const market = await Market.deploy(treasury.target);

  console.log("Treasury:", treasury.target);
  console.log("CreatorFund:", fund.target);
  console.log("DonationPool:", pool.target);
  console.log("AssetMarketplace:", market.target);
}

main().catch(console.error);
```

## Testing Strategy

| Contract | Test Cases |
|----------|-----------|
| DonationPool | Register film, donate, verify splits, multi-creator, reject unregistered |
| CreatorFund | Update weights, claim, batch update, zero balance claim |
| Treasury | Withdraw, only owner, insufficient balance |
| AssetMarketplace | List, purchase, fee calculation, deactivate |
