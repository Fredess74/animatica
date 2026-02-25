// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AssetMarketplace is Ownable, ReentrancyGuard {
    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%

    struct Asset {
        address creator;
        uint256 price;
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

    function listAsset(uint256 assetId, uint256 price) external {
        require(!assets[assetId].isActive, "Already listed");

        assets[assetId] = Asset({
            creator: msg.sender,
            price: price,
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

        if (creatorAmount > 0) {
            (bool cSuccess, ) = payable(asset.creator).call{value: creatorAmount}("");
            require(cSuccess, "Creator payment failed");
        }

        if (fee > 0) {
            (bool tSuccess, ) = payable(treasury).call{value: fee}("");
            require(tSuccess, "Treasury fee payment failed");
        }

        asset.totalSales++;
        emit AssetPurchased(assetId, msg.sender, msg.value);
    }
}
