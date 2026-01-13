const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FullFlow integration test", function () {
  let owner, user;

  let factory;
  let token;
  let wrapper;
  let staking;

  const MINT_AMOUNT = ethers.utils.parseEther("1000");
  const TOKENS_PER_NFT = ethers.utils.parseEther("100");
  const STAKE_AMOUNT = ethers.utils.parseEther("200");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    /* ---------------- Factory ---------------- */

    const Factory = await ethers.getContractFactory("SyntheticTokenFactory");
    factory = await Factory.deploy();
    await factory.deployed();

    const tx = await factory.createSynthetic("Synthetic USD", "sUSD");
    const receipt = await tx.wait();

    const syntheticAddress = receipt.events.find(
      (e) => e.event === "SyntheticCreated"
    ).args.token;

    token = await ethers.getContractAt("SyntheticToken", syntheticAddress);

    /* ---------------- Mint tokens ---------------- */

    await factory.mint(token.address, user.address, MINT_AMOUNT);

    /* ---------------- Wrapper ---------------- */

    const Wrapper = await ethers.getContractFactory("Wrapper");
    wrapper = await Wrapper.deploy(token.address);
    await wrapper.deployed();

    /* ---------------- Staking ---------------- */

    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(token.address);
    await staking.deployed();

    /* ---------------- Approvals ---------------- */

    await token.connect(user).approve(wrapper.address, MINT_AMOUNT);
    await token.connect(user).approve(staking.address, MINT_AMOUNT);
  });

  it("full user flow works correctly", async function () {
    /* ---------- wrap ---------- */

    await wrapper.connect(user).wrap();

    expect(await wrapper.balanceOf(user.address)).to.equal(1);
    expect(await token.balanceOf(user.address)).to.equal(
      MINT_AMOUNT.sub(TOKENS_PER_NFT)
    );

    /* ---------- unwrap ---------- */

    await wrapper.connect(user).unwrap(1);

    expect(await wrapper.balanceOf(user.address)).to.equal(0);
    expect(await token.balanceOf(user.address)).to.equal(MINT_AMOUNT);

    /* ---------- stake ---------- */

    await staking.connect(user).stake(STAKE_AMOUNT);

    expect(await staking.balances(user.address)).to.equal(STAKE_AMOUNT);

    /* ---------- time passes ---------- */

    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    /* ---------- claim ---------- */

    await staking.connect(user).claim();

    const finalBalance = await token.balanceOf(user.address);

    expect(finalBalance).to.be.gt(
      MINT_AMOUNT.sub(STAKE_AMOUNT)
    );
  });
});
