// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract TheSentinelProtocol is EIP712 {
    using ECDSA for bytes32;

    address public sentinelSigner;
    bool public paused;
    
    mapping(bytes32 => bool) public executedNonces;

    bytes32 private constant ACTION_TYPEHASH = keccak256(
        "SentinelAction(address target,bytes32 payloadHash,uint256 nonce,uint256 deadline)"
    );

    error SentinelPaused();
    error SentinelUnauthorized();
    error SentinelExpired();
    error SentinelNonceReused();

    event EmergencyPauseTriggered(address indexed reporter);
    event EmergencyUnpaused(address indexed admin);

    constructor(address _sentinelSigner) EIP712("TheSentinelSecurityProtocol", "1.0.0") {
        sentinelSigner = _sentinelSigner;
    }

    modifier onlySentinelActive() {
        if (paused) revert SentinelPaused();
        _;
    }

    function verifySentinelPermission(
        address target,
        bytes32 payloadHash,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) public onlySentinelActive {
        if (block.timestamp > deadline) revert SentinelExpired();
        
        bytes32 nonceKey = keccak256(abi.encodePacked(msg.sender, nonce));
        if (executedNonces[nonceKey]) revert SentinelNonceReused();

        bytes32 structHash = keccak256(
            abi.encode(ACTION_TYPEHASH, target, payloadHash, nonce, deadline)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        
        address recovered = digest.recover(signature);
        if (recovered != sentinelSigner) revert SentinelUnauthorized();

        executedNonces[nonceKey] = true;
    }

    function triggerEmergencyPause() external {
        paused = true;
        emit EmergencyPauseTriggered(msg.sender);
    }

    function setPaused(bool _state) external {
        if (msg.sender != sentinelSigner) revert SentinelUnauthorized();
        paused = _state;
        if (!_state) emit EmergencyUnpaused(msg.sender);
    }
}
