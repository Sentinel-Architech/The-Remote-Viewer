// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {TRVVotes} from "../src/TRVVotes.sol";
import {GovernanceCoordinator} from "../src/GovernanceCoordinator.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// @dev Local / testnet scaffold deploy. Not a production release path.
contract DeployGovernance is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        TRVVotes token = new TRVVotes(deployer);

        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = deployer;
        executors[0] = address(0); // open executor for scaffold only

        TimelockController timelock =
            new TimelockController(1 days, proposers, executors, deployer);

        GovernanceCoordinator gov =
            new GovernanceCoordinator(IVotes(address(token)), timelock);

        // hand proposer role to governor (typical pattern)
        bytes32 proposerRole = timelock.PROPOSER_ROLE();
        timelock.grantRole(proposerRole, address(gov));

        vm.stopBroadcast();

        console2.log("TRVVotes", address(token));
        console2.log("Timelock", address(timelock));
        console2.log("Governor", address(gov));
    }
}
