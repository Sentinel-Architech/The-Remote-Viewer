// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRVVotes} from "../src/TRVVotes.sol";

contract TRVVotesTest is Test {
    TRVVotes internal token;
    address internal owner = address(0xA11CE);
    address internal alice = address(0xB0B);

    function setUp() public {
        token = new TRVVotes(owner);
    }

    function test_name_symbol() public view {
        assertEq(token.name(), "TRV Votes");
        assertEq(token.symbol(), "TRVV");
    }

    function test_mint_only_owner() public {
        vm.prank(owner);
        token.mint(alice, 100 ether);
        assertEq(token.balanceOf(alice), 100 ether);
    }

    function test_mint_reverts_non_owner() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1 ether);
    }

    function test_delegate_votes() public {
        vm.prank(owner);
        token.mint(alice, 50 ether);
        vm.prank(alice);
        token.delegate(alice);
        assertEq(token.getVotes(alice), 50 ether);
    }
}
