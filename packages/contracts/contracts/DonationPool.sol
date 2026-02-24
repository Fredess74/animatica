// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

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

    event FilmRegistered(uint256 indexed filmId, address[] creators, uint256[] shares);
    event Donated(address indexed donor, uint256 indexed filmId, uint256 amount);

    constructor(address _creatorFund, address _treasury) Ownable(msg.sender) {
        require(_creatorFund != address(0), "Invalid fund address");
        require(_treasury != address(0), "Invalid treasury address");
        creatorFund = _creatorFund;
        treasury = _treasury;
    }

    function registerFilm(
        uint256 filmId,
        address[] calldata creators,
        uint256[] calldata shares
    ) external onlyOwner {
        require(filmId != 0, "Invalid film ID");
        require(!films[filmId].exists, "Film already registered");
        require(creators.length > 0, "At least one creator required");
        require(creators.length == shares.length, "Length mismatch");

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

    function donate(uint256 filmId) external payable nonReentrant {
        require(msg.value > 0, "Must send value");
        Film storage film = films[filmId];
        require(film.exists, "Film not registered");

        uint256 creatorTotal = (msg.value * CREATOR_BPS) / BPS_DENOMINATOR;
        uint256 fundAmount = (msg.value * FUND_BPS) / BPS_DENOMINATOR;
        uint256 platformAmount = msg.value - creatorTotal - fundAmount;

        // Split creator share among all creators by their weights
        for (uint256 i = 0; i < film.creators.length; i++) {
            uint256 creatorAmount = (creatorTotal * film.shares[i]) / BPS_DENOMINATOR;
            (bool success, ) = payable(film.creators[i]).call{value: creatorAmount}("");
            require(success, "Creator transfer failed");
        }

        (bool fSuccess, ) = payable(creatorFund).call{value: fundAmount}("");
        require(fSuccess, "Fund transfer failed");

        (bool tSuccess, ) = payable(treasury).call{value: platformAmount}("");
        require(tSuccess, "Treasury transfer failed");

        film.totalDonations += msg.value;
        emit Donated(msg.sender, filmId, msg.value);
    }
}
