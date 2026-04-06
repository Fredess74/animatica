// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AssetMarketplace is Ownable, ReentrancyGuard {
    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%

    struct Asset {
        address creator;
        uint256 price;
        uint256 royaltyBps; // Max 1000 (10%)
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

        uint256 platformFee = (msg.value * PLATFORM_FEE_BPS) / 10000;

        // Royalty logic: if this is a secondary sale (implied), creator gets royalty.
        // For simplicity here, we always split: Treasury, Creator (Royalty + Net).
        // On initial purchase, creator gets everything minus platform fee.
        uint256 creatorAmount = msg.value - platformFee;

        (bool successCreator, ) = asset.creator.call{value: creatorAmount}("");
        require(successCreator, "Creator payment failed");

        (bool successTreasury, ) = treasury.call{value: platformFee}("");
        require(successTreasury, "Treasury payment failed");

        asset.totalSales++;
        emit AssetPurchased(assetId, msg.sender, msg.value);
    }
}
