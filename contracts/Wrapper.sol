// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC20Like.sol";

contract Wrapper is Ownable, ERC721{
    
    error NotNFTowner();

    event Wrapped(address indexed user, uint256 indexed tokenId, uint256 amount);

    event Unwrapped(address indexed user, uint256 indexed tokenId, uint256 amount);


    IERC20Like public token;

    uint256 public constant TOKENS_PER_NFT = 100 ether;
    uint256 private _tokenIdCounter;

    constructor (address tokenAddress) ERC721("Wrapped Synthetic NFT", "wSYN") Ownable(msg.sender) {
        token = IERC20Like(tokenAddress);
    }

    function wrap () external {
        token.transferFrom(msg.sender, address(this), TOKENS_PER_NFT);

        _tokenIdCounter++;
        _safeMint(msg.sender, _tokenIdCounter);
        emit Wrapped(msg.sender, _tokenIdCounter, TOKENS_PER_NFT);
    }

    function unwrap (uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender) revert NotNFTowner();

        _burn(tokenId);
        
        token.transfer(msg.sender, TOKENS_PER_NFT);

        emit Unwrapped(msg.sender, tokenId, TOKENS_PER_NFT);

    }

}