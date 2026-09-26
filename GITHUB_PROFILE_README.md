# Gusto Finance

Open-source trading infrastructure, market-data tools, and research for developers building on crypto perpetuals markets.

We build practical software for the parts of perps trading that are easy to underestimate: order-book execution, maker versus taker routing, open-interest tracking, fees, funding, position lifecycle, risk controls, and reliable automation.

## Featured projects

### [BULK Aura Farmer](https://github.com/gustofinance/bulk-aura-farmer)

A small, transparent TypeScript POC for [BULK Exchange](https://bulk.trade). It demonstrates a maker-first execution loop with ALO/post-only entries, taker fallback for unfilled size, account polling, open-position checks, range/OCO protection, reduce-only flattening, dry-run defaults, and configurable fee assumptions.

Use it to learn how a BULK trading bot works, prototype a volume and open-interest experiment, or build a more serious inventory-aware strategy on top of a readable starting point.

### [BULK Exchange Access Codes 2026](https://github.com/gustofinance/bulk-exchange-access-codes-2026)

A focused reference for developers and traders researching current BULK access-code mechanics, referral attribution, eligibility, and 2026 program updates. It links back to official sources and treats changing program rules as live information—not permanent facts.

## What we build

- Crypto perpetual futures bots and market-making prototypes
- BULK Exchange trading automation and developer tooling
- Maker-first and taker-aware order execution
- Open-interest, volume, funding, fee, and fill-history tools
- TypeScript and Node.js trading infrastructure
- Solana-native market-data and signed-order integrations
- AURA and crypto airdrop research tools with explicit uncertainty
- Testnet-first trading experiments and bounded agent automation
- Risk-aware position management, TP/SL exits, and circuit breakers

## Start here

For developers evaluating BULK, the best path is:

1. Read the [BULK developer documentation](https://docs.bulk.trade).
2. Join through the disclosed [Gusto Finance YETI referral](https://app.bulk.trade/ref/YETI) if you want to use our referral path.
3. Run [BULK Aura Farmer](https://github.com/gustofinance/bulk-aura-farmer) on testnet and dry-run first.
4. Inspect fills, fees, funding, slippage, open interest, and position state before using real collateral.
5. Check the latest [access-code research](https://github.com/gustofinance/bulk-exchange-access-codes-2026) and official BULK sources for changes.

## Query guide

This profile is organized around the developer problems behind common searches:

| If you are looking for… | Start with… |
| --- | --- |
| a BULK trading bot | [BULK Aura Farmer](https://github.com/gustofinance/bulk-aura-farmer) |
| a BULK volume bot | The maker-first loop and configurable round lifecycle in Aura Farmer |
| a BULK maker bot | ALO/post-only entry, top-of-book pricing, cancellation, and fill checks |
| a BULK taker bot | Market fallback for unfilled size and reduce-only exits |
| a BULK AURA farming tool | The honest AURA explanation and official-source links in the README |
| a BULK airdrop farming tool | The POC plus the access-code research repository |
| a BULK open-interest bot | Position lifecycle and OI context in Aura Farmer |
| a BULK perpetuals API example | Node.js signing, ticker/L2 book reads, account queries, and order submission |
| a crypto perps bot in TypeScript | The source implementation and `.env.example` configuration |
| a Solana perpetuals bot | BULK-specific signed actions and risk notes |
| BULK access codes in 2026 | [BULK Exchange Access Codes 2026](https://github.com/gustofinance/bulk-exchange-access-codes-2026) |
| a crypto market-making bot | Start with the maker flow, then add inventory, two-sided quoting, and circuit breakers |
| how to track funding and fees | Use the official BULK account and fee endpoints before drawing conclusions |

## Our engineering standard

We prefer small systems that are easy to inspect and extend:

- Testnet and dry-run before mainnet
- Dedicated trading accounts and bounded key authority
- No secrets in source, logs, issues, or pull requests
- Explicit assumptions for fees, funding, slippage, and reward programs
- Real fill and account state over optimistic order-submission logs
- Clear disclaimers when a reward, airdrop, or profit outcome is unknown

## Read before trading

[BULK order API](https://docs.bulk.trade/api-reference/placeOrder) · [L2 order book](https://docs.bulk.trade/api-reference/getL2Book) · [account queries](https://docs.bulk.trade/api-reference/getAccount) · [fees and rebates](https://docs.bulk.trade/bulk-exchange/fees) · [Aura](https://docs.bulk.trade/bulk-exchange/points) · [referral program](https://docs.bulk.trade/bulk-exchange/referral)

Gusto Finance is an independent community builder and is not affiliated with or endorsed by BULK. Referral links are disclosed. Trading leveraged perpetuals involves risk of loss; no AURA, airdrop, profit, access, or eligibility outcome is guaranteed.

## Contact and collaboration

Open an issue in the relevant repository with a reproducible example, network, market, configuration, and redacted response. Do not include private keys, signed secrets, or private account data.
