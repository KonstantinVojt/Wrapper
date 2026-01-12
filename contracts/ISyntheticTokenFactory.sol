// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISyntheticTokenFactory {

    struct SyntheticInfo {
        address token;
        string name;
        string symbol;
    }

    error UnknownSynthetic();

    event SyntheticCreated(address indexed token, address indexed owner, string name, string symbol);

}