import { expect } from "chai";
import { ethers } from "hardhat";
import { DonationPool, AnimaticaTreasury, CreatorFund } from "../typechain-types";

describe("Animatica Blockchain Infrastructure", function () {
  let pool: DonationPool;
  let fund: CreatorFund;
  let treasury: AnimaticaTreasury;
  let owner: any;
  let creator1: any;
  let creator2: any;
  let donor: any;

  beforeEach(async function () {
    [owner, creator1, creator2, donor] = await ethers.getSigners();

    const Treasury = await ethers.getContractFactory("AnimaticaTreasury");
    treasury = await Treasury.deploy();

    const Fund = await ethers.getContractFactory("CreatorFund");
    fund = await Fund.deploy();

    const Pool = await ethers.getContractFactory("DonationPool");
    pool = await Pool.deploy(await fund.getAddress(), await treasury.getAddress());
  });

  describe("DonationPool", function () {
    it("Should split donations correctly", async function () {
      const filmId = 1;
      await pool.registerFilm(filmId, [creator1.address, creator2.address], [5000, 5000]);

      const donationAmount = ethers.parseEther("1.0");

      const c1Initial = await ethers.provider.getBalance(creator1.address);
      const c2Initial = await ethers.provider.getBalance(creator2.address);
      const fundInitial = await ethers.provider.getBalance(await fund.getAddress());
      const treasuryInitial = await ethers.provider.getBalance(await treasury.getAddress());

      await pool.connect(donor).donate(filmId, { value: donationAmount });

      expect(await ethers.provider.getBalance(creator1.address)).to.equal(c1Initial + ethers.parseEther("0.35"));
      expect(await ethers.provider.getBalance(creator2.address)).to.equal(c2Initial + ethers.parseEther("0.35"));
      expect(await ethers.provider.getBalance(await fund.getAddress())).to.equal(fundInitial + ethers.parseEther("0.2"));
      expect(await ethers.provider.getBalance(await treasury.getAddress())).to.equal(treasuryInitial + ethers.parseEther("0.1"));
    });
  });

  describe("CreatorFund", function () {
    it("Should distribute rewards fairly using reward-per-share model", async function () {
      await fund.updateWeight(creator1.address, 100);
      await fund.updateWeight(creator2.address, 300);

      await owner.sendTransaction({
        to: await fund.getAddress(),
        value: ethers.parseEther("1.0"),
      });

      expect(await fund.getClaimable(creator1.address)).to.equal(ethers.parseEther("0.25"));
      expect(await fund.getClaimable(creator2.address)).to.equal(ethers.parseEther("0.75"));

      await fund.connect(creator1).claim();
      expect(await fund.getClaimable(creator1.address)).to.equal(0);

      await owner.sendTransaction({
        to: await fund.getAddress(),
        value: ethers.parseEther("1.0"),
      });

      expect(await fund.getClaimable(creator1.address)).to.equal(ethers.parseEther("0.25"));
      expect(await fund.getClaimable(creator2.address)).to.equal(ethers.parseEther("1.5"));
    });
  });
});
