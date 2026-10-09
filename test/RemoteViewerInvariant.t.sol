// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {StdInvariant} from "forge-std/StdInvariant.sol";
import {Test} from "forge-std/Test.sol";
import {RemoteViewerVault} from "../src/RemoteViewerVault.sol";
import {TheSentinelProtocol} from "../src/security/TheSentinelProtocol.sol";
import {MockFlashLoanPool} from "../src/mocks/MockFlashLoanPool.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {RemoteViewerHandler} from "./handlers/RemoteViewerHandler.sol";

contract RemoteViewerInvariantTest is StdInvariant, Test {
    RemoteViewerVault public vault;
    TheSentinelProtocol public sentinel;
    MockFlashLoanPool public pool;
    RemoteViewerHandler public handler;
    MockERC20[] public tokens;

    uint256 internal signerPrivateKey = 0xA11CE_5EED;

    function setUp() public {
        address sentinelSigner = vm.addr(signerPrivateKey);
        sentinel = new TheSentinelProtocol(sentinelSigner);
        vault = new RemoteViewerVault(address(sentinel));
        pool = new MockFlashLoanPool();

        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH");
        MockERC20 usdc = new MockERC20("USD Coin", "USDC");

        tokens.push(weth);
        tokens.push(usdc);

        handler = new RemoteViewerHandler(vault, sentinel, pool, tokens);

        targetContract(address(handler));
    }

    function invariant_tokenSolvency_actualBalanceMatchesTotalAssets() public view {
        for (uint256 i = 0; i < tokens.length; i++) {
            address tokenAddr = address(tokens[i]);
            assertEq(
                tokens[i].balanceOf(address(vault)),
                vault.totalTokenAssets(tokenAddr),
                "Solvency breach in Remote Viewer Vault: Physical balance != totalTokenAssets"
            );
        }
    }

    function invariant_ghost_sumMatchesTotalAssets() public view {
        for (uint256 i = 0; i < tokens.length; i++) {
            address tokenAddr = address(tokens[i]);
            assertEq(
                handler.ghost_sumOfBalances(tokenAddr),
                vault.totalTokenAssets(tokenAddr),
                "Accounting breach under Sentinel Protocol: Ghost balance sum != totalTokenAssets"
            );
        }
    }
}
