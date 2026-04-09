// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title DonationPool
 * @dev Manages donations for films and distributes them among creators,
 * the creator fund, and the platform treasury.
 */
contract DonationPool is Ownable, ReentrancyGuard {
    using Address for address payable;

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
    mapping(address => uint256) public pendingWithdrawals;

    event FilmRegistered(uint256 indexed filmId, address[] creators, uint256[] shares);
    event Donated(address indexed donor, uint256 indexed filmId, uint256 amount);
    event Withdrawal(address indexed creator, uint256 amount);
    event CreatorFundUpdated(address indexed newFund);
    event TreasuryUpdated(address indexed newTreasury);

    constructor(address _creatorFund, address _treasury) Ownable(msg.sender) {
        require(_creatorFund != address(0), "Invalid creator fund address");
        require(_treasury != address(0), "Invalid treasury address");
        creatorFund = _creatorFund;
        treasury = _treasury;
    }

    /**
     * @dev Registers a film with its creators and their respective shares.
     */
    function registerFilm(
        uint256 filmId,
        address[] calldata creators,
        uint256[] calldata shares
    ) external onlyOwner {
        require(!films[filmId].exists, "Film already registered");
        require(creators.length == shares.length, "Length mismatch");
        require(creators.length > 0, "No creators specified");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            require(creators[i] != address(0), "Invalid creator address");
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

    /**
     * @dev Accepts donations for a film and allocates them to the various parties.
     */
    function donate(uint256 filmId) external payable nonReentrant {
        require(msg.value > 0, "Must send value");
        Film storage film = films[filmId];
        require(film.exists, "Film not registered");

        uint256 creatorTotal = (msg.value * CREATOR_BPS) / BPS_DENOMINATOR;
        uint256 fundAmount = (msg.value * FUND_BPS) / BPS_DENOMINATOR;
        uint256 platformAmount = msg.value - creatorTotal - fundAmount;

        // Pull payment pattern: record balances instead of direct transfer to avoid DoS
        uint256 allocatedToCreators = 0;
        for (uint256 i = 0; i < film.creators.length; i++) {
            uint256 creatorAmount;
            if (i == film.creators.length - 1) {
                // Assign remainder to the last creator to avoid dust accumulation
                creatorAmount = creatorTotal - allocatedToCreators;
            } else {
                creatorAmount = (creatorTotal * film.shares[i]) / BPS_DENOMINATOR;
                allocatedToCreators += creatorAmount;
            }
            pendingWithdrawals[film.creators[i]] += creatorAmount;
        }

        // Send to fund and treasury immediately as they are trusted system addresses
        payable(creatorFund).sendValue(fundAmount);
        payable(treasury).sendValue(platformAmount);

        film.totalDonations += msg.value;
        emit Donated(msg.sender, filmId, msg.value);
    }

    /**
     * @dev Updates the creator fund address.
     */
    function setCreatorFund(address _creatorFund) external onlyOwner {
        require(_creatorFund != address(0), "Invalid address");
        creatorFund = _creatorFund;
        emit CreatorFundUpdated(_creatorFund);
    }

    /**
     * @dev Updates the treasury address.
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    /**
     * @dev Allows creators to withdraw their accumulated donations.
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No balance to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).sendValue(amount);

        emit Withdrawal(msg.sender, amount);
    }
}
