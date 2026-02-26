// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AssetMarketplace
 * @dev A listing and purchase system for 3D assets with platform fees.
 * Follows pull-based payment patterns and secure Ether transfer practices.
 */
contract AssetMarketplace is Ownable, ReentrancyGuard {
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
    mapping(address => uint256) public pendingEarnings;
    address public immutable treasury;

    event AssetListed(uint256 indexed assetId, address indexed creator, uint256 price);
    event AssetPurchased(uint256 indexed assetId, address indexed buyer, uint256 price);
    event EarningsClaimed(address indexed creator, uint256 amount);

    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    /**
     * @dev List a new asset for sale.
     * @param assetId The identifier of the asset.
     * @param price The selling price.
     * @param royaltyBps The royalty percentage in basis points.
     */
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

    /**
     * @dev Purchase an asset. Splitting funds between creator and platform treasury.
     * @param assetId The identifier of the asset.
     */
    function purchase(uint256 assetId) external payable nonReentrant {
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Not listed");
        require(msg.value >= asset.price, "Insufficient payment");

        uint256 fee = (msg.value * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorAmount = msg.value - fee;

        pendingEarnings[asset.creator] += creatorAmount;

        // Send platform fee
        (bool success, ) = treasury.call{value: fee}("");
        require(success, "Treasury transfer failed");

        asset.totalSales++;
        emit AssetPurchased(assetId, msg.sender, msg.value);
    }

    /**
     * @dev Claim accrued earnings for the caller.
     */
    function claimEarnings() external nonReentrant {
        uint256 amount = pendingEarnings[msg.sender];
        require(amount > 0, "No earnings to claim");

        pendingEarnings[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Claim failed");

        emit EarningsClaimed(msg.sender, amount);
    }
}
