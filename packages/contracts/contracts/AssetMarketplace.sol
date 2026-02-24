// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

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
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    function listAsset(uint256 assetId, uint256 price, uint256 royaltyBps) external {
        require(assetId != 0, "Invalid asset ID");
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

        (bool cSuccess, ) = payable(asset.creator).call{value: creatorAmount}("");
        require(cSuccess, "Creator payment failed");

        (bool tSuccess, ) = payable(treasury).call{value: fee}("");
        require(tSuccess, "Fee payment failed");

        asset.totalSales++;
        emit AssetPurchased(assetId, msg.sender, msg.value);
    }
}
