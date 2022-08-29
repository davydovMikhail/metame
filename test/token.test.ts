import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import * as mocha from "mocha-steps";
import { Metame } from '../typechain-types';

describe('Token test', async () => {
    let token: Metame;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;
    let admin: SignerWithAddress;
    let pauser: SignerWithAddress;
    let minter: SignerWithAddress;
    let burner: SignerWithAddress;
    let controller: SignerWithAddress;
    let whitelistUser1: SignerWithAddress;
    let whitelistUser2: SignerWithAddress;
    let whitelistUser3: SignerWithAddress;


    const primaryTotalSupply = parseEther("1000000");


    beforeEach(async () => {
        [ owner, user1, user2, user3, admin, pauser, minter, burner, controller, whitelistUser1, whitelistUser2, whitelistUser3 ] = await ethers.getSigners();
    });

    mocha.step("Deploy token", async function () {
        let TokenF = await ethers.getContractFactory("Metame");
        token = await TokenF.connect(owner).deploy();
    });

    mocha.step("Check constant", async function () {
        expect(await token.name()).to.equal("Metame token");
        expect(await token.symbol()).to.equal("MTM");
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

    mocha.step("Check AccessControll for ADMIN_ROLE", async function () {
        await expect(token.connect(user1).grantRole((await token.ADMIN_ROLE()), admin.address)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.DEFAULT_ADMIN_ROLE()).toLowerCase()}`);
        await expect(token.connect(user1).grantRole((await token.PAUSER_ROLE()), controller.address)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.ADMIN_ROLE()).toLowerCase()}`);
        await expect(token.connect(user1).grantRole((await token.MINTER_ROLE()), controller.address)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.ADMIN_ROLE()).toLowerCase()}`);
        await expect(token.connect(user1).grantRole((await token.BURNER_ROLE()), controller.address)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.ADMIN_ROLE()).toLowerCase()}`);
        await expect(token.connect(user1).grantRole((await token.CONTROLLER_ROLE()), controller.address)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.ADMIN_ROLE()).toLowerCase()}`);
    });

    mocha.step("Grant roles", async function () {
        await token.connect(owner).grantRole((await token.ADMIN_ROLE()), admin.address);
        await token.connect(admin).grantRole((await token.PAUSER_ROLE()), pauser.address);
        await token.connect(admin).grantRole((await token.MINTER_ROLE()), minter.address);
        await token.connect(admin).grantRole((await token.BURNER_ROLE()), burner.address);
        await token.connect(admin).grantRole((await token.CONTROLLER_ROLE()), controller.address);
    });

    mocha.step("Check getRoleAdmin function", async function () {
        const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
        const ADMIN_ROLE = await token.ADMIN_ROLE();
        const PAUSER_ROLE = await token.PAUSER_ROLE();
        const MINTER_ROLE = await token.MINTER_ROLE();
        const BURNER_ROLE = await token.BURNER_ROLE();
        const CONTROLLER_ROLE = await token.CONTROLLER_ROLE();
        
        expect(await token.getRoleAdmin(ADMIN_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
        expect(await token.getRoleAdmin(PAUSER_ROLE)).to.equal(ADMIN_ROLE);
        expect(await token.getRoleAdmin(MINTER_ROLE)).to.equal(ADMIN_ROLE);
        expect(await token.getRoleAdmin(BURNER_ROLE)).to.equal(ADMIN_ROLE);
        expect(await token.getRoleAdmin(CONTROLLER_ROLE)).to.equal(ADMIN_ROLE);
    });

    mocha.step("Check AccessControl for changeBlocklist function", async function () {
        await expect(token.connect(user1).changeBlocklist(user2.address, true)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.CONTROLLER_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call changeBlocklist function", async function () {
        await token.connect(controller).changeBlocklist(user1.address, true);
        await token.connect(controller).changeBlocklist(user2.address, true);
    });

    mocha.step("Check blocklist mapping", async function () {
        expect(await token.blocklist(user1.address)).to.equal(true);
        expect(await token.blocklist(user2.address)).to.equal(true);
        expect(await token.blocklist(user3.address)).to.equal(false);
    });
    
    mocha.step("Check transfer for blocklisted users", async function () {
        await expect(token.connect(user1).transfer(user3.address, parseEther('10'))).to.be.revertedWith("You are blocklisted.");
        await expect(token.connect(user2).transfer(user3.address, parseEther('10'))).to.be.revertedWith("You are blocklisted.");
        await token.connect(user1).approve(user2.address, parseEther('10'));
        await token.connect(user2).approve(user1.address, parseEther('10'));
        await expect(token.connect(user2).transferFrom(user1.address, user3.address, parseEther('10'))).to.be.revertedWith("You are blocklisted.");
        await expect(token.connect(user1).transferFrom(user2.address, user3.address, parseEther('10'))).to.be.revertedWith("You are blocklisted.");
    });

    mocha.step("Check AccessControl for changeWhitelist function", async function () {
        await expect(token.connect(user1).changeWhitelist(whitelistUser1.address, true)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.CONTROLLER_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call changeWhitelist function", async function () {
        await token.connect(controller).changeWhitelist(whitelistUser1.address, true);
        await token.connect(controller).changeWhitelist(whitelistUser2.address, true);
        await token.connect(controller).changeWhitelist(whitelistUser3.address, true);
        await token.connect(controller).changeWhitelist(owner.address, true);
    });

    mocha.step("Check whitelist mapping", async function () {
        expect(await token.whitelist(whitelistUser1.address)).to.equal(true);
        expect(await token.whitelist(whitelistUser2.address)).to.equal(true);
        expect(await token.whitelist(whitelistUser3.address)).to.equal(true);
        expect(await token.whitelist(owner.address)).to.equal(true);
        expect(await token.whitelist(user1.address)).to.equal(false);        
    });

    mocha.step("Check AccessControll for pause function", async function () {
        await expect(token.connect(user1).pause()).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.PAUSER_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call pause function", async function () {
        await token.connect(pauser).pause();
    });

    mocha.step("Check transfer for not whitelisted users", async function () {
        await expect(token.connect(user3).transfer(user1.address, parseEther('10'))).to.be.revertedWith("You are not whitelisted.");
        await token.connect(user3).approve(burner.address, parseEther('10'));
        await expect(token.connect(burner).transferFrom(user3.address, user1.address, parseEther('10'))).to.be.revertedWith("You are not whitelisted.");
    });

    mocha.step("Replenishment of user account from whitelist", async function () {
        const amount = parseEther('10000');
        await token.connect(owner).transfer(whitelistUser1.address, amount);
        await token.connect(owner).transfer(whitelistUser2.address, amount);
        await token.connect(owner).transfer(whitelistUser3.address, amount);
    });

    mocha.step("Check balances whitelist users after transfers", async function () {
        const amount = parseEther('10000');
        expect(await token.balanceOf(whitelistUser1.address)).to.equal(amount);
        expect(await token.balanceOf(whitelistUser2.address)).to.equal(amount);        
        expect(await token.balanceOf(whitelistUser3.address)).to.equal(amount);        
    });

    mocha.step("Check transferFrom function for whitelist users", async function () {
        await token.connect(whitelistUser1).approve(whitelistUser2.address, parseEther('2000'));
        await token.connect(whitelistUser2).transferFrom(whitelistUser1.address, whitelistUser3.address, parseEther('2000'));
    });

    mocha.step("Check balances whitelist users after transferFrom", async function () {
        expect(await token.balanceOf(whitelistUser1.address)).to.equal(parseEther('8000'));
        expect(await token.balanceOf(whitelistUser3.address)).to.equal(parseEther('12000'));
    });

    mocha.step("Check AccessControll for unpause function", async function () {
        await expect(token.connect(user1).unpause()).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.PAUSER_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call unpause function", async function () {
        await token.connect(pauser).unpause();
    });

    mocha.step("Check AccessControll for mint function", async function () {
        await expect(token.connect(user1).mint(user1.address, parseEther('1000'))).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.MINTER_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call mint function", async function () {
        await token.connect(minter).mint(whitelistUser1.address, parseEther('3000'));
        await token.connect(minter).mint(whitelistUser2.address, parseEther('3000'));
        await token.connect(minter).mint(whitelistUser3.address, parseEther('3000'));
    });

    mocha.step("Check balances after mint", async function () {
        expect(await token.balanceOf(whitelistUser1.address)).to.equal(parseEther('11000'));
        expect(await token.balanceOf(whitelistUser2.address)).to.equal(parseEther('13000'));
        expect(await token.balanceOf(whitelistUser3.address)).to.equal(parseEther('15000'));
    });

    mocha.step("Check total supply after mint", async function () {
        expect(await token.totalSupply()).to.equal(parseEther('1009000'));
    });

    mocha.step("Check AccessControll for burn function", async function () {
        await expect(token.connect(user1).burn(user1.address, parseEther('1000'))).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.BURNER_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call burn function", async function () {
        await token.connect(burner).burn(whitelistUser1.address, parseEther('1000'));
        await token.connect(burner).burn(whitelistUser2.address, parseEther('1000'));
        await token.connect(burner).burn(whitelistUser3.address, parseEther('1000'));  
    });

    mocha.step("Check total supply after burn", async function () {
        expect(await token.totalSupply()).to.equal(parseEther('1006000'));
    });

    mocha.step("Check balances after burn", async function () {
        expect(await token.balanceOf(whitelistUser1.address)).to.equal(parseEther('10000'));
        expect(await token.balanceOf(whitelistUser2.address)).to.equal(parseEther('12000'));
        expect(await token.balanceOf(whitelistUser3.address)).to.equal(parseEther('14000'));
    });
});