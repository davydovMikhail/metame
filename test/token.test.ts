import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import * as mocha from "mocha-steps";
import { ERC20 } from '../typechain-types';

describe('Token test', async () => {
    let token: Contract;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;

    const primaryTotalSupply = parseEther("10000");


    beforeEach(async () => {
        [owner, user1, user2, user3] = await ethers.getSigners();
    });

    mocha.step("Deploy token", async function () {
        let TokenF = await ethers.getContractFactory("ThisToken");
        token = await TokenF.connect(owner).deploy('Token', 'MTK', primaryTotalSupply);
    });

    mocha.step("Check constant", async function () {
        expect(await token.name()).to.equal("Token");
        expect(await token.symbol()).to.equal("MTK");
        expect(await token.decimals()).to.equal(18);
    });

    mocha.step("Check allownce fumction", async function () {
        expect(await token.allowance(owner.address, user1.address)).to.equal(0);
        const valueForApprove = parseEther("100");
        await token.connect(owner).approve(user1.address, valueForApprove);
        expect(await token.allowance(owner.address, user1.address)).to.equal(valueForApprove);
    });

    mocha.step("Check transferFrom function", async function () {
        const valueForApprove = parseEther("100")
        const valueForTransfer = parseEther("30")
        await expect(token.connect(user1).transferFrom(owner.address, user2.address, valueForTransfer.mul(10))).to.be.revertedWith("ERC20: insufficient allowance")
        await token.connect(user1).transferFrom(owner.address, user2.address, valueForTransfer);
        expect(await token.balanceOf(user2.address)).to.equal(valueForTransfer);
        expect(await token.balanceOf(owner.address)).to.equal(primaryTotalSupply.sub(valueForTransfer));
        expect(await token.allowance(owner.address, user1.address)).to.equal(valueForApprove.sub(valueForTransfer));
    });

    mocha.step('Check transfer function', async function () {
        const valueForTransfer1 = parseEther("100")
        const valueForTransfer2 = parseEther("80")
        const valueForTransfer3 = parseEther("60")
        await token.connect(owner).transfer(user1.address, valueForTransfer1);
        expect(await token.balanceOf(user1.address)).to.equal(valueForTransfer1);
        await token.connect(user1).transfer(user2.address, valueForTransfer2)
        expect(await token.balanceOf(user1.address)).to.equal(valueForTransfer1.sub(valueForTransfer2));
        await token.connect(user2).transfer(user3.address, valueForTransfer3);
        expect(await token.balanceOf(user3.address)).to.equal(valueForTransfer3);
    });
})