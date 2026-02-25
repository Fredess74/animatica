// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DonationPool is Ownable, ReentrancyGuard {
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
    mapping(address => uint256) public claimableBalance;

    event FilmRegistered(uint256 indexed filmId, address[] creators, uint256[] shares);
    event Donated(address indexed donor, uint256 indexed filmId, uint256 amount);
    event BalanceClaimed(address indexed creator, uint256 amount);

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

        // Split creator share among all creators by their weights - PULL MODEL to avoid DoS
        for (uint256 i = 0; i < film.creators.length; i++) {
            uint256 creatorAmount = (creatorTotal * film.shares[i]) / BPS_DENOMINATOR;
            if (creatorAmount > 0) {
                claimableBalance[film.creators[i]] += creatorAmount;
            }
        }

        if (fundAmount > 0) {
            (bool fSuccess, ) = payable(creatorFund).call{value: fundAmount}("");
            require(fSuccess, "Fund transfer failed");
        }

        if (platformAmount > 0) {
            (bool tSuccess, ) = payable(treasury).call{value: platformAmount}("");
            require(tSuccess, "Treasury transfer failed");
        }

        film.totalDonations += msg.value;
        emit Donated(msg.sender, filmId, msg.value);
    }

    function claim() external nonReentrant {
        uint256 amount = claimableBalance[msg.sender];
        require(amount > 0, "No balance to claim");

        claimableBalance[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit BalanceClaimed(msg.sender, amount);
    }
}
