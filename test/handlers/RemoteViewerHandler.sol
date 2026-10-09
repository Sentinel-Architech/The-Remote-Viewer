// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RemoteViewerVault} from "../../src/RemoteViewerVault.sol";
import {TheSentinelProtocol} from "../../src/security/TheSentinelProtocol.sol";
import {MockFlashLoanPool, IFlashLoanReceiver} from "../../src/mocks/MockFlashLoanPool.sol";
import {MockERC20} from "../../src/mocks/MockERC20.sol";

contract RemoteViewerHandler is Test, IFlashLoanReceiver {
    RemoteViewerVault public vault;
    TheSentinelProtocol public sentinel;
    MockFlashLoanPool public pool;
    MockERC20[] public tokens;
    address[] public actors;

    uint256 internal signerPrivateKey = 0xA11CE_5EED;
    address internal sentinelSigner;

    mapping(address token => uint256) public ghost_sumOfBalances;
    uint256 public nonceCounter;

    address internal currentActor;
    MockERC20 internal currentToken;

    bytes32 private constant ACTION_TYPEHASH = keccak256(
        "SentinelAction(address target,bytes32 payloadHash,uint256 nonce,uint256 deadline)"
    );

    constructor(
        RemoteViewerVault _vault, 
        TheSentinelProtocol _sentinel,
        MockFlashLoanPool _pool, 
        MockERC20[] memory _tokens
    ) {
        vault = _vault;
        sentinel = _sentinel;
        pool = _pool;
        sentinelSigner = vm.addr(signerPrivateKey);

        for (uint256 i = 0; i < _tokens.length; i++) {
            tokens.push(_tokens[i]);
        }

        actors.push(address(0xA11CE));
        actors.push(address(0xB0B));
        actors.push(address(0xCA20L));
    }

    modifier useRandomActorAndToken(uint256 actorSeed, uint256 tokenSeed) {
        currentActor = actors[bound(actorSeed, 0, actors.length - 1)];
        currentToken = tokens[bound(tokenSeed, 0, tokens.length - 1)];
        
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    function _signSentinelAction(
        address target,
        bytes32 payloadHash,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(ACTION_TYPEHASH, target, payloadHash, nonce, deadline)
        );
        
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("TheSentinelSecurityProtocol")),
                keccak256(bytes("1.0.0")),
                block.chainid,
                address(sentinel)
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, digest);
        return abi.encodePacked(r, s, v);
    }

    function deposit(uint256 amount, uint256 actorSeed, uint256 tokenSeed) 
        external 
        useRandomActorAndToken(actorSeed, tokenSeed) 
    {
        if (sentinel.paused()) return;
        amount = bound(amount, 1e6, 1_000_000e18);

        currentToken.mint(currentActor, amount);
        currentToken.approve(address(vault), amount);

        uint256 nonce = ++nonceCounter;
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 payloadHash = keccak256(abi.encodePacked("DEPOSIT", address(currentToken), amount, currentActor));

        bytes memory signature = _signSentinelAction(address(vault), payloadHash, nonce, deadline);

        vault.depositToken(address(currentToken), amount, nonce, deadline, signature);
        ghost_sumOfBalances[address(currentToken)] += amount;
    }

    function withdraw(uint256 amount, uint256 actorSeed, uint256 tokenSeed) 
        external 
        useRandomActorAndToken(actorSeed, tokenSeed) 
    {
        if (sentinel.paused()) return;
        uint256 actorBalance = vault.tokenBalances(address(currentToken), currentActor);
        if (actorBalance == 0) return;

        amount = bound(amount, 1, actorBalance);

        vault.withdrawToken(address(currentToken), amount);
        ghost_sumOfBalances[address(currentToken)] -= amount;
    }

    function executeFlashLoanAttack(uint256 borrowAmount, uint256 tokenSeed) external {
        if (sentinel.paused()) return;
        currentToken = tokens[bound(tokenSeed, 0, tokens.length - 1)];
        borrowAmount = bound(borrowAmount, 100_000e18, 10_000_000e18);

        currentToken.mint(address(pool), borrowAmount * 2);
        pool.flashLoan(address(this), address(currentToken), borrowAmount, "");
    }

    function executeOperation(
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata
    ) external override returns (bool) {
        require(msg.sender == address(pool), "Unauthorized flash loan callback");

        MockERC20(token).approve(address(vault), amount);

        uint256 nonce = ++nonceCounter;
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 payloadHash = keccak256(abi.encodePacked("DEPOSIT", token, amount, address(this)));
        bytes memory signature = _signSentinelAction(address(vault), payloadHash, nonce, deadline);

        vault.depositToken(token, amount, nonce, deadline, signature);
        vault.withdrawToken(token, amount);

        MockERC20(token).mint(address(this), fee);
        MockERC20(token).approve(address(pool), amount + fee);

        return true;
    }
}
