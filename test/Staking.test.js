const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
  let owner;
  let user;
  let other;

  let token;
  let staking;

  const INITIAL_BALANCE = ethers.utils.parseEther("1000");
  const STAKE_AMOUNT = ethers.utils.parseEther("100");

  beforeEach(async function () {
    [owner, user, other] = await ethers.getSigners();

    const SyntheticToken = await ethers.getContractFactory("SyntheticToken");
    token = await SyntheticToken.deploy(
      "Synthetic USD",
      "sUSD",
      owner.address
    );
    await token.deployed();

    await token.mint(user.address, INITIAL_BALANCE);

    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(token.address);
    await staking.deployed();

    await token.connect(user).approve(staking.address, INITIAL_BALANCE);
  });

  describe("stake()", function () {
    it("stakes tokens", async function () {
      await staking.connect(user).stake(STAKE_AMOUNT);

      expect(await staking.balances(user.address)).to.equal(STAKE_AMOUNT);
      expect(await token.balanceOf(staking.address)).to.equal(STAKE_AMOUNT);
    });

    it("emits Staked event", async function () {
      await expect(staking.connect(user).stake(STAKE_AMOUNT))
        .to.emit(staking, "Staked")
        .withArgs(user.address, STAKE_AMOUNT);
    });

    it("reverts on zero amount", async function () {
      await expect(
        staking.connect(user).stake(0)
      ).to.be.reverted;
    });

    it("reverts stake with zero amount", async function () {
      await expect(
        staking.connect(user).stake(0)
      ).to.be.reverted;
    });

  });

  describe("unStake()", function () {
    beforeEach(async function () {
      await staking.connect(user).stake(STAKE_AMOUNT);
    });

    it("unstakes tokens", async function () {
      await staking.connect(user).unStake(STAKE_AMOUNT);

      expect(await staking.balances(user.address)).to.equal(0);
      expect(await token.balanceOf(user.address)).to.equal(INITIAL_BALANCE);
    });

    it("emits UnStaked event", async function () {
      await expect(staking.connect(user).unStake(STAKE_AMOUNT))
        .to.emit(staking, "UnStaked")
        .withArgs(user.address, STAKE_AMOUNT);
    });
    it("reverts unstake with zero amount", async function () {
      await staking.connect(user).stake(STAKE_AMOUNT);
      await expect(
        staking.connect(user).unStake(0)
      ).to.be.reverted;
    });
  });

    describe("unStake() edge cases", function () {
      it("reverts unstake more than balance", async function () {
        await staking.connect(user).stake(STAKE_AMOUNT);

        await expect(
          staking.connect(user).unStake(STAKE_AMOUNT.add(1))
        ).to.be.reverted;
      });
    });

    describe("claim without staking", function () {
      it("reverts claim if user never staked", async function () {
        await expect(
          staking.connect(user).claim()
        ).to.be.reverted;
      });
          it("reverts claim if user never staked", async function () {
          await expect(
            staking.connect(user).claim()
          ).to.be.reverted;
        });
    });

  describe("rewards", function () {
    beforeEach(async function () {
      await staking.connect(user).stake(STAKE_AMOUNT);
    });

    it("accrues rewards over time", async function () {
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await staking.connect(user).claim();

      const balance = await token.balanceOf(user.address);
      expect(balance).to.be.gt(
        INITIAL_BALANCE.sub(STAKE_AMOUNT)
      );
    });
  });

  describe("updateRewards edge cases", function () {
    it("covers updateRewards branch when staked == 0 but timestamp exists", async function () {
      await staking.connect(user).stake(STAKE_AMOUNT);

      await ethers.provider.send("evm_increaseTime", [100]);
      await ethers.provider.send("evm_mine");

      await staking.connect(user).unStake(STAKE_AMOUNT);

      await ethers.provider.send("evm_increaseTime", [100]);
      await ethers.provider.send("evm_mine");

      await expect(
        staking.connect(user).claim()
      ).to.be.reverted;
    });
  });
});
