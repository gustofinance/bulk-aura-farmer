# BULK Aura Farmer

An intentionally small, open-source **BULK volume bot** and trading automation POC for builders experimenting with **BULK Aura farming, DeFi airdrop farming, open interest, maker liquidity, and perpetuals volume** in 2026.

**[Open the developer landing page](https://gustofinance.github.io/bulk-aura-farmer/)** · **[Join BULK](https://app.bulk.trade/ref/YETI)** · **[Read the source](https://github.com/gustofinance/bulk-aura-farmer)**

It is an independent community project. It is not an official BULK product, does not promise AURA, and is not financial advice. Trading perpetuals can lose your collateral.

## Quick answer

This bot runs one simple loop:

1. Read the selected BULK market's top bid.
2. Submit a buy-only **ALO / post-only maker order** at that bid.
3. Wait for a configurable period and cancel any remainder.
4. Use a market **taker order** for the unfilled remainder, if needed.
5. Place a native range/OCO exit with a take-profit and stop threshold.
6. Cancel protection and flatten with a reduce-only market sell when the maximum hold time is reached.

The default is `DRY_RUN=true` on `testnet`. Set `DRY_RUN=false` only after you have tested the account, market, size, and order lifecycle.

## Start here

The referral link is disclosed because it supports this project:

**[sign up and create burner at app.bulk.trade](https://app.bulk.trade/ref/YETI)**

## What is BULK?

[BULK Exchange](https://bulk.trade) is a Solana-native perpetuals exchange with an order book, signed trading actions, portfolio margin, and public HTTP/WebSocket APIs. The official developer documentation is the source of truth for endpoints, order fields, fees, market rules, and reward mechanics:

- [BULK documentation](https://docs.bulk.trade)
- [Place and cancel signed orders](https://docs.bulk.trade/api-reference/placeOrder)
- [Market ticker](https://docs.bulk.trade/api-reference/getTicker)
- [L2 order book](https://docs.bulk.trade/api-reference/getL2Book)
- [Account queries](https://docs.bulk.trade/api-reference/getAccount)
- [Conditional orders: TP, SL, range, and trailing](https://docs.bulk.trade/bulk-exchange/conditional-orders)
- [Fees and rebates](https://docs.bulk.trade/bulk-exchange/fees)
- [Referral program](https://docs.bulk.trade/bulk-exchange/referral)
- [Aura](https://docs.bulk.trade/bulk-exchange/points)

## How to earn AURA on BULK

The honest answer is that BULK controls the AURA rules and can change them. Use the official [Aura documentation](https://docs.bulk.trade/bulk-exchange/points) and the app's points/referrals pages as the current source of truth; do not assume that a particular amount of volume guarantees a points allocation, an airdrop, or future token value.

The practical activity path for a user is:

1. [Create or access a BULK.trade account](https://app.bulk.trade/ref/YETI).
2. Complete any current access or onboarding requirements shown by BULK.
3. Trade only with capital you can afford to lose, preferably on testnet first.
4. Generate genuine account activity while tracking fees, funding, slippage, liquidation risk, and the current AURA rules.
5. Review the official app and docs for eligibility, snapshots, multipliers, referral attribution, and claim instructions.

BULK's current referral documentation says referrer rewards are distributed from a dedicated weekly AURA pool. It also describes access codes for invite-only mainnet and says new users can unlock additional access codes through mainnet trading volume. Those are program rules, not a promise that this bot earns AURA for every user.

### What this bot measures and what it does not

This bot submits real signed orders when live mode is enabled. It can create executed notional and may affect a position's open interest while the position is open. It does not read or claim AURA, cannot guarantee eligibility, and does not manufacture profitable trading. The safest interpretation is: this is a small, inspectable execution example that can help a builder learn BULK's API and measure their own results.

## How the bot works

The entry is maker-first. ALO means **Add Liquidity Only** / post-only: BULK rejects the order if it would cross the spread. If the maker order is not filled within `MAKER_WAIT_SECONDS`, the bot cancels it and optionally takes the unfilled remainder with a market order.

After entry, the bot uses BULK's range/OCO conditional order to set a lower stop threshold and an upper take-profit threshold. The target includes the configured expected maker and taker fees plus `PROFIT_TARGET_BPS` of intended net room before funding, slippage, and other costs. If the position stays open past `MAX_HOLD_MINUTES`, the bot cancels the protection and attempts a reduce-only market flatten.

The bot refuses to start a round while the selected market is non-flat. Use a dedicated account and do not run another trading process against the same symbol/account.

### Fee assumptions

At the time of this release, the local defaults assume 0 bps maker before `2026-10-05` and 3.5 bps maker after that date, with 3.5 bps taker. These are configurable assumptions used to size the profit target; they are not a substitute for BULK's live fee state or account fee tier.

The official [BULK fee documentation](https://docs.bulk.trade/bulk-exchange/fees) currently describes tiered maker/taker pricing and a scheduled protocol policy. Re-check it and the read-only [`/feeState`](https://docs.bulk.trade/api-reference/getFeeState) endpoint before trading. Update `MAKER_FEE_BPS_BEFORE`, `MAKER_FEE_BPS_AFTER`, `TAKER_FEE_BPS`, and `FEE_SWITCH_DATE` if the live policy differs.

## Supported markets on bulk.trade 


| Market | BULK trade page |
| --- | --- |
| BTC-USD | [Trade BTC-USD](https://app.bulk.trade/trade/BTC-USD?ref=YETI) |
| SOL-USD | [Trade SOL-USD](https://app.bulk.trade/trade/SOL-USD?ref=YETI) |
| ETH-USD | [Trade ETH-USD](https://app.bulk.trade/trade/ETH-USD?ref=YETI) |
| HYPE-USD | [Trade HYPE-USD](https://app.bulk.trade/trade/HYPE-USD?ref=YETI) |
| NEAR-USD | [Trade NEAR-USD](https://app.bulk.trade/trade/NEAR-USD?ref=YETI) |
| ZEC-USD | [Trade ZEC-USD](https://app.bulk.trade/trade/ZEC-USD?ref=YETI) |
| MEGA-USD | [Trade MEGA-USD](https://app.bulk.trade/trade/MEGA-USD?ref=YETI) |
| LIT-USD | [Trade LIT-USD](https://app.bulk.trade/trade/LIT-USD?ref=YETI) |
| JUP-USD | [Trade JUP-USD](https://app.bulk.trade/trade/JUP-USD?ref=YETI) |
| AAVE-USD | [Trade AAVE-USD](https://app.bulk.trade/trade/AAVE-USD?ref=YETI) |
| XRP-USD | [Trade XRP-USD](https://app.bulk.trade/trade/XRP-USD?ref=YETI) |
| FARTCOIN-USD | [Trade FARTCOIN-USD](https://app.bulk.trade/trade/FARTCOIN-USD?ref=YETI) |
| TAO-USD | [Trade TAO-USD](https://app.bulk.trade/trade/TAO-USD?ref=YETI) |
| MON-USD | [Trade MON-USD](https://app.bulk.trade/trade/MON-USD?ref=YETI) |
| XPL-USD | [Trade XPL-USD](https://app.bulk.trade/trade/XPL-USD?ref=YETI) |
| SUI-USD | [Trade SUI-USD](https://app.bulk.trade/trade/SUI-USD?ref=YETI) |
| JTO-USD | [Trade JTO-USD](https://app.bulk.trade/trade/JTO-USD?ref=YETI) |
| ENA-USD | [Trade ENA-USD](https://app.bulk.trade/trade/ENA-USD?ref=YETI) |
| BNB-USD | [Trade BNB-USD](https://app.bulk.trade/trade/BNB-USD?ref=YETI) |
| DOGE-USD | [Trade DOGE-USD](https://app.bulk.trade/trade/DOGE-USD?ref=YETI) |

The bot accepts any symbol supported by the selected BULK environment. The list above is a convenience directory, not a liquidity or suitability ranking.

## Install and configure

Requirements: Node.js 22+ and a dedicated BULK trading key. The key is used locally to sign transactions; it is never sent to this repository or logged by the bot.

```bash
npm install
cp .env.example .env
# edit .env and set PRIVATE_KEY
npm run build
npm start
```

Important `.env` values:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PRIVATE_KEY` | Base58 Ed25519 secret key for the trading account | required |
| `NETWORK` | `testnet`, `devnet`, or `mainnet` | `testnet` |
| `DRY_RUN` | Read book/account data without submitting orders | `true` |
| `SYMBOL` | Market to trade | `BTC-USD` |
| `TRADE_SIZE` | Base asset size per round | `0.001` |
| `INTERVAL_MINUTES` | Delay between rounds | `5` |
| `MAKER_WAIT_SECONDS` | Time to wait for maker fills | `20` |
| `PROFIT_TARGET_BPS` | Intended net profit room before costs | `20` |
| `STOP_LOSS_BPS` | Stop distance below entry | `50` |
| `MAX_HOLD_MINUTES` | Maximum position lifetime | `10` |
| `MAKER_FEE_BPS_BEFORE` | Maker fee assumption before switch date | `0` |
| `MAKER_FEE_BPS_AFTER` | Maker fee assumption on/after switch date | `3.5` |
| `TAKER_FEE_BPS` | Taker fee assumption | `3.5` |
| `FEE_SWITCH_DATE` | UTC date for the local fee assumption | `2026-10-05T00:00:00Z` |

For live mainnet mode, set `DRY_RUN=false` and `CONFIRM_MAINNET=I_UNDERSTAND`. The confirmation exists to make an accidental mainnet launch harder.

## Run safely

Start with `NETWORK=testnet`, `DRY_RUN=true`, and a small size. Then set `DRY_RUN=false` on testnet and watch the account page, fills, open orders, fees, funding, and position lifecycle. Only after that should you consider mainnet.

This is not a market-making system: it does not quote both sides continuously, optimize inventory, calculate realized PnL, or guarantee a maker fill. It is a readable POC for extending into those features.

## Build on it

Useful next extensions include:

- account WebSocket streams instead of polling;
- both long and short entry modes;
- exchange-info precision and minimum-notional validation;
- realized PnL, fee, funding, and fill-history accounting;
- configurable max daily notional and circuit breakers;
- an inventory-aware two-sided maker strategy;
- a test harness with mocked ticker, book, account, and signed responses.

## Related BULK topics

This repository is a practical starting point for the following related questions:

| Search intent | What this repository covers |
| --- | --- |
| BULK volume bot | Scheduled, configurable executed volume with a maker-first entry and taker fallback. |
| BULK Aura farming | What is known, what is unknown, and where to check current AURA rules. |
| BULK airdrop farming tool | A transparent execution POC, not a promise of an airdrop or reward allocation. |
| BULK trading bot | Node.js signing, market data, account polling, order submission, and exits. |
| BULK maker bot | ALO/post-only limit entry at the top bid with cancellation and fill checks. |
| BULK taker bot | Market-order fallback for an unfilled entry remainder and reduce-only flattening. |
| BULK open interest bot | A small position lifecycle that can create open interest while the position is open. |
| BULK perpetuals bot | Position, funding, fee, liquidation, and collateral risks that must be monitored. |
| BULK referral code | The disclosed YETI referral and direct links to supported BULK markets. |

If you build on this POC, open an issue with the market, network, configuration, and redacted response shape. Do not post private keys, account secrets, or unredacted signed payloads. Useful bug reports and small integrations create better discovery signals than artificial activity.

## Disclaimer and disclosure

This software can place leveraged perpetuals orders. You are responsible for your key, account, collateral, fees, funding, liquidation risk, market risk, and compliance obligations. The YETI links are referral links for this project's distribution; using them may attribute your account to the referral relationship under BULK's current program rules. No AURA, airdrop, profit, or eligibility outcome is guaranteed.

MIT licensed. See [LICENSE](LICENSE).
