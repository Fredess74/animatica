// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title AssetMarketplace
 * @dev Facilitates the buying and selling of assets with platform fees and creator royalties.
 */
contract AssetMarketplace is Ownable, ReentrancyGuard {
    using Address for address payable;

    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct Asset {
        address creator;
        uint256 price;
        uint256 royaltyBps;
        bool isActive;
        uint256 totalSales;
    }

    mapping(uint256 => Asset) public assets;
    address public treasury;

    event AssetListed(uint256 indexed assetId, address creator, uint256 price, uint256 royaltyBps);
    event AssetPurchased(uint256 indexed assetId, address buyer, uint256 price);
    event AssetDeactivated(uint256 indexed assetId);

    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    /**
     * @dev Lists an asset for sale.
     */
    function listAsset(uint256 assetId, uint256 price, uint256 royaltyBps) external {
        require(!assets[assetId].isActive, "Already listed");
        require(royaltyBps <= 1000, "Max 10% royalty");
        require(price > 0, "Price must be greater than zero");

        assets[assetId] = Asset({
            creator: msg.sender,
            price: price,
            royaltyBps: royaltyBps,
            isActive: true,
            totalSales: 0
        });

        emit AssetListed(assetId, msg.sender, price, royaltyBps);
    }

    /**
     * @dev Deactivates an asset listing. Only the creator or owner can do this.
     */
    function deactivateAsset(uint256 assetId) external {
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Not active");
        require(msg.sender == asset.creator || msg.sender == owner(), "Not authorized");

        asset.isActive = false;
        emit AssetDeactivated(assetId);
    }

    /**
     * @dev Purchases an asset. Fees and royalties are distributed.
     */
    function purchase(uint256 assetId) external payable nonReentrant {
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Not listed");
        require(msg.value >= asset.price, "Insufficient payment");

        uint256 platformFee = (asset.price * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorAmount = asset.price - platformFee;

        // In this simple model, the 'creator' is the seller.
        // If we had a secondary market, we'd distinguish between seller and creator.

        payable(asset.creator).sendValue(creatorAmount);
        payable(treasury).sendValue(platformFee);

        asset.totalSales++;

        // Refund excess payment
        if (msg.value > asset.price) {
            payable(msg.sender).sendValue(msg.value - asset.price);
        }

        emit AssetPurchased(assetId, msg.sender, asset.price);
    }

    /**
     * @dev Updates the treasury address.
     */
    function updateTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }
}
