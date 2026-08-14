// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRVVotes} from "../src/TRVVotes.sol";
import {GovernanceCoordinator} from "../src/GovernanceCoordinator.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// Full lifecycle: propose → vote → queue → execute (scaffold).
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
        executors[0] = address(0); // open executor — scaffold only

        timelock = new TimelockController(1 days, proposers, executors, owner);
        gov = new GovernanceCoordinator(IVotes(address(token)), timelock);

        bytes32 proposerRole = timelock.PROPOSER_ROLE();
        timelock.grantRole(proposerRole, address(gov));

        // Timelock owns mint for this test target — transfer ownership to timelock
        token.transferOwnership(address(timelock));

        // Voter power (mint before ownership moved: mint as previous owner already done pattern)
        // Re-mint path: use a pre-owned balance — deploy token, mint, then transfer ownership
    }

    function _bootstrap() internal {
        // Fresh stack with mint-then-handoff ownership
        token = new TRVVotes(owner);
        token.mint(voter, 100 ether);

        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = address(this);
        executors[0] = address(0);

        timelock = new TimelockController(1 days, proposers, executors, owner);
        gov = new GovernanceCoordinator(IVotes(address(token)), timelock);
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(gov));

        token.transferOwnership(address(timelock));

        vm.prank(voter);
        token.delegate(voter);
        vm.roll(block.number + 1);
    }

    function test_propose_vote_queue_execute() public {
        _bootstrap();

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(token);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", voter, 1 ether);
        string memory desc = "scaffold mint via gov";
        bytes32 descHash = keccak256(bytes(desc));

        vm.prank(voter);
        uint256 proposalId = gov.propose(targets, values, calldatas, desc);

        uint256 delay = gov.votingDelay();
        vm.roll(block.number + delay + 1);
        vm.warp(block.timestamp + delay + 1);

        assertEq(uint256(gov.state(proposalId)), 1); // Active

        vm.prank(voter);
        gov.castVote(proposalId, 1);

        uint256 period = gov.votingPeriod();
        vm.roll(block.number + period + 1);
        vm.warp(block.timestamp + period + 1);

        assertEq(uint256(gov.state(proposalId)), 4); // Succeeded

        gov.queue(targets, values, calldatas, descHash);
        assertEq(uint256(gov.state(proposalId)), 5); // Queued

        // Timelock min delay = 1 days
        vm.warp(block.timestamp + 1 days + 1);
        vm.roll(block.number + 1);

        uint256 beforeBal = token.balanceOf(voter);
        gov.execute(targets, values, calldatas, descHash);

        assertEq(uint256(gov.state(proposalId)), 7); // Executed
        assertEq(token.balanceOf(voter), beforeBal + 1 ether);
    }
}
