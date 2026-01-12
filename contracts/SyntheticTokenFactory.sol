// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SyntheticToken.sol";
import "./ISyntheticTokenFactory.sol";

contract SyntheticTokenFactory is Ownable, ISyntheticTokenFactory {

    SyntheticInfo[] public synthetics;
    mapping(address => bool) public isSynthetic;

    constructor() Ownable(msg.sender) {}

    function createSynthetic(string calldata name, string calldata symbol) external onlyOwner returns (address) {
        SyntheticToken token = new SyntheticToken(
            name,
            symbol,
            address(this)
        );

        synthetics.push(
            SyntheticInfo({
                token: address(token),
                name: name,
                symbol: symbol
            })
        );

        isSynthetic[address(token)] = true;

        emit SyntheticCreated(address(token), msg.sender, name, symbol);
        return address(token);
    }

    function mint(address token, address to, uint256 amount) external onlyOwner {
        if (!isSynthetic[token]) revert UnknownSynthetic();
        SyntheticToken(token).mint(to, amount);
    }

    function burn(address token,address from,uint256 amount) external onlyOwner {
        if (!isSynthetic[token]) revert UnknownSynthetic();
        SyntheticToken(token).burn(from, amount);
    }

    function syntheticsCount() external view returns (uint256) {
        return synthetics.length;
    }
}