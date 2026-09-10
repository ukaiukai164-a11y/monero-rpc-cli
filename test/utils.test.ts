import test from "node:test";
import assert from "node:assert/strict";

import {
  atomicUnitsToXmr,
  isValidHash,
  parseBlockHeight
} from "../src/utils.js";


test("converts atomic units to XMR", () => {
  assert.equal(
    atomicUnitsToXmr(709_440_000n),
    "0.00070944"
  );
});

test("converts exact whole XMR amount", () => {
  assert.equal(
    atomicUnitsToXmr(1_000_000_000_000n),
    "1"
  );
});

test("converts zero atomic units", () => {
  assert.equal( 
    atomicUnitsToXmr(0n),
    "0"
  );
});

test("converts fractional XMR amount", () => {
  assert.equal(
    atomicUnitsToXmr(1_500_000_000_000n),
    "1.5"
  );
});

test("accepts a valid transaction hash", () => {
  const hash = "a".repeat(64);
  assert.equal(
    isValidHash(hash),
    true
  );
}); 

test("rejects a short transaction hash", () => {
  const hash = "a".repeat(63);
  assert.equal(
    isValidHash(hash),
    false
  ); 
});

test("reject non-hex characters", () => {
  const hash = "z".repeat(64);
  assert.equal(
    isValidHash(hash),
    false
  );
});

test("parses a valid block height", () => {
  assert.equal(
    parseBlockHeight("3000000"),
    3000000
  );
});

test("reject a negative block height", () => {
  assert.equal(
    parseBlockHeight("-1"),
    undefined
  );
});

test("reject a fraction block height", () => {
  assert.equal(
    parseBlockHeight("1.5"),
    undefined
  );
}); 

test("reject a invalid block height", () => {
  assert.equal(
    parseBlockHeight("hello"),
    undefined
  );
});

test("reject a invalid block height", () => {
  assert.equal(
    parseBlockHeight(""),
    undefined
  );
});

test("accepts a zero block height", () => {
  assert.equal(
    parseBlockHeight("0"),
    0
  );
});
