import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AnimaticaTreasury, CreatorFund, DonationPool, AssetMarketplace } from "../typechain-types";

describe("Blockchain Audit Integration", function () {
  let treasury: AnimaticaTreasury;
  let fund: CreatorFund;
  let pool: DonationPool;
  let marketplace: AssetMarketplace;
  let owner: HardhatEthersSigner;
  let creator1: HardhatEthersSigner;
  let creator2: HardhatEthersSigner;
  let donor: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, creator1, creator2, donor] = await ethers.getSigners();

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("AnimaticaTreasury");
    treasury = await Treasury.deploy();

    // Deploy Creator Fund
    const Fund = await ethers.getContractFactory("CreatorFund");
    fund = await Fund.deploy();

    // Deploy Donation Pool
    const Pool = await ethers.getContractFactory("DonationPool");
    pool = await Pool.deploy(await fund.getAddress(), await treasury.getAddress());

    // Deploy Asset Marketplace
    const Marketplace = await ethers.getContractFactory("AssetMarketplace");
    marketplace = await Marketplace.deploy(await treasury.getAddress());
  });

  describe("DonationPool Pull-based Split", function () {
    it("Should split donations and allow creators to claim", async function () {
      const filmId = 1;
      const creators = [creator1.address, creator2.address];
      const shares = [6000, 4000]; // 60% and 40% of the creator share

      // Set weights in fund to allow receiving donations
      await fund.updateWeight(owner.address, 1);

      await pool.registerFilm(filmId, creators, shares);

      const donationAmount = ethers.parseEther("1.0");
      await pool.connect(donor).donate(filmId, { value: donationAmount });

      // Total creator share is 70% of 1.0 ETH = 0.7 ETH
      // creator1 should have 60% of 0.7 ETH = 0.42 ETH
      // creator2 should have 40% of 0.7 ETH = 0.28 ETH

      expect(await pool.pendingClaims(creator1.address)).to.equal(ethers.parseEther("0.42"));
      expect(await pool.pendingClaims(creator2.address)).to.equal(ethers.parseEther("0.28"));

      // Creator 1 claims
      const initialBalance = await ethers.provider.getBalance(creator1.address);
      await pool.connect(creator1).claim();
      const finalBalance = await ethers.provider.getBalance(creator1.address);

      expect(finalBalance).to.be.gt(initialBalance);
      expect(await pool.pendingClaims(creator1.address)).to.equal(0);
    });

    it("Should send funds to CreatorFund and Treasury", async function () {
      const filmId = 2;

      // Set weights in fund to allow receiving donations
      await fund.updateWeight(owner.address, 1);

      await pool.registerFilm(filmId, [creator1.address], [10000]);

      const donationAmount = ethers.parseEther("1.0");
      await pool.connect(donor).donate(filmId, { value: donationAmount });

      // 20% to Fund (0.2 ETH), 10% to Treasury (0.1 ETH)
      expect(await ethers.provider.getBalance(await fund.getAddress())).to.equal(ethers.parseEther("0.2"));
      expect(await ethers.provider.getBalance(await treasury.getAddress())).to.equal(ethers.parseEther("0.1"));
    });
  });

  describe("CreatorFund Reward Per Share", function () {
    it("Should distribute rewards proportionally based on weights", async function () {
      await fund.updateWeight(creator1.address, 100);
      await fund.updateWeight(creator2.address, 300); // Total weight = 400

      // Send 0.4 ETH to the fund
      await owner.sendTransaction({
        to: await fund.getAddress(),
        value: ethers.parseEther("0.4")
      });

      // creator1 (1/4) should have 0.1 ETH
      // creator2 (3/4) should have 0.3 ETH
      expect(await fund.earned(creator1.address)).to.equal(ethers.parseEther("0.1"));
      expect(await fund.earned(creator2.address)).to.equal(ethers.parseEther("0.3"));

      // Update weights and send more funds
      await fund.updateWeight(creator1.address, 200); // Total weight = 200 + 300 = 500

      await owner.sendTransaction({
        to: await fund.getAddress(),
        value: ethers.parseEther("0.5")
      });

      // creator1 should have: 0.1 (old) + (200/500 * 0.5) = 0.1 + 0.2 = 0.3 ETH
      // creator2 should have: 0.3 (old) + (300/500 * 0.5) = 0.3 + 0.3 = 0.6 ETH
      expect(await fund.earned(creator1.address)).to.equal(ethers.parseEther("0.3"));
      expect(await fund.earned(creator2.address)).to.equal(ethers.parseEther("0.6"));
    });
  });

  describe("AssetMarketplace Pull-based Earnings", function () {
    it("Should allow creators to claim earnings after purchase", async function () {
      const assetId = 101;
      const price = ethers.parseEther("1.0");
      await marketplace.connect(creator1).listAsset(assetId, price, 500);

      await marketplace.connect(donor).purchase(assetId, { value: price });

      // 10% fee to treasury (0.1 ETH), 90% to creator (0.9 ETH)
      expect(await ethers.provider.getBalance(await treasury.getAddress())).to.equal(ethers.parseEther("0.1"));
      expect(await marketplace.pendingEarnings(creator1.address)).to.equal(ethers.parseEther("0.9"));

      await marketplace.connect(creator1).claimEarnings();
      expect(await marketplace.pendingEarnings(creator1.address)).to.equal(0);
    });
  });
});
