// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DonationPool
 * @dev Manages donations for films and splits revenue among creators,
 * the Creator Fund, and the platform treasury.
 * Uses a pull-based claim model for creators to prevent DoS.
 */
contract DonationPool is Ownable, ReentrancyGuard {
    uint256 public constant CREATOR_BPS = 7000;   // 70%
    uint256 public constant FUND_BPS = 2000;       // 20%
    uint256 public constant PLATFORM_BPS = 1000;   // 10%
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MAX_CREATORS_PER_FILM = 50;

    address public immutable creatorFund;
    address public immutable treasury;

    struct Film {
        bool exists;
        address[] creators;
        uint256[] shares;        // Basis points per creator (must sum to 10000)
        uint256 totalDonations;
    }

    mapping(uint256 => Film) public films;
    mapping(address => uint256) public pendingClaims;

    event FilmRegistered(uint256 indexed filmId, address[] creators, uint256[] shares);
    event Donated(address indexed donor, uint256 indexed filmId, uint256 amount);
    event Claimed(address indexed creator, uint256 amount);

    constructor(address _creatorFund, address _treasury) Ownable(msg.sender) {
        require(_creatorFund != address(0), "Invalid fund address");
        require(_treasury != address(0), "Invalid treasury address");
        creatorFund = _creatorFund;
        treasury = _treasury;
    }

    /**
     * @dev Registers a film with its creators and their corresponding shares.
     * @param filmId The unique identifier for the film.
     * @param creators The addresses of the creators.
     * @param shares The basis points for each creator (must sum to 10000).
     */
    function registerFilm(
        uint256 filmId,
        address[] calldata creators,
        uint256[] calldata shares
    ) external onlyOwner {
        require(!films[filmId].exists, "Film already registered");
        require(creators.length == shares.length, "Length mismatch");
        require(creators.length > 0 && creators.length <= MAX_CREATORS_PER_FILM, "Invalid number of creators");

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

    /**
     * @dev Accepts a donation for a film and splits the funds.
     * @param filmId The identifier for the film receiving the donation.
     */
    function donate(uint256 filmId) external payable nonReentrant {
        require(msg.value > 0, "Must send value");
        Film storage film = films[filmId];
        require(film.exists, "Film not registered");

        uint256 creatorTotal = (msg.value * CREATOR_BPS) / BPS_DENOMINATOR;
        uint256 fundAmount = (msg.value * FUND_BPS) / BPS_DENOMINATOR;
        uint256 platformAmount = msg.value - creatorTotal - fundAmount;

        // Allocation: Split creator share among all creators by their weights
        for (uint256 i = 0; i < film.creators.length; i++) {
            uint256 creatorAmount = (creatorTotal * film.shares[i]) / BPS_DENOMINATOR;
            pendingClaims[film.creators[i]] += creatorAmount;
        }

        // Send to fund and treasury using .call
        (bool fundSuccess, ) = creatorFund.call{value: fundAmount}("");
        require(fundSuccess, "Fund transfer failed");

        (bool platformSuccess, ) = treasury.call{value: platformAmount}("");
        require(platformSuccess, "Treasury transfer failed");

        film.totalDonations += msg.value;
        emit Donated(msg.sender, filmId, msg.value);
    }

    /**
     * @dev Allows creators to pull their pending claims.
     */
    function claim() external nonReentrant {
        uint256 amount = pendingClaims[msg.sender];
        require(amount > 0, "Nothing to claim");

        pendingClaims[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Claim transfer failed");

        emit Claimed(msg.sender, amount);
    }
}
