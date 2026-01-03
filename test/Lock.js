const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Lock", function () {
  let lock, owner, otherAccount;
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const ONE_GWEI = 1_000_000_000;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();

    // Получаем текущий блок для корректного времени
    const latestBlock = await ethers.provider.getBlock("latest");
    const unlockTime = latestBlock.timestamp + ONE_YEAR_IN_SECS;

    // Деплой контракта
    const Lock = await ethers.getContractFactory("Lock");
    lock = await Lock.deploy(unlockTime, { value: ONE_GWEI });
    await lock.deployed();

    // Сохраняем данные для тестов
    lock.unlockTimeValue = await lock.unlockTime();
    lock.lockedAmount = ONE_GWEI;
  });

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      expect(await lock.unlockTime()).to.equal(lock.unlockTimeValue);
    });

    it("Should set the right owner", async function () {
      expect(await lock.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds to lock", async function () {
      expect(await ethers.provider.getBalance(lock.address)).to.equal(
        lock.lockedAmount
      );
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      const latestBlock = await ethers.provider.getBlock("latest");
      const Lock = await ethers.getContractFactory("Lock");
      await expect(
        Lock.deploy(latestBlock.timestamp, { value: 1 })
      ).to.be.revertedWith("Unlock time should be in the future");
    });
  });

  describe("Withdrawals", function () {
    it("Should revert if called too soon", async function () {
      await expect(lock.withdraw()).to.be.revertedWith(
        "You can't withdraw yet"
      );
    });

    it("Should revert if called from another account", async function () {
      // Увеличиваем время до unlockTime
      const diff = lock.unlockTimeValue.toNumber() - (await ethers.provider.getBlock("latest")).timestamp;
      await ethers.provider.send("evm_increaseTime", [diff]);
      await ethers.provider.send("evm_mine");

      await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
        "You aren't the owner"
      );
    });

    it("Should succeed if unlockTime has arrived and owner calls it", async function () {
      const diff = lock.unlockTimeValue.toNumber() - (await ethers.provider.getBlock("latest")).timestamp;
      await ethers.provider.send("evm_increaseTime", [diff]);
      await ethers.provider.send("evm_mine");

      await expect(lock.withdraw()).not.to.be.reverted;
    });

    it("Should transfer funds to the owner", async function () {
      const diff = lock.unlockTimeValue.toNumber() - (await ethers.provider.getBlock("latest")).timestamp;
      await ethers.provider.send("evm_increaseTime", [diff]);
      await ethers.provider.send("evm_mine");

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const lockBalanceBefore = await ethers.provider.getBalance(lock.address);

      const tx = await lock.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const lockBalanceAfter = await ethers.provider.getBalance(lock.address);

      expect(lockBalanceAfter).to.equal(0);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.add(lock.lockedAmount).sub(gasUsed));
    });
  });
});
