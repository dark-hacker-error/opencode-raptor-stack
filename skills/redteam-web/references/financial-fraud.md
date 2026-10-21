# Financial, Payment & Digital-Asset Attacks

> Loaded by `raptor_attacks` for payment, card, wallet, crypto and fraud families.

## Payment application testing

| Attack | Test |
|---|---|
| Payment Redirection Fraud | change the payee/amount in the operator's own checkout flow |
| Amount Tampering | `amount=0`, `amount=1`, negative, float rounding — the operator's own gateway sandbox |
| Currency Mismatch | price in cents vs units, mixed currency codes |
| Payment Gateway Callback Spoofing | forge the callback to the operator's own test endpoint |
| Webhook Signature Validation Bypass | replay/tamper the operator's own webhook with a modified payload |
| Transaction Replay | replay the operator's own captured transaction |
| Race Condition in Payments | concurrent requests against the operator's own sandbox — see `race-business.md` |
| Double-Spending | two concurrent spends of the same balance, in the operator's own sandbox |
| Refund Logic Abuse | refund more than paid, refund to a different account, refund twice |
| Chargeback Fraud | the operator's own test transactions |
| Coupon / Discount Abuse | stacking, negative values, applying to a non-eligible item |
| Split-Payment Abuse | divide a payment to evade a threshold |

## Card and POS

| Attack | Test |
|---|---|
| Card Skimming | detect skimmers at the operator's own terminals; inspect the card reader for tampering |
| Card Shimming | an EMV shim in the operator's own reader — physical inspection |
| Card Cloning / Card Not Present | the operator's own payment sandbox |
| ATM Malware / Jackpotting | the operator's own ATMs; **never** tamper with a third-party ATM |
| POS Memory Scraping | the operator's own POS; check PCI scope and in-memory handling |
| Magecart Attack | the e-commerce JS — look for card data being sent to a third-party endpoint |
| Contactless Payment Relay | the operator's own terminal, with the operator's own card |
| NFC Relay | see `redteam-wireless/references/ble-nfc-rfid.md` |

## Identity & loan fraud

Synthetic Identity Fraud, Loan Application Fraud, Identity Verification Fraud, Mule Account
Recruitment, Duplicate Identity Registration, Stolen Identity Document Reuse — test the operator's
own KYC/onboarding flow and document where a synthetic identity would pass.

## Cryptocurrency & blockchain

| Attack | Test |
|---|---|
| Private Key / Seed Phrase Theft | where keys live: repo, env, CI, image, secrets manager — hunt with `trufflehog` |
| Wallet Drainer | the approval flow — test the operator's own wallet with a controlled token |
| Signature Replay | a signed message replayed to the operator's own contract |
| Smart Contract Exploit | reentrancy, oracle manipulation, access control — the operator's own contract on a testnet |
| Flash Loan / Oracle / Bridge | the operator's own protocol on a fork/testnet |
| Front-Running / MEV | the operator's own mempool-visible transaction |
| Cross-Chain Replay | the chain's replay protection — the operator's own bridge |
| 51% / Sybil | governance and consensus — analyse, do not participate |
| Rug Pull | token contract review on the operator's own project |

```bash
# contract review tooling
pip install slither-analyzer
slither <contract.sol>
mythril <contract.sol>
# signature / tx tooling
python3 -m eth_abi decode <tx>
```

## Fraud lures (safe simulation)

Advance-Fee Fraud, Investment Scam, Fake Job Offer Scam, Fake Freelancer Client Scam, Fake NDA
Request, Fake Portfolio Request, Fake Rental Listing Scam, Marketplace Buyer/Seller Scam,
Overpayment Scam, Fake Escrow Scam, Fake Scholarship Scam, Fake Loan Offer Scam, Fake Insurance Claim,
Fake Tax Refund, Fake Warranty Claim, Fake Mystery Shopper, Fake Paid Review — see
`social-engineering.md`. Build the lure, test on the operator's own users, measure the detection.

## Deliverable

```
FLOW:      <the step that was broken>
EVIDENCE:  <the exact request or the transaction that succeeded>
IMPACT:    <money, data, or access at stake>
CONTROL:   <what should have blocked it>
FIX:       <the specific verification step to add>
```
