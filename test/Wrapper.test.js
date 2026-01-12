const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Wrapper", function () {
  let owner;
  let user;
  let other;

  let token;
  let wrapper;

  const TOKENS_PER_NFT = ethers.utils.parseEther("100");

  beforeEach(async function () {
    [owner, user, other] = await ethers.getSigners();

    // Deploy SyntheticToken
    const SyntheticToken = await ethers.getContractFactory("SyntheticToken");
    token = await SyntheticToken.deploy(
      "Synthetic USD",
      "sUSD",
      owner.address
    );
    await token.deployed();

    // Mint tokens to user
    await token.mint(user.address, TOKENS_PER_NFT);

    // Deploy Wrapper
    const Wrapper = await ethers.getContractFactory("Wrapper");
    wrapper = await Wrapper.deploy(token.address);
    await wrapper.deployed();

    // User approves Wrapper
    await token.connect(user).approve(wrapper.address, TOKENS_PER_NFT);
  });

  describe("wrap()", function () {
    it("transfers tokens and mints NFT", async function () {
      await wrapper.connect(user).wrap();

      // Token balance moved to wrapper
      expect(await token.balanceOf(wrapper.address)).to.equal(TOKENS_PER_NFT);
      expect(await token.balanceOf(user.address)).to.equal(0);

      // NFT minted to user
      expect(await wrapper.ownerOf(1)).to.equal(user.address);
    });

    it("emits Wrapped event", async function () {
      await expect(wrapper.connect(user).wrap())
        .to.emit(wrapper, "Wrapped")
        .withArgs(user.address, 1, TOKENS_PER_NFT);
    });
  });

  describe("unwrap()", function () {
    beforeEach(async function () {
      await wrapper.connect(user).wrap();
    });

    it("burns NFT and returns tokens", async function () {
      await wrapper.connect(user).unwrap(1);

      // Tokens returned
      expect(await token.balanceOf(user.address)).to.equal(TOKENS_PER_NFT);
      expect(await token.balanceOf(wrapper.address)).to.equal(0);

      // NFT burned
      await expect(wrapper.ownerOf(1)).to.be.reverted;
    });

    it("emits Unwrapped event", async function () {
      await expect(wrapper.connect(user).unwrap(1))
        .to.emit(wrapper, "Unwrapped")
        .withArgs(user.address, 1, TOKENS_PER_NFT);
    });

    it("reverts if called by non-owner", async function () {
      await expect(
        wrapper.connect(other).unwrap(1)
      ).to.be.reverted;
    });
  });
});
