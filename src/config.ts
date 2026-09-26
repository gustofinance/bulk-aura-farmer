import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function numberEnv(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }
  return value;
}

const network = (process.env.NETWORK || "testnet") as "mainnet" | "testnet" | "devnet";
if (!["mainnet", "testnet", "devnet"].includes(network)) {
  throw new Error("NETWORK must be mainnet, testnet, or devnet");
}

const dryRun = (process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
if (network === "mainnet" && !dryRun && process.env.CONFIRM_MAINNET !== "I_UNDERSTAND") {
  throw new Error("Mainnet trading requires CONFIRM_MAINNET=I_UNDERSTAND");
}

export const config = {
  privateKey: required("PRIVATE_KEY"),
  network,
  symbol: process.env.SYMBOL || "BTC-USD",
  tradeSize: numberEnv("TRADE_SIZE", 0.001),
  intervalMinutes: numberEnv("INTERVAL_MINUTES", 5),
  makerWaitSeconds: numberEnv("MAKER_WAIT_SECONDS", 20),
  pollSeconds: numberEnv("POLL_SECONDS", 2),
  profitTargetBps: numberEnv("PROFIT_TARGET_BPS", 20),
  stopLossBps: numberEnv("STOP_LOSS_BPS", 50),
  maxHoldMinutes: numberEnv("MAX_HOLD_MINUTES", 10),
  makerFeeBpsBefore: numberEnv("MAKER_FEE_BPS_BEFORE", 0),
  makerFeeBpsAfter: numberEnv("MAKER_FEE_BPS_AFTER", 3.5),
  takerFeeBps: numberEnv("TAKER_FEE_BPS", 3.5),
  feeSwitchDate: process.env.FEE_SWITCH_DATE || "2026-10-05T00:00:00Z",
  dryRun,
};

export function expectedMakerFeeBps(now = new Date()): number {
  return now >= new Date(config.feeSwitchDate) ? config.makerFeeBpsAfter : config.makerFeeBpsBefore;
}

export const BASE_URLS: Record<string, string> = {
  mainnet: "https://mainnet-api1.bulk.trade/api/v1",
  testnet: "https://exchange-api.bulk.trade/api/v1",
  devnet: "https://exchange-api.bulk.trade/api/v1",
};
