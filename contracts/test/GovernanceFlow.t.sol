// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRVVotes} from "../src/TRVVotes.sol";
import {GovernanceCoordinator} from "../src/GovernanceCoordinator.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";

/// @dev Integration: mint → delegate → propose → vote → queue (scaffold).
contract GovernanceFlowTest is Test {
    TRVVotes internal token;
    TimelockController internal timelock;
    GovernanceCoordinator internal gov;

    address internal owner = address(this);
    address internal voter = address(0xB0B);

    function setUp() public {
        token = new TRVVotes(owner);

        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = address(this);
        executors[0] = address(0); // anyone can execute after eta — scaffold only

        timelock = new TimelockController(1 days, proposers, executors, owner);
        gov = new GovernanceCoordinator(IVotes(address(token)), timelock);

        // Governor must be the proposer on the timelock
        bytes32 proposerRole = timelock.PROPOSER_ROLE();
        timelock.grantRole(proposerRole, address(gov));

        // Voting power
        token.mint(voter, 100 ether);
        vm.prank(voter);
        token.delegate(voter);

        // Move past snapshot lag
        vm.roll(block.number + 1);
    }

    function test_propose_vote_succeeds() public {
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(token);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", voter, 1 ether);

        vm.prank(voter);
        uint256 proposalId =
            gov.propose(targets, values, calldatas, "scaffold mint via gov");

        // voting delay = 1 day; advance time + block
        vm.warp(block.timestamp + 1 days + 1);
        vm.roll(block.number + 1);

        vm.prank(voter);
        gov.castVote(proposalId, 1); // 1 = For

        assertEq(uint256(gov.state(proposalId)), uint256(Governor.ProposalState.Active));

        // finish voting period (7 days)
        vm.warp(block.timestamp + 7 days + 1);
        vm.roll(block.number + 1);

        assertEq(uint256(gov.state(proposalId)), uint256(Governor.ProposalState.Succeeded));

        gov.queue(targets, values, calldatas, keccak256(bytes("scaffold mint via gov")));
        assertEq(uint256(gov.state(proposalId)), uint256(Governor.ProposalState.Queued));
    }
}
