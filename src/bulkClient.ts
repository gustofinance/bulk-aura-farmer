import { config, BASE_URLS, expectedMakerFeeBps } from "./config";

// bulk-keychain's published .d.ts has a syntax error (`delete` used as a
// parameter name), which breaks tsc. Load it untyped via require instead.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { NativeSigner } = require("bulk-keychain");

interface SignedTransactionOutput {
  actions: string;
  nonce: string;
  account: string;
  signer: string;
  signature: string;
  orderId?: string;
}

const signer = NativeSigner.fromBase58(config.privateKey, config.network);
const baseUrl = BASE_URLS[config.network];

export const pubkey = signer.pubkey;

export interface Position {
  symbol: string;
  size: number;
  price: number;
  vwap?: number;
}

export interface OpenOrder {
  symbol: string;
  orderId: string;
  size: number;
  filledSize: number;
  vwap: number;
  maker: boolean;
  reduceOnly: boolean;
  orderType: string;
}

export interface AccountSnapshot {
  positions: Position[];
  openOrders: OpenOrder[];
}

// The signed output carries `actions` as a JSON string; the HTTP API wants
// the parsed array back in the envelope. Just unwrap it here.
async function submit(signed: SignedTransactionOutput) {
  const body = {
    actions: JSON.parse(signed.actions),
    nonce: signed.nonce,
    account: signed.account,
    signer: signed.signer,
    signature: signed.signature,
  };

  const res = await fetch(`${baseUrl}/order`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok || json.status !== "ok") {
    throw new Error(`BULK API error: ${res.status} ${JSON.stringify(json)}`);
  }
  return { ...json, orderId: signed.orderId };
}

async function getJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(`BULK API error: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

export async function getMarkPrice(symbol: string): Promise<number> {
  const res = await fetch(`${baseUrl}/ticker/${symbol}`);
  if (!res.ok) throw new Error(`Failed to fetch ticker for ${symbol}: ${res.status}`);
  const ticker = await res.json();
  const mark = Number(ticker.markPrice);
  if (!Number.isFinite(mark) || mark <= 0) throw new Error(`Invalid mark price for ${symbol}`);
  return mark;
}

export async function getBook(symbol: string): Promise<{ bid: number; ask: number }> {
  const json = await getJson(`${baseUrl}/l2book?type=l2book&coin=${encodeURIComponent(symbol)}&nlevels=1`);
  const [bids, asks] = json.levels ?? [];
  const bid = Number(bids?.[0]?.px);
  const ask = Number(asks?.[0]?.px);
  if (!Number.isFinite(bid) || !Number.isFinite(ask) || bid <= 0 || ask <= bid) {
    throw new Error(`No usable ${symbol} bid/ask in order book`);
  }
  return { bid, ask };
}

export async function getAccount(): Promise<AccountSnapshot> {
  const json = await getJson(`${baseUrl}/account`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "fullAccount", user: pubkey }),
  });
  const account = json?.[0]?.fullAccount;
  if (!account) throw new Error(`Unexpected account response: ${JSON.stringify(json)}`);
  return { positions: account.positions ?? [], openOrders: account.openOrders ?? [] };
}

export async function limitOrder(isBuy: boolean, price: number, size: number) {
  const signed = signer.sign({
    type: "order",
    symbol: config.symbol,
    isBuy,
    size,
    price,
    reduceOnly: false,
    iso: false,
    orderType: { type: "limit", tif: "ALO" },
  });
  return submit(signed);
}

export async function marketOrder(isBuy: boolean, size = config.tradeSize, reduceOnly = false) {
  const signed = signer.sign({
    type: "order",
    symbol: config.symbol,
    isBuy,
    size,
    price: 0,
    reduceOnly,
    iso: false,
    orderType: { type: "market", isMarket: true, triggerPx: 0 },
  });
  return submit(signed);
}

export async function cancelOrder(orderId: string) {
  const signed = signer.sign({
    type: "cancel",
    symbol: config.symbol,
    orderId,
  });
  return submit(signed);
}

export async function placeProfitProtection(size: number, entryPrice: number) {
  const feeBudgetBps = expectedMakerFeeBps() + config.takerFeeBps;
  const target = entryPrice * (1 + (feeBudgetBps + config.profitTargetBps) / 10_000);
  const stop = entryPrice * (1 - config.stopLossBps / 10_000);
  const signed = signer.sign({
    type: "range",
    symbol: config.symbol,
    isBuy: true,
    size,
    pmin: stop,
    pmax: target,
    iso: false,
  });
  return submit(signed);
}
