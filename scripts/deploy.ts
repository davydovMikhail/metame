import { ethers } from "hardhat";

async function main() {
  
  const Metame = await ethers.getContractFactory("Metame");

  const metame = await Metame.deploy();

  await metame.deployed();

  console.log(`Metame token contract deployed to ${metame.address}`);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
