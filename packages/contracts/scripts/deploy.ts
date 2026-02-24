import { ethers } from "hardhat";

async function main() {
  // 1. Deploy Treasury
  const Treasury = await ethers.getContractFactory("AnimaticaTreasury");
  const treasury = await Treasury.deploy();

  // 2. Deploy Creator Fund
  const Fund = await ethers.getContractFactory("CreatorFund");
  const fund = await Fund.deploy();

  // 3. Deploy Donation Pool
  const Pool = await ethers.getContractFactory("DonationPool");
  const pool = await Pool.deploy(fund.target, treasury.target);

  // 4. Deploy Asset Marketplace
  const Market = await ethers.getContractFactory("AssetMarketplace");
  const market = await Market.deploy(treasury.target);

  console.log("Treasury:", treasury.target);
  console.log("CreatorFund:", fund.target);
  console.log("DonationPool:", pool.target);
  console.log("AssetMarketplace:", market.target);
}

main().catch(console.error);
