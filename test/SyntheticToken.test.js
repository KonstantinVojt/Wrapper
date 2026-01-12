const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SyntheticToken", function () {
  let SyntheticToken;
  let token;
  let owner;
  let user;

  const NAME = "Synthetic USD";
  const SYMBOL = "sUSD";
  const AMOUNT = ethers.utils.parseEther("100");


  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    SyntheticToken = await ethers.getContractFactory("SyntheticToken");
    token = await SyntheticToken.deploy(NAME, SYMBOL, owner.address);
    await token.deployed();
  });

  describe("Deployment", function () {
    it("sets correct name and symbol", async function () {
      expect(await token.name()).to.equal(NAME);
      expect(await token.symbol()).to.equal(SYMBOL);
    });

    it("sets correct owner (factory)", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("owner can mint tokens", async function () {
      await token.mint(user.address, AMOUNT);

      expect(await token.balanceOf(user.address)).to.equal(AMOUNT);
    });

    it("emits Minted event on mint", async function () {
      await expect(token.mint(user.address, AMOUNT))
        .to.emit(token, "Minted")
        .withArgs(user.address, AMOUNT);
    });

    it("non-owner cannot mint", async function () {
      await expect(
        token.connect(user).mint(user.address, AMOUNT)
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await token.mint(user.address, AMOUNT);
    });

    it("owner can burn tokens", async function () {
      await token.burn(user.address, AMOUNT);

      expect(await token.balanceOf(user.address)).to.equal(0);
    });

    it("emits Burned event on burn", async function () {
      await expect(token.burn(user.address, AMOUNT))
        .to.emit(token, "Burned")
        .withArgs(user.address, AMOUNT);
    });

    it("non-owner cannot burn", async function () {
      await expect(
        token.connect(user).burn(user.address, AMOUNT)
      ).to.be.reverted;
    });
  });
});
