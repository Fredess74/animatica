import { expect } from "chai";
import { ethers } from "hardhat";
import { DonationPool, CreatorFund, AnimaticaTreasury, AssetMarketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Blockchain Audit", function () {
  let donationPool: DonationPool;
  let creatorFund: CreatorFund;
  let treasury: AnimaticaTreasury;
  let marketplace: AssetMarketplace;
  let owner: SignerWithAddress;
  let creator1: SignerWithAddress;
  let creator2: SignerWithAddress;
  let donor: SignerWithAddress;

  beforeEach(async function () {
    [owner, creator1, creator2, donor] = await ethers.getSigners();

    const Treasury = await ethers.getContractFactory("AnimaticaTreasury");
    treasury = await Treasury.deploy();

    const Fund = await ethers.getContractFactory("CreatorFund");
    creatorFund = await Fund.deploy();

    const Pool = await ethers.getContractFactory("DonationPool");
    donationPool = await Pool.deploy(await creatorFund.getAddress(), await treasury.getAddress());

    const Marketplace = await ethers.getContractFactory("AssetMarketplace");
    marketplace = await Marketplace.deploy(await treasury.getAddress());
  });

  describe("Integration: Donation to Creator Payout", function () {
    it("Should flow funds from DonationPool to CreatorFund and allow weighted claim", async function () {
      // 1. Setup creators in CreatorFund
      await creatorFund.updateWeight(creator1.address, 100);
      await creatorFund.updateWeight(creator2.address, 300); // 1:3 ratio

      // 2. Setup film in DonationPool
      const filmId = 1;
      await donationPool.registerFilm(filmId, [creator1.address], [10000]); // 100% of creator share to creator1

      // 3. Donate 1 ETH
      // Splits: 70% (0.7) to creators, 20% (0.2) to CreatorFund, 10% (0.1) to Treasury
      await donationPool.connect(donor).donate(filmId, { value: ethers.parseEther("1.0") });

      // 4. Verify DonationPool pending withdrawal for creator1
      expect(await donationPool.pendingWithdrawals(creator1.address)).to.equal(ethers.parseEther("0.7"));

      // 5. Verify CreatorFund received its share (0.2 ETH) and distributed by weight
      // Total weight = 400. Creator1 has 100/400 = 25%. 25% of 0.2 ETH = 0.05 ETH.
      expect(await creatorFund.earned(creator1.address)).to.equal(ethers.parseEther("0.05"));
      // Creator2 has 300/400 = 75%. 75% of 0.2 ETH = 0.15 ETH.
      expect(await creatorFund.earned(creator2.address)).to.equal(ethers.parseEther("0.15"));

      // 6. Verify Treasury received its share (0.1 ETH)
      expect(await ethers.provider.getBalance(await treasury.getAddress())).to.equal(ethers.parseEther("0.1"));

      // 7. Withdraw and Claim
      const initialBalance = await ethers.provider.getBalance(creator1.address);
      await donationPool.connect(creator1).withdraw();
      await creatorFund.connect(creator1).claim();
      const finalBalance = await ethers.provider.getBalance(creator1.address);

      // Should have gained ~0.75 ETH (minus gas)
      expect(finalBalance - initialBalance).to.be.gt(ethers.parseEther("0.74"));
    });
  });

  describe("AssetMarketplace Royalties and Fees", function () {
    it("Should distribute platform fees to treasury", async function () {
      const assetId = 1;
      const price = ethers.parseEther("1.0");
      await marketplace.connect(creator1).listAsset(assetId, price, 500); // 5% royalty (unused in primary sale but recorded)

      await marketplace.connect(donor).purchase(assetId, { value: price });

      // Platform fee is 10% = 0.1 ETH
      expect(await ethers.provider.getBalance(await treasury.getAddress())).to.equal(ethers.parseEther("0.1"));
      // Creator gets 0.9 ETH
      expect(await marketplace.pendingWithdrawals(creator1.address)).to.equal(ethers.parseEther("0.9"));
    });
  });

  describe("Security Checks", function () {
    it("Should prevent non-owners from withdrawing from treasury", async function () {
      await expect(treasury.connect(creator1).withdraw(creator1.address, 100)).to.be.reverted;
    });
  });
});
