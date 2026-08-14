// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {TRVVotes} from "../src/TRVVotes.sol";
import {GovernanceCoordinator} from "../src/GovernanceCoordinator.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/**
 * Deploy hardened scaffold.
 * EXECUTOR env optional — defaults to deployer. Never address(0) on purpose.
 * Still not audited. Prefer Sepolia before any mainnet consideration.
 */
contract DeployGovernance is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        address executor = deployer;
        try vm.envAddress("EXECUTOR") returns (address e) {
            if (e != address(0)) executor = e;
        } catch {}

        vm.startBroadcast(pk);

        TRVVotes token = new TRVVotes(deployer);

        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = deployer;
        executors[0] = executor;

        TimelockController timelock =
            new TimelockController(1 days, proposers, executors, deployer);

        GovernanceCoordinator gov =
            new GovernanceCoordinator(IVotes(address(token)), timelock);

        timelock.grantRole(timelock.PROPOSER_ROLE(), address(gov));
        // Optional: revoke deployer proposer after governor is sole proposer
        // timelock.renounceRole(timelock.PROPOSER_ROLE(), deployer);

        vm.stopBroadcast();

        console2.log("TRVVotes", address(token));
        console2.log("Timelock", address(timelock));
        console2.log("Governor", address(gov));
        console2.log("Executor", executor);
    }
}
