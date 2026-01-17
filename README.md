# Synthetic Token Ecosystem

## Overview

This project implements a **synthetic token ecosystem** built with Solidity and Hardhat.
It demonstrates interaction between multiple smart contracts, comprehensive unit testing, and a full end-to-end integration flow.

The system is designed as a clean educational and portfolio-grade example of:

* ERC20 token mechanics
* Factory pattern
* ERC721 wrapping
* Token staking with time-based rewards
* Proper testing and coverage

---

## Architecture

### Smart Contracts

| Contract                | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `SyntheticToken`        | ERC20 synthetic token with mint and burn functionality |
| `SyntheticTokenFactory` | Factory that deploys and tracks synthetic tokens       |
| `Wrapper`               | ERC721 NFT wrapper that locks ERC20 tokens             |
| `Staking`               | Staking contract with linear reward accrual            |
| `FullFlow`              | Integration test covering the complete lifecycle       |

---

## Contracts Description

### SyntheticToken

* ERC20 implementation based on OpenZeppelin
* Supports `mint` and `burn`
* Ownership is transferred to the factory at deployment

### SyntheticTokenFactory

* Deploys new `SyntheticToken` contracts
* Keeps registry of created synthetics
* Emits events on creation

### Wrapper

* Wraps ERC20 tokens into ERC721 NFTs
* Supports gifting NFTs (`wrapTo`)
* Allows unwrapping back to ERC20
* Uses immutable token reference
* Supports configurable token amount per NFT

### Staking

* Users can stake ERC20 tokens
* Rewards accrue proportionally to time and amount
* Supports unstake and claim operations

---

## Project Structure

```
contracts/
 ├─ SyntheticToken.sol
 ├─ SyntheticTokenFactory.sol
 ├─ Wrapper.sol
 ├─ Staking.sol
 └─ interfaces/
     ├─ IERC20Like.sol
     ├─ ISyntheticToken.sol
     ├─ ISyntheticTokenFactory.sol
     └─ IStaking.sol

test/
 ├─ SyntheticToken.test.js
 ├─ SyntheticTokenFactory.test.js
 ├─ Wrapper.test.js
 ├─ Staking.test.js
 └─ integration/
     └─ FullFlow.test.js
```

---

## Installation

```bash
git clone <repository-url>
cd <repository-name>
npm install
```

---

## Compile Contracts

```bash
npx hardhat compile
```

---

## Run Tests

```bash
npx hardhat test
```

All unit tests and integration tests should pass.

---

## Test Coverage

```bash
npx hardhat coverage
```

Coverage goals:

* 100% statements
* 100% branches
* Full coverage for business logic

---

## Full Integration Flow

The `FullFlow` integration test verifies the complete user journey:

1. Deploy factory
2. Create synthetic token
3. Mint tokens
4. Wrap tokens into NFT
5. Unwrap NFT back to tokens
6. Stake tokens
7. Simulate time passing
8. Claim staking rewards

This confirms correct interaction between all contracts.

---

## Technologies Used

* Solidity ^0.8.x
* OpenZeppelin Contracts v5
* Hardhat
* Ethers.js
* Mocha & Chai
* Hardhat Coverage

---

## Security Considerations

* OpenZeppelin audited contracts
* Custom errors for gas efficiency
* Strict access control via `Ownable`
* Immutable variables for critical configuration
* No unsafe external calls

---

## License

MIT

---

## Author

This project was built as a learning and portfolio example for Solidity and Web3 smart contract development.
