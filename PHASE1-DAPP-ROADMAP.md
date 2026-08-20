> **Status 2026-08-20:** The live Viewer Hub DApp is [`apps/hub`](apps/hub) ([sentinelsecurityprotocol.grok.me](https://sentinelsecurityprotocol.grok.me)). This Phase 1 document is **historical intent** for an EVM/testnet DApp. It is **not** a description of what is running. Solana `trv_governance` remains SCAFFOLD. Expo mobile remains PARKED.

# Phase 1: Minimum Viable DApp (4-6 weeks)
**Target: Testnet launch with storage + governance contracts, web wallet integration, token rewards for optical air-gap verification**

---

## Executive Summary
Phase 1 transforms The Remote Viewer from a zero-trust communication platform into a **Decentralized Application (DApp)** on Ethereum/Arbitrum testnet. Core deliverables:
- ✅ Deploy SentinelStorage + governance contracts to Goerli/Sepolia
- ✅ Complete React web3 frontend (wallet, governance voting, data management)
- ✅ AR token contract + basic minting for optical air-gap verification proof
- ✅ Whitelist of 500-1000 early testers
- ✅ P2P node bootstrap (minimal)

---

## Phase 1 Breakdown: 4 Milestones

### Milestone 1: Smart Contracts (Weeks 1-2)
**Deliverable: Deployable contract suite to Goerli testnet**

#### 1a. Storage Contract (Already drafted, needs completion)
- File: `contracts/SentinelStorage.sol` → Refactor & test
- Add: `DataRecord`, `OwnershipProof`, `AccessControlEntry` structures
- Add: Events for contract indexing (The Graph)
- Test: 10+ unit tests (Hardhat)
- **Owner:** Smart contract lead

**Checklist:**
- [ ] Review existing `Smart Contract` file from repo root
- [ ] Migrate to `contracts/SentinelStorage.sol`
- [ ] Add OpenZeppelin imports for AccessControl, EIP712
- [ ] Implement `createDataRecord()`, `grantAccess()`, `revokeAccess()`
- [ ] Write Hardhat tests (`test/SentinelStorage.test.js`)
- [ ] Deploy to Goerli testnet

#### 1b. AR Token Contract
- File: `contracts/ARToken.sol`
- Standard ERC20 with governance role
- Mintable only by governance or designated verifier (optical-airgap service)
- No pre-mine or VC allocation
- **Owner:** Smart contract lead

**Checklist:**
- [ ] Create `ARToken.sol` (OpenZeppelin ERC20 + Ownable)
- [ ] 1,000,000 total supply (fixed)
- [ ] `mint()` restricted to verifier role
- [ ] Write tests
- [ ] Deploy to testnet

#### 1c. Governance Contract
- File: `contracts/GovernanceCoordinator.sol`
- Proposal creation, voting, execution (1-day voting delay, 7-day voting period)
- Simple governor pattern (OpenZeppelin Governor)
- **Owner:** Smart contract lead

**Checklist:**
- [ ] Create `contracts/GovernanceCoordinator.sol`
- [ ] Inherit OpenZeppelin Governor, GovernorSettings, GovernorVotes, GovernorVotesQuorum, GovernorTimelockControl
- [ ] 1-day voting delay, 7-day voting period, 4% quorum
- [ ] Write tests
- [ ] Deploy to testnet

#### 1d. Verification Proof Contract
- File: `contracts/OpticalAirgapVerifier.sol`
- Records successful optical air-gap encryption/decryption proofs
- Mints AR token on valid proof submission (rate-limited)
- **Owner:** Smart contract lead

**Checklist:**
- [ ] Create `contracts/OpticalAirgapVerifier.sol`
- [ ] `submitProof(bytes32 proofHash, bytes signature)` function
- [ ] Verify EIP712 signature from optical-airgap CLI
- [ ] Mint 100 AR to caller on valid proof (max 1 per day per address)
- [ ] Write tests
- [ ] Deploy to testnet

---

### Milestone 2: Web Frontend Core (Weeks 1-2 parallel)
**Deliverable: Wallet connection + governance + data management UI**

#### 2a. Setup Web3 Provider
- File: `apps/web/src/providers/Web3Provider.tsx`
- Wagmi + Viem for Goerli/Sepolia
- RainbowKit wallet modal
- useContract hook for all contract interactions
- **Owner:** Frontend lead

**Checklist:**
- [ ] Create vite + React app in `apps/web/` (if not exists)
- [ ] Install: `wagmi`, `viem`, `@rainbow-me/rainbowkit`, `ethers`
- [ ] Create `Web3Provider.tsx` context wrapping app
- [ ] Configure Goerli chain config
- [ ] Test wallet connection on localhost

#### 2b. Governance UI
- File: `apps/web/src/pages/Governance.tsx`
- List proposals
- Vote on proposals
- Create proposal (for members)
- **Owner:** Frontend lead

**Checklist:**
- [ ] Create `pages/Governance.tsx`
- [ ] Fetch proposals from `GovernanceCoordinator` contract events (The Graph or ethers provider)
- [ ] Render proposal cards (title, state, voting period)
- [ ] Add vote buttons (for/against/abstain)
- [ ] Hook up `castVote()` contract call
- [ ] Show voting power from AR token balance

#### 2c. Data Management UI
- File: `apps/web/src/pages/DataManagement.tsx`
- My data records (list)
- Create new data record (IPFS upload via Pinata)
- Share data with another address
- Revoke access
- **Owner:** Frontend lead

**Checklist:**
- [ ] Create `pages/DataManagement.tsx`
- [ ] Fetch user's records via `getOwnerRecords()` contract call
- [ ] Render table: recordId, ipfsHash, category, size, createdAt
- [ ] Add "Create Record" modal
  - File upload → pin to IPFS (Pinata)
  - Submit tx to `createDataRecord()`
- [ ] Add "Share" button → modal to enter recipient address + permission
- [ ] Hook up `grantAccess()` tx
- [ ] Add "Revoke" button → `revokeAccess()` tx

#### 2d. Optical Air-Gap Verification UI
- File: `apps/web/src/pages/OpticalAirgapRewards.tsx`
- Show optical air-gap verification status
- Submit proof from CLI
- Display AR token rewards earned
- **Owner:** Frontend lead

**Checklist:**
- [ ] Create `pages/OpticalAirgapRewards.tsx`
- [ ] Paste-in proof JSON (output from `trv-optical`)
- [ ] Submit to `OpticalAirgapVerifier.submitProof()`
- [ ] Show success message + AR minted
- [ ] Display user's AR token balance
- [ ] Show daily reward quota remaining

---

### Milestone 3: Contract Deployment & Indexing (Week 2)
**Deliverable: Contracts live on Goerli, events indexed by The Graph**

#### 3a. Deploy Contracts
- File: `scripts/deploy.js` (Hardhat)
- Deploy all 4 contracts to Goerli
- Save addresses to `.env.local`
- Fund testnet accounts with Goerli ETH
- **Owner:** DevOps/Smart contract lead

**Checklist:**
- [ ] Create `hardhat.config.js` + `.env.example`
- [ ] Create `scripts/deploy.js`
  - Deploy ARToken
  - Deploy GovernanceCoordinator
  - Deploy SentinelStorage
  - Deploy OpticalAirgapVerifier
  - Set roles/permissions
  - Log addresses
- [ ] Deploy to Goerli testnet
- [ ] Verify contracts on Etherscan
- [ ] Save addresses to frontend `.env.local`

#### 3b. The Graph Subgraph (Optional, Phase 1.5)
- File: `subgraph/subgraph.yaml`
- Index SentinelStorage events
- Index GovernanceCoordinator events
- Query via GraphQL
- **Owner:** DevOps (or skip for Phase 1, use ethers event filters)

**Checklist:**
- [ ] Create `subgraph/` directory
- [ ] Write subgraph manifest
- [ ] Map events to GraphQL schema
- [ ] Deploy to The Graph Studio
- [ ] OR: Implement event filtering in frontend with ethers (simpler for Phase 1)

---

### Milestone 4: Integration & Testing (Week 3)
**Deliverable: End-to-end user flow working on testnet**

#### 4a. End-to-End Test Flow
1. User connects wallet (MetaMask)
2. User sees their AR token balance
3. User submits optical air-gap proof → receives AR token
4. User creates data record (upload file to IPFS)
5. User shares data with another testnet address
6. User votes on governance proposal
7. **Owner:** QA lead

**Checklist:**
- [ ] Write E2E Cypress tests (or manual script)
- [ ] Test each user flow
- [ ] Document bugs → backlog for Phase 2

#### 4b. Mobile Scaffold (Optional for Phase 1)
- `apps/mobile/` already exists (Expo)
- Just verify it compiles
- No Web3 wallet integration needed yet
- **Owner:** Mobile lead (can defer to Phase 2)

#### 4c. Documentation
- File: `PHASE1-LAUNCH.md` (user guide)
- How to connect wallet
- How to submit optical air-gap proof
- How to use governance
- Testnet faucet links
- **Owner:** Tech writer

**Checklist:**
- [ ] Write testnet setup guide
- [ ] Document contract addresses
- [ ] Screenshot wallet flow
- [ ] Video tutorial (optional)

---

## Directory Structure (Phase 1)

```
The-Remote-Viewer/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── providers/
│   │   │   │   └── Web3Provider.tsx          [NEW]
│   │   │   ├── pages/
│   │   │   │   ├── Governance.tsx            [NEW]
│   │   │   │   ├── DataManagement.tsx        [NEW]
│   │   │   │   └── OpticalAirgapRewards.tsx  [NEW]
│   │   │   ├── hooks/
│   │   │   │   ├── useContract.ts            [NEW]
│   │   │   │   └── useWeb3.ts                [NEW]
│   │   │   ├── services/
│   │   │   │   ├── ipfs.ts                   [NEW] (Pinata)
│   │   │   │   └── contracts.ts              [NEW] (ABI + addresses)
│   │   │   ├── App.tsx                       [REFACTOR]
│   │   │   └── index.tsx
│   │   ├── .env.example                      [NEW]
│   │   ├── vite.config.ts                    [EXISTS]
│   │   └── package.json                      [REFACTOR]
│   ├── mobile/                               [SCAFFOLD ONLY - Phase 2]
│   └── shared/
│       └── src/
│           ├── types/
│           │   ├── contracts.ts              [NEW]
│           │   └── storage.ts                [NEW]
│           └── index.ts
│
├── contracts/                                [NEW]
│   ├── SentinelStorage.sol                  [REFACTOR from root]
│   ├── ARToken.sol                          [NEW]
│   ├── GovernanceCoordinator.sol            [NEW]
│   └── OpticalAirgapVerifier.sol            [NEW]
│
├── hardhat/                                  [NEW]
│   ├── hardhat.config.js
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   ├── SentinelStorage.test.js
│   │   ├── ARToken.test.js
│   │   ├── GovernanceCoordinator.test.js
│   │   └── OpticalAirgapVerifier.test.js
│   ├── .env.example
│   └── package.json
│
├── optical-airgap/                          [ALREADY EXISTS - enhanced Phase 1]
│   ├── rust/
│   │   ├── src/
│   │   │   ├── bin/
│   │   │   │   ├── trv_optical.rs
│   │   │   │   └── proof_generator.rs       [NEW] - generates EIP712 proof for verifier contract
│   │   │   └── lib.rs
│   │   └── Cargo.toml
│   └── scripts/
│       ├── e2e-age-lt.sh                    [EXISTS]
│       └── generate-proof.sh                [NEW] - easy proof submission
│
├── docs/                                     [NEW]
│   ├── PHASE1-LAUNCH.md                     [Testnet user guide]
│   ├── CONTRACT-GUIDE.md                    [ABI + addresses + interaction]
│   └── FRONTEND-SETUP.md                    [Frontend dev setup]
│
└── PHASE1-DAPP-ROADMAP.md                   [THIS FILE]
```

---

## Weekly Breakdown

### Week 1
- Mon-Tue: Finalize all 4 smart contracts
- Wed: Deploy contracts to Goerli
- Thu-Fri: Web3 provider + governance UI skeleton
- **Checkpoint:** Contracts live, wallet connection works, proposals visible (even if voting not hooked up)

### Week 2
- Mon-Tue: Governance voting + data management UI
- Wed: Optical air-gap verification UI
- Thu: Integrate IPFS (Pinata) for data uploads
- Fri: QA testing, bug fixes
- **Checkpoint:** Full user flow testable end-to-end

### Week 3
- Mon-Wed: E2E testing, bug fixes
- Thu: Documentation + testnet setup guide
- Fri: Internal launch (100 early testers)
- **Release:** Goerli testnet live

### Week 4 (Optional buffer)
- User feedback
- Security review of contracts
- Prepare Phase 2 scope

---

## Success Criteria (Phase 1)

| Metric | Target |
|--------|--------|
| Contracts deployed | ✅ 4/4 on Goerli |
| Frontend pages live | ✅ Governance, DataManagement, OpticalAirgapRewards |
| Wallet connections | ✅ 50+ unique users |
| AR tokens minted | ✅ 5,000+ distributed |
| Data records created | ✅ 100+ |
| Governance proposals | ✅ 2-3 active |
| Zero critical bugs | ✅ (after bug bash) |
| Testnet gas optimization | ✅ <200k per tx |

---

## Known Blockers & Mitigations

| Blocker | Mitigation |
|---------|-----------|
| Solidity expertise needed | Hire auditor OR use OpenZeppelin templates (provided) |
| Pinata IPFS costs | Use free tier for Phase 1 (up to 1GB) |
| Wallet integration complexity | RainbowKit handles 95% of work |
| P2P network bootstrapping | Defer to Phase 2 (centralized server OK for Phase 1) |
| Mobile app | Scaffold only, no Web3 yet—defer to Phase 2 |

---

## Phase 1 → Phase 2 Transition

Once Phase 1 testnet is stable (2-3 weeks post-launch):

1. **Security audit** of smart contracts (external firm)
2. **Mainnet preparation** (contract upgrades, governance setup)
3. **P2P network launch** (bootstrap nodes, libp2p DHT)
4. **Mobile Web3 integration** (WalletConnect)
5. **In-app shop** (Solana integration for TRV token)

---

## Resource Requirements

| Role | FTE | Duration | Notes |
|------|-----|----------|-------|
| Smart Contract Lead | 1.0 | 2 weeks | Solidity + Hardhat |
| Frontend Lead | 1.0 | 3 weeks | React + Wagmi |
| DevOps/Deployment | 0.5 | 1 week | Goerli, Infura, .env |
| QA Lead | 0.5 | 1 week | E2E testing |
| Tech Writer | 0.25 | 1 week | Docs + guides |
| **Total** | **3.25 FTE** | **4 weeks** | Parallel work |

---

## Funding (Testnet = Free)

- Goerli ETH: Free from faucet
- Pinata IPFS: Free tier (~1GB)
- Infura RPC: Free tier (~100k calls/day)
- GitHub Actions CI: Free
- Vercel/Netlify hosting: Free tier
- **Total cost: $0** (use free tiers)

---

## Next Steps (Today)

1. ✅ Review this roadmap with team
2. ✅ Assign owners to each milestone
3. ✅ Create GitHub project board
4. ✅ Create Discord channel for Phase 1 team
5. ✅ Create `.github/workflows/phase1-ci.yml` (test + deploy)
6. ✅ Create first PR: `contracts/SentinelStorage.sol` refactor

---

*Last updated: 2026-08-02*  
*Maintained by: Sentinel Architect*
