// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

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
    event Withdrawn(address indexed to, uint256 amount);

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

        // Split creator share among all creators by their weights - using pull payment
        for (uint256 i = 0; i < film.creators.length; i++) {
            uint256 creatorAmount = (creatorTotal * film.shares[i]) / BPS_DENOMINATOR;
            pendingWithdrawals[film.creators[i]] += creatorAmount;
        }

        // Direct push to treasury and fund is acceptable if they are trusted/simple
        payable(creatorFund).sendValue(fundAmount);
        payable(treasury).sendValue(platformAmount);

        film.totalDonations += msg.value;
        emit Donated(msg.sender, filmId, msg.value);
    }

    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).sendValue(amount);

        emit Withdrawn(msg.sender, amount);
    }
}
