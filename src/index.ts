import { config, expectedMakerFeeBps } from "./config";
import {
  cancelOrder,
  getAccount,
  getBook,
  limitOrder,
  marketOrder,
  placeProfitProtection,
  pubkey,
} from "./bulkClient";
import { MARKET_LINKS, REFERRAL_LINK } from "./links";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function positionFor(account: Awaited<ReturnType<typeof getAccount>>) {
  return account.positions.find((position) => position.symbol === config.symbol);
}

async function waitForPosition(previousSize: number, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const position = positionFor(await getAccount());
    if ((position?.size ?? 0) > previousSize) return position;
    await sleep(config.pollSeconds * 1_000);
  }
  return positionFor(await getAccount());
}

async function roundTrip() {
  const initial = positionFor(await getAccount());
  if (initial && Math.abs(initial.size) > 1e-9) {
    throw new Error(`Refusing to trade: ${config.symbol} position is not flat (${initial.size})`);
  }

  const { bid } = await getBook(config.symbol);
  const makerSize = config.tradeSize;
  console.log(`[${new Date().toISOString()}] maker buy ${makerSize} ${config.symbol} @ ${bid}`);

  if (config.dryRun) {
    console.log("DRY_RUN=true; no order submitted");
    return;
  }

  const maker = await limitOrder(true, bid, makerSize);
  const makerOrderId = maker.orderId;
  await waitForPosition(0, config.makerWaitSeconds * 1_000);

  if (makerOrderId) await cancelOrder(makerOrderId).catch((error) => console.warn("Maker cancel:", error));

  // Refresh after cancellation so fills that landed during the cancel race are included.
  let position = positionFor(await getAccount());
  const makerFilled = Math.max(0, position?.size ?? 0);
  const remainder = Math.max(0, makerSize - makerFilled);

  if (remainder > 1e-9) {
    console.log(`[${new Date().toISOString()}] taker buy ${remainder} ${config.symbol}`);
    await marketOrder(true, remainder);
    position = await waitForPosition(makerFilled, 15_000);
  }

  const filled = Math.max(0, position?.size ?? 0);
  if (filled <= 1e-9) {
    console.log("No fill; waiting for the next round");
    return;
  }

  const entryPrice = Number(position?.price ?? 0);
  if (!Number.isFinite(entryPrice) || entryPrice <= 0) throw new Error("Could not read entry price");
  const makerFeeBps = expectedMakerFeeBps();
  const expectedRoundTripFees = makerFeeBps + config.takerFeeBps;
  console.log(`[${new Date().toISOString()}] protecting ${filled} ${config.symbol} from ${entryPrice}`);
  console.log(`Expected fee budget: ${expectedRoundTripFees} bps; target includes ${config.profitTargetBps} bps net before funding/slippage`);
  const protection = await placeProfitProtection(filled, entryPrice);
  if (protection.orderId) console.log(`TP/SL range order: ${protection.orderId}`);

  const deadline = Date.now() + config.maxHoldMinutes * 60_000;
  while (Date.now() < deadline) {
    const current = positionFor(await getAccount());
    if (!current || current.size <= 1e-9) {
      console.log("Position closed by take-profit or stop-loss");
      return;
    }
    await sleep(config.pollSeconds * 1_000);
  }

  if (protection.orderId) await cancelOrder(protection.orderId).catch((error) => console.warn("Protection cancel:", error));
  const remaining = positionFor(await getAccount());
  if (remaining && remaining.size > 1e-9) {
    console.log(`[${new Date().toISOString()}] max hold reached; flattening ${remaining.size}`);
    await marketOrder(false, remaining.size, true);
  }
}

async function main() {
  console.log(`Trading account: ${pubkey}`);
  console.log(`Network: ${config.network}`);
  console.log(`Symbol: ${config.symbol}, size: ${config.tradeSize}, every ${config.intervalMinutes}m`);
  console.log(`Mode: ${config.dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Referral: ${REFERRAL_LINK}`);
  console.log(`Market: ${MARKET_LINKS[config.symbol] ?? `https://app.bulk.trade/trade/${config.symbol}?ref=YETI`}`);
  console.log(`Expected maker fee: ${expectedMakerFeeBps()} bps; taker fee: ${config.takerFeeBps} bps`);

  while (true) {
    try {
      await roundTrip();
    } catch (err) {
      console.error("Round trip failed:", err);
    }
    await sleep(config.intervalMinutes * 60_000);
  }
}

main();
