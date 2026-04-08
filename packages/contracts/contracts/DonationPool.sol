// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title DonationPool
 * @notice Receives donations for films and distributes them to creators, the creator fund, and the treasury.
 * Uses a pull-payment pattern to prevent DoS attacks and handle transfer failures gracefully.
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
    event Withdrawal(address indexed to, uint256 amount);

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
        // Remaining goes to platform treasury, handling rounding remainders
        uint256 platformAmount = msg.value - creatorTotal - fundAmount;

        // Allocate shares to creators
        uint256 allocatedToCreators = 0;
        for (uint256 i = 0; i < film.creators.length; i++) {
            uint256 creatorAmount;
            if (i == film.creators.length - 1) {
                // Last creator gets the remainder of the creator share to avoid dust
                creatorAmount = creatorTotal - allocatedToCreators;
            } else {
                creatorAmount = (creatorTotal * film.shares[i]) / BPS_DENOMINATOR;
            }
            pendingWithdrawals[film.creators[i]] += creatorAmount;
            allocatedToCreators += creatorAmount;
        }

        pendingWithdrawals[creatorFund] += fundAmount;
        pendingWithdrawals[treasury] += platformAmount;

        film.totalDonations += msg.value;
        emit Donated(msg.sender, filmId, msg.value);
    }

    /**
     * @notice Creators, the fund, and the treasury call this to withdraw their pending balance.
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).sendValue(amount);

        emit Withdrawal(msg.sender, amount);
    }
}
