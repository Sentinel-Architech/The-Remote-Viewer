// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {GovernanceCoordinator} from "../src/GovernanceCoordinator.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract MockVotes is IVotes {
    function getVotes(address) external pure returns (uint256) { return 0; }
    function getPastVotes(address, uint256) external pure returns (uint256) { return 0; }
    function getPastTotalSupply(uint256) external pure returns (uint256) { return 0; }
    function delegates(address) external pure returns (address) { return address(0); }
    function delegate(address) external {}
    function delegateBySig(address, uint256, uint256, uint8, bytes32, bytes32) external {}
}

contract GovernanceCoordinatorTest is Test {
    GovernanceCoordinator internal gov;
    MockVotes internal token;
    TimelockController internal timelock;

    function setUp() public {
        token = new MockVotes();
        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = address(this);
        executors[0] = address(this); // not address(0)
        timelock = new TimelockController(1 days, proposers, executors, address(this));
        gov = new GovernanceCoordinator(IVotes(address(token)), timelock);
    }

    function test_name() public view {
        assertEq(gov.name(), "GovernanceCoordinator");
    }

    function test_proposalThreshold_is_one_ether() public view {
        assertEq(gov.proposalThreshold(), 1 ether);
    }

    function test_votingDelay_one_day() public view {
        assertEq(gov.votingDelay(), 1 days);
    }

    function test_votingPeriod_seven_days() public view {
        assertEq(gov.votingPeriod(), 7 days);
    }
}
