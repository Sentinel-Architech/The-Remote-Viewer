# NEXT

## Now

1. **Solana Anchor CI green** (`anchor build`) on Actions  
2. Commit `solana/Cargo.lock` after first green resolve  
3. Upload `branding/sentinel-logo.png` + `remote-viewer-hero.png`  
4. Phone: `git fetch && git merge origin/TheRemoteViewer --no-edit`

## Build host (not Pixel)

5. `anchor keys list` → replace scaffold `declare_id!` + `Anchor.toml`  
6. `anchor test` fully green (not soft-fail)  
7. Devnet deploy (manual)  
8. Multisig for upgrade + config authority (`docs/AUTHORITY.md`)

## Product rails

9. Sub payment → `grant_subscription` ops (`docs/PAYMENTS.md`)  
10. Pool PDA + spend ix (`docs/POOL-GOVERNANCE.md`)  
11. Creator store settlement (95/5, 90/10)  
12. TRV mail domain + Phase A aliases (`docs/VIEWER-MAIL.md`)

## Later

13. Integrity report plumbing when client exists  
14. Mobile unpark / native path  
15. Audit → only then mainnet discussion  

Path B founders remain **0** until real process + people.
