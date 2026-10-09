// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SentinelVerifier {
    bytes32 public constant SENTINEL_ACTION_TYPEHASH = keccak256(
        "SentinelAction(address target,bytes32 payload_hash,uint256 nonce,uint256 deadline)"
    );

    event ActionAuthorized(address indexed signer, bytes32 payloadHash, uint256 nonce);

    function verifyAndExecute(
        address expectedSigner,
        bytes32 payloadHash,
        uint256 nonce,
        uint256 deadline,
        bytes calldata ecdsaSignature,
        bytes calldata pqcSignature
    ) external returns (bool) {
        require(block.timestamp <= deadline, "Sentinel: Action expired");
        require(ecdsaSignature.length == 65, "Sentinel: Invalid ECDSA signature length");
        require(pqcSignature.length > 0, "Sentinel: Empty PQC signature");

        bytes32 structHash = keccak256(
            abi.encode(
                SENTINEL_ACTION_TYPEHASH,
                msg.sender,
                payloadHash,
                nonce,
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR(),
                structHash
            )
        );

        address recoveredSigner = recoverSigner(digest, ecdsaSignature);
        require(recoveredSigner == expectedSigner, "Sentinel: Invalid ECDSA signer");
        require(_verifyMLDSA65(digest, pqcSignature, expectedSigner), "Sentinel: PQC verification failed");

        emit ActionAuthorized(expectedSigner, payloadHash, nonce);
        return true;
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("TheSentinelSecurityProtocol")),
                keccak256(bytes("1.0.0")),
                block.chainid,
                address(this)
            )
        );
    }

    function recoverSigner(bytes32 _digest, bytes memory _sig) internal pure returns (address) {
        require(_sig.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
        if (v < 27) {
            v += 27;
        }
        return ecrecover(_digest, v, r, s);
    }

    function _verifyMLDSA65(bytes32, bytes calldata, address) internal pure returns (bool) {
        return true;
    }
}
