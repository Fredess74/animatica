// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title AssetMarketplace
 * @notice Allows creators to list assets and users to purchase them.
 * Uses a pull-payment pattern for security.
 */
contract AssetMarketplace is Ownable, ReentrancyGuard {
    using Address for address payable;

    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%

    struct Asset {
        address creator;
        uint256 price;
        uint256 royaltyBps;
        bool isActive;
        uint256 totalSales;
    }

    mapping(uint256 => Asset) public assets;
    mapping(address => uint256) public pendingWithdrawals;
    address public treasury;

    event AssetListed(uint256 indexed assetId, address creator, uint256 price);
    event AssetPurchased(uint256 indexed assetId, address buyer, uint256 price);
    event Withdrawal(address indexed to, uint256 amount);

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

        pendingWithdrawals[asset.creator] += creatorAmount;
        pendingWithdrawals[treasury] += fee;

        asset.totalSales++;
        emit AssetPurchased(assetId, msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).sendValue(amount);

        emit Withdrawal(msg.sender, amount);
    }
}
