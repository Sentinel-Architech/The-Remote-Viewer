// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {TheSentinelProtocol} from "./security/TheSentinelProtocol.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract RemoteViewerVault {
    TheSentinelProtocol public sentinel;

    mapping(address token => mapping(address account => uint256)) public tokenBalances;
    mapping(address token => uint256) public totalTokenAssets;

    error InsufficientBalance();

    constructor(address _sentinel) {
        sentinel = TheSentinelProtocol(_sentinel);
    }

    function depositToken(
        address token, 
        uint256 amount,
        uint256 nonce,
        uint256 deadline,
        bytes calldata sentinelSignature
    ) external {
        if (amount == 0) return;

        bytes32 payloadHash = keccak256(abi.encodePacked("DEPOSIT", token, amount, msg.sender));
        sentinel.verifySentinelPermission(
            address(this),
            payloadHash,
            nonce,
            deadline,
            sentinelSignature
        );

        tokenBalances[token][msg.sender] += amount;
        totalTokenAssets[token] += amount;

        MockERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    function withdrawToken(address token, uint256 amount) external {
        if (tokenBalances[token][msg.sender] < amount) revert InsufficientBalance();

        tokenBalances[token][msg.sender] -= amount;
        totalTokenAssets[token] -= amount;

        MockERC20(token).transfer(msg.sender, amount);
    }
}
