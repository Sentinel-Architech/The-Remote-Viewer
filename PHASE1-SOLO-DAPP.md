# Phase 1: Solo DApp Launch (6-8 weeks, 100% solo)
**You are the architect, developer, QA, and ops. This is optimized for one person.**

---

## Strategy for Solo Dev

**Golden Rule:** Never be blocked. Always have 2-3 parallel work streams.

- **Stream A (40%):** Smart contracts (Solidity) — iterative, testable offline
- **Stream B (35%):** Frontend (React/Wagmi) — can build UI before contracts are done
- **Stream C (25%):** DevOps + docs — automation, CI, setup scripts

**Why parallel?** While Solidity compiles or tests run, you're writing React. While frontend builds, you're writing deployment scripts. Zero idle time.

---

## Timeline: 6-8 Weeks (Solo)

### Week 1-2: Foundations (A + B parallel)

#### Stream A1: Solidity Setup + SentinelStorage
- Install Foundry (Rust-based Solidity toolkit, faster than Hardhat)
- Create `contracts/` directory structure
- Refactor `Smart Contract` file → `contracts/SentinelStorage.sol`
- Write 5 Foundry tests

**Time: 8 hrs**  
**Deliverable:** Compiling contract + passing tests

```bash
# Solo workflow
forge init contracts
# Copy Smart Contract content into SentinelStorage.sol
# Write tests
forge test
# Done for now, move to next task
```

#### Stream B1: Frontend Scaffold + Web3 Setup
- Create Vite + React in `apps/web/`
- Install Wagmi, Viem, RainbowKit
- Create Web3Provider context
- Get wallet connection working on Goerli testnet
- Hardcode contract addresses (will update later)

**Time: 6 hrs**  
**Deliverable:** Click "Connect Wallet" → MetaMask pops up → address shows

```bash
# Parallel to Solidity work
cd apps/web
npm create vite@latest . -- --template react
npm install wagmi viem @rainbow-me/rainbowkit ethers
# Create Web3Provider context
npm run dev
```

**Why parallel?** Solidity compiles in 30 sec. You're not waiting. While Forge tests run, React is compiling.

---

### Week 3: Contracts Deep Dive

#### Stream A2: ARToken + OpticalAirgapVerifier
- `contracts/ARToken.sol` (ERC20, 1M supply, no pre-mine)
- `contracts/OpticalAirgapVerifier.sol` (proof → mint 100 AR/day per user)
- Write 10 Foundry tests

**Time: 12 hrs**  
**Deliverable:** Both contracts compiling, all tests passing

```solidity
// contracts/ARToken.sol (copy this)
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ARToken is ERC20, Ownable {
    constructor() ERC20("AR Token", "AR") {
        // No pre-mine. Minting only via governance or verifier.
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

#### Stream B2: Governance + Data Management Pages
- `apps/web/src/pages/Governance.tsx` (skeleton, no contract calls yet)
- `apps/web/src/pages/DataManagement.tsx` (skeleton)
- `apps/web/src/hooks/useContract.ts` (generic hook to call contracts)
- Mock data to test UI

**Time: 8 hrs**  
**Deliverable:** Pages render, buttons don't crash, responsive design

```tsx
// Mock data, real calls come later
const mockProposals = [
  { id: 1, title: "Increase AR rewards", description: "...", state: "Active", votes: { for: 1200, against: 300 } }
];
```

---

### Week 4: Governor + IPFS

#### Stream A3: GovernanceCoordinator Contract
- `contracts/GovernanceCoordinator.sol` (OpenZeppelin Governor)
- Use ARToken as voting token
- 1-day delay, 7-day voting, 4% quorum
- Write 8 tests (voting, execution)

**Time: 10 hrs**  
**Deliverable:** Proposals can be created, voted on, executed

```solidity
// Boilerplate from OpenZeppelin Governor, minimal custom code
contract GovernanceCoordinator is Governor, GovernorSettings, GovernorVotes, ... {
    // ~50 lines total
}
```

#### Stream C1: Hardhat Setup + Deployment Script
- Switch from Foundry to Hardhat (bridge the gap for testing)
- Create `hardhat/scripts/deploy.js`
- Deploy all 4 contracts to Goerli testnet
- Save addresses to `apps/web/.env.local`

**Time: 6 hrs**  
**Deliverable:** All 4 contracts live on Goerli, addresses in .env

```bash
cd hardhat
npm install hardhat ethers
npx hardhat init
# Write deploy.js
npx hardhat run scripts/deploy.js --network goerli
```

---

### Week 5: Wire It Up

#### Stream B3: Connect Frontend to Contracts
- Update `apps/web/src/services/contracts.ts` with real contract ABIs + addresses
- Implement `useContract()` hook:
  - Read user's AR balance
  - Call `getOwnerRecords()` from SentinelStorage
  - Call `castVote()` from Governor
- Add loading states + error handling

**Time: 12 hrs**  
**Deliverable:** Governance page shows real proposals from contract, voting works

```tsx
// Example
const { data: balance } = useContractRead({
  address: AR_TOKEN_ADDRESS,
  abi: ARTokenABI,
  functionName: 'balanceOf',
  args: [userAddress]
});
```

#### Stream B4: Data Management + IPFS
- Integrate Pinata IPFS (free tier, 1GB/month)
- Create `.env.local` with Pinata JWT
- Implement file upload → IPFS → submit `createDataRecord()` tx
- Show user's data records + share/revoke buttons

**Time: 10 hrs**  
**Deliverable:** Can upload file, see it on IPFS, share with another address

```tsx
// Pinata integration
const uploadToPinata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData
  });
  return res.json().IpfsHash; // → submit to contract
};
```

---

### Week 6: Optical Air-Gap Integration

#### Stream A4: Proof Verifier + EIP712
- Enhance `OpticalAirgapVerifier.sol`:
  - Use EIP712 signatures (optical-airgap CLI signs proofs)
  - Verify signature on-chain, mint AR on valid proof
  - Rate limit: 1 proof/day per user, 100 AR per proof
- Test end-to-end: CLI → sig → contract

**Time: 8 hrs**  
**Deliverable:** Can submit proof from CLI, receive AR token on testnet

```solidity
// Minimal EIP712 integration
bytes32 PROOF_TYPEHASH = keccak256("Proof(bytes32 hash,address user,uint256 nonce)");
// Verify sig, check nonce, mint AR
```

#### Stream B5: Optical Air-Gap Rewards Page
- `apps/web/src/pages/OpticalAirgapRewards.tsx`
- Paste proof JSON (or QR code)
- Click "Submit Proof"
- Show success + AR balance updated
- Display daily quota

**Time: 6 hrs**  
**Deliverable:** UX to redeem AR from optical air-gap proofs

---

### Week 7: QA + Polish

#### Stream C2: End-to-End Testing + Bug Fixes
- Manual E2E flow:
  1. Connect wallet
  2. See AR balance (0)
  3. Submit optical air-gap proof
  4. Receive 100 AR
  5. Create data record (upload file)
  6. Share with another testnet address
  7. Vote on a governance proposal
  8. Check receipt on Etherscan

- Create Cypress tests for critical paths (optional but recommended)

**Time: 8 hrs**  
**Deliverable:** You can demo full flow on testnet without bugs

#### Stream C3: Documentation
- `docs/PHASE1-USER-GUIDE.md` — how to test on Goerli
- `docs/CONTRACT-ADDRESSES.md` — where each contract lives
- `docs/SETUP.md` — how to run frontend locally
- `.env.example` files for frontend + hardhat

**Time: 4 hrs**  
**Deliverable:** Someone else could follow your guide and test the app

---

### Week 8: Launch

#### Stream C4: Public Release
- Create GitHub releases
- Post testnet link to Twitter/Discord
- Invite 500 early testers
- Collect feedback

**Time: 2 hrs**  
**Deliverable:** Testnet DApp publicly available

---

## Weekly Effort Breakdown

| Week | Stream A (Contracts) | Stream B (Frontend) | Stream C (DevOps/Docs) | Total Hours |
|------|----------------------|-------------------|----------------------|-------------|
| 1-2  | 8 hrs (SentinelStorage) | 6 hrs (Web3 setup) | — | 14 |
| 3    | 12 hrs (ARToken + Verifier) | 8 hrs (Gov + DataMgmt pages) | — | 20 |
| 4    | 10 hrs (Governor) | — | 6 hrs (Hardhat + deploy) | 16 |
| 5    | — | 22 hrs (hook up contracts + IPFS) | — | 22 |
| 6    | 8 hrs (Proof verifier) | 6 hrs (Rewards page) | — | 14 |
| 7    | — | — | 12 hrs (QA + docs) | 12 |
| 8    | — | — | 2 hrs (release) | 2 |
| **Total** | **38 hrs** | **42 hrs** | **20 hrs** | **~100 hrs** |

**= ~12-15 hrs/week solo, fully doable while maintaining day job (weekends + evenings)**

---

## Daily Workflow (Example: Week 3)

```
Monday (4 hrs):
  - 09:00-11:00 (2 hrs): Solidity → Write ARToken.sol, tests pass
  - 11:00-13:00 (2 hrs): React → Build Governance page skeleton (mock data)

Tuesday (3 hrs):
  - 09:00-10:00 (1 hr): Solidity → OpticalAirgapVerifier.sol skeleton
  - 10:00-12:00 (2 hrs): React → DataManagement page, refine useContract hook

Wednesday (4 hrs):
  - 09:00-11:00 (2 hrs): Solidity → Write OpticalAirgapVerifier tests
  - 11:00-13:00 (2 hrs): React → Add Tailwind CSS styling, responsive

Thursday (3 hrs):
  - 09:00-11:00 (2 hrs): Solidity → Refactor, cleanup, comments
  - 11:00-12:00 (1 hr): DevOps → Create GitHub issue tracker for next week

Friday (2 hrs):
  - 09:00-10:00 (1 hr): Review what shipped, write summary
  - 10:00-11:00 (1 hr): Plan weekend work
```

**Why this works:**
- Solidity compiles/tests fast → context switch to React doesn't hurt
- React doesn't need contracts yet → build in parallel
- By Friday, you've shipped 2 working components

---

## Shortcuts for Solo Dev (Save 20% Time)

### 1. Use OpenZeppelin Governor Template
Don't write from scratch. Copy the boilerplate:
```bash
git clone https://github.com/OpenZeppelin/openzeppelin-contracts.git
# Reference: contracts/governance/Governor.sol
# Adapt to your needs (takes 30 min vs 2 hrs to write from scratch)
```

### 2. Frontend Component Library
Use shadcn/ui or Ant Design for free UI components. Don't build buttons/forms from scratch.
```bash
npm install @shadcn/ui  # or npm install antd
# Saves 6+ hours on UI polish
```

### 3. Reuse Test Boilerplate
Copy test patterns from Foundry docs. Don't reinvent assertions.
```solidity
// Template test
function test_CanMint() public {
    token.mint(address(this), 100 ether);
    assertEq(token.balanceOf(address(this)), 100 ether);
}
```

### 4. Pinata Free Tier
- 1 GB free storage
- No API key fees for Phase 1
- Perfect for <1000 small test files

### 5. GitHub Actions for Free CI
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install && npm test
```

---

## Tech Stack (Solo-Optimized)

| Layer | Choice | Why |
|-------|--------|-----|
| **Contracts** | Foundry (Rust) + Hardhat (JS) | Foundry is fast; Hardhat deploys |
| **Frontend** | Vite + React + Wagmi | Fast HMR, smallest bundle, excellent Web3 support |
| **Styling** | Tailwind CSS | No CSS writing, rapid UI |
| **IPFS** | Pinata | Simple API, free tier covers Phase 1 |
| **Testnet** | Goerli (or Sepolia) | Free faucet, mature, fast |
| **Deployment** | Hardhat scripts | Dead simple, no DevOps needed |
| **CI** | GitHub Actions | Free, built-in |
| **Docs** | Markdown in `/docs/` | Version control, searchable |

---

## Solo Dev Survival Guide

### Energy Management
- **Week 1-4:** High energy (new problem, moving fast)
- **Week 5-6:** Dip (integrating is tedious, bugs appear)
  - **Mitigation:** Plan a break, go public earlier (get feedback, re-energize)
- **Week 7-8:** Sprint finish (polish, clean up, ship)

### Unblock Yourself Fast
- **Problem:** Contract won't compile
  - **Solution:** Copy exact OpenZeppelin template, debug incrementally
- **Problem:** Frontend won't connect to contract
  - **Solution:** Log ABI, address, signer state at each step
- **Problem:** Pinata upload fails
  - **Solution:** Test with curl first, check JWT + file size

### Knowledge Gaps? (You're probably fine, but just in case)
- Solidity: Use OpenZeppelin reference + Foundry examples
- Wagmi: Official docs are excellent, reference their examples
- EIP712: Copy from OpenZeppelin Governor reference implementation
- IPFS: Pinata docs are beginner-friendly

---

## Deliverables Checklist (Phase 1 Solo)

### End of Week 2
- [ ] `contracts/SentinelStorage.sol` compiles + 5 tests pass
- [ ] `apps/web/` loads, wallet connects to Goerli

### End of Week 4
- [ ] All 4 contracts deployed to Goerli
- [ ] Contract addresses in `apps/web/.env.local`
- [ ] Governance + DataManagement pages render with mock data

### End of Week 6
- [ ] Governance voting works (real contract calls)
- [ ] IPFS upload works (files show on Pinata)
- [ ] Optical air-gap rewards page works end-to-end

### End of Week 7
- [ ] Zero critical bugs (you tested everything)
- [ ] `docs/PHASE1-USER-GUIDE.md` written
- [ ] `.env.example` files filled in

### End of Week 8
- [ ] Goerli DApp publicly accessible
- [ ] 50+ testnet users
- [ ] GitHub release published

---

## File Structure to Create

```
The-Remote-Viewer/
├── contracts/                          [NEW]
│   ├── SentinelStorage.sol            (refactored from root)
│   ├── ARToken.sol                    (new)
│   ├── GovernanceCoordinator.sol      (new)
│   └── OpticalAirgapVerifier.sol      (new)
│
├── hardhat/                            [NEW]
│   ├── hardhat.config.js
│   ├── scripts/deploy.js
│   ├── test/*.test.js                 (copied from Foundry)
│   ├── .env.example
│   └── package.json
│
├── apps/web/                           [ENHANCE]
│   ├── src/
│   │   ├── providers/Web3Provider.tsx [NEW]
│   │   ├── pages/
│   │   │   ├── Governance.tsx         [NEW]
│   │   │   ├── DataManagement.tsx     [NEW]
│   │   │   └── OpticalAirgapRewards.tsx [NEW]
│   │   ├── hooks/useContract.ts       [NEW]
│   │   ├── services/
│   │   │   ├── contracts.ts           [NEW]
│   │   │   └── ipfs.ts                [NEW]
│   │   └── App.tsx                    [REFACTOR]
│   ├── .env.example                   [NEW]
│   └── package.json                   [REFACTOR]
│
├── docs/                               [NEW]
│   ├── PHASE1-USER-GUIDE.md
│   ├── CONTRACT-ADDRESSES.md
│   └── SETUP.md
│
├── .github/workflows/                  [NEW]
│   └── test.yml                        (Foundry + Hardhat tests)
│
└── PHASE1-SOLO-DAPP.md                [THIS FILE]
```

---

## Monday Start (Week 1)

Copy this into your calendar:

**Monday 09:00-11:00:**
```bash
# Setup Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Init contracts
mkdir contracts
cd contracts
forge init

# Copy Smart Contract content from repo root into src/SentinelStorage.sol
# Run forge build
forge build
```

**Monday 11:00-13:00:**
```bash
# Setup frontend
cd apps/web
npm create vite@latest . -- --template react
npm install wagmi viem @rainbow-me/rainbowkit ethers
npm run dev
# At browser: http://localhost:5173
```

**By 13:00 Monday:** Both dirs building. You're off.

---

## Resources (Bookmarks)

- Foundry: https://book.getfoundry.sh/
- OpenZeppelin Governor: https://docs.openzeppelin.com/contracts/5.x/governance
- Wagmi: https://wagmi.sh/
- Pinata: https://docs.pinata.cloud/
- Goerli Faucet: https://goerlifaucet.com/
- EIP712: https://eips.ethereum.org/EIPS/eip-712

---

## Success = Done in 8 Weeks with This Flow

You're solo, you're shipping fast, you're parallel. By week 8, testnet DApp ships with:
- ✅ Working smart contracts
- ✅ Wallet connection
- ✅ Data sovereignty (IPFS + contracts)
- ✅ Governance voting
- ✅ AR token rewards for optical air-gap
- ✅ Documentation

**Total: ~100 hours over 8 weeks = 12-15 hrs/week.**

You've got this. 🚀

---

*Last updated: 2026-08-02*  
*For: Sentinel-Archetecht (solo dev)*
