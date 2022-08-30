import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";

async function main() {
  
  const Metame = await ethers.getContractFactory("Metame");

  const initialSupply = parseEther(process.env.INITIAL_SUPPLY as string)
  
  const metame = await Metame.deploy(initialSupply);

  await metame.deployed();

  console.log(`Metame token contract deployed to ${metame.address}`);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
