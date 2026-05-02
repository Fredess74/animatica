import { expect } from "chai";
import { ethers } from "hardhat";

describe("Blockchain Audit", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Treasury = await ethers.getContractFactory("AnimaticaTreasury");
    const treasury = await Treasury.deploy();

    const Fund = await ethers.getContractFactory("CreatorFund");
    const fund = await Fund.deploy();

    const Pool = await ethers.getContractFactory("DonationPool");
    const pool = await Pool.deploy(fund.target, treasury.target);

    const Market = await ethers.getContractFactory("AssetMarketplace");
    const market = await Market.deploy(treasury.target);

    return { treasury, fund, pool, market, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy all contracts", async function () {
      const { treasury, fund, pool, market } = await deployFixture();
      expect(treasury.target).to.properAddress;
      expect(fund.target).to.properAddress;
      expect(pool.target).to.properAddress;
      expect(market.target).to.properAddress;
    });
  });

  describe("Access Control", function () {
    it("Should restrict registerFilm to owner", async function () {
      const { pool, otherAccount } = await deployFixture();
      await expect(
        pool.connect(otherAccount).registerFilm(1, [otherAccount.address], [10000])
      ).to.be.reverted;
    });

    it("Should restrict updateWeight to owner", async function () {
      const { fund, otherAccount } = await deployFixture();
      await expect(
        fund.connect(otherAccount).updateWeight(otherAccount.address, 100)
      ).to.be.reverted;
    });

    it("Should restrict withdraw to owner", async function () {
      const { treasury, otherAccount } = await deployFixture();
      await expect(
        treasury.connect(otherAccount).withdraw(otherAccount.address, 100)
      ).to.be.reverted;
    });
  });
});
