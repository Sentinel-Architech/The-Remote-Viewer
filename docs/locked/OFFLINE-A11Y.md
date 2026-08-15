# Offline + accessibility

## Offline

| Tier | Expectation |
|------|-------------|
| PWA | Cache shell + last entitlement view; mark stale |
| T1+ | Queue text outbound; flush when online |
| T2 | Local models / optical paths may work fully offline |

Never show “unlimited live network” while offline.

## Accessibility

- System font scaling honored  
- Voice↔text is an a11y feature, not only a convenience  
- Color is not the only signal state (text labels on weak/standard/strong)  
- Tutorial readable by screen readers (semantic headings in PWA)  

## Localization

EN default; **ES** when Viewer opts in ([MODALITIES](MODALITIES.md)).
