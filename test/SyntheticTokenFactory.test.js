const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SyntheticTokenFactory", function () {
  let owner;
  let user;
  let other;

  let factory;
  let token;

  const NAME = "Synthetic USD";
  const SYMBOL = "sUSD";
  const AMOUNT = ethers.utils.parseEther("100");

  beforeEach(async function () {
    [owner, user, other] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SyntheticTokenFactory");
    factory = await Factory.deploy();
    await factory.deployed();
  });

  describe("createSynthetic()", function () {
    it("creates a synthetic token", async function () {
      const tx = await factory.createSynthetic(NAME, SYMBOL);
      const receipt = await tx.wait();

      const event = receipt.events.find(e => e.event === "SyntheticCreated");
      const tokenAddress = event.args.token;

      expect(tokenAddress).to.properAddress;
      expect(await factory.isSynthetic(tokenAddress)).to.equal(true);
    });

    it("increments synthetics count", async function () {
      await factory.createSynthetic(NAME, SYMBOL);
      await factory.createSynthetic("Synthetic EUR", "sEUR");

      expect(await factory.syntheticsCount()).to.equal(2);
    });

    it("sets factory as token owner", async function () {
      const tx = await factory.createSynthetic(NAME, SYMBOL);
      const receipt = await tx.wait();
      const tokenAddress = receipt.events.find(
        e => e.event === "SyntheticCreated"
      ).args.token;

      const token = await ethers.getContractAt("SyntheticToken", tokenAddress);
      expect(await token.owner()).to.equal(owner.address);
    });

    it("emits SyntheticCreated event", async function () {
      const tx = await factory.createSynthetic(NAME, SYMBOL);
      const receipt = await tx.wait();

      const event = receipt.events.find(
        e => e.event === "SyntheticCreated"
      );

      expect(event).to.not.be.undefined;

      const tokenAddress = event.args[0];
      const creator = event.args[1];
      const name = event.args[2];
      const symbol = event.args[3];

      expect(tokenAddress).to.properAddress;
      expect(creator).to.equal(owner.address);
      expect(name).to.equal(NAME);
      expect(symbol).to.equal(SYMBOL);
    });



    it("only owner can create synthetic", async function () {
      await expect(
        factory.connect(user).createSynthetic(NAME, SYMBOL)
      ).to.be.reverted;
    });
  });
});
