import test from "node:test";
import assert from "node:assert/strict";

import {
  atomicUnitsToXmr,
  isValidHash,
  parseBlockHeight,
  toGlobalIndices
} from "../src/utils.js";


test("converts atomic units to XMR: 709_440_000n => '0.00070944'", () => {
  assert.equal(
    atomicUnitsToXmr(709_440_000n),
    "0.00070944"
  );
});

test("converts exact whole XMR amount: 1_000_000_000_000n => '1'", () => {
  assert.equal(
    atomicUnitsToXmr(1_000_000_000_000n),
    "1"
  );
});

test("converts zero atomic units: 0n => '0'", () => {
  assert.equal( 
    atomicUnitsToXmr(0n),
    "0"
  );
});

test("converts fractional XMR amount: 1_500_000_000_000n => '1.5'", () => {
  assert.equal(
    atomicUnitsToXmr(1_500_000_000_000n),
    "1.5"
  );
});

test("accepts a valid transaction hash: hash = 'a'.repeat(64) => true", () => {
  const hash = "a".repeat(64);
  assert.equal(
    isValidHash(hash),
    true
  );
}); 

test("rejects a short transaction hash: hash = 'a'.repeat(63) => false", () => {
  const hash = "a".repeat(63);
  assert.equal(
    isValidHash(hash),
    false
  ); 
});

test("reject non-hex characters: hash = 'z'.repeat(64) => false", () => {
  const hash = "z".repeat(64);
  assert.equal(
    isValidHash(hash),
    false
  );
});

test("parses a valid block height: '3000000' => 3000000", () => {
  assert.equal(
    parseBlockHeight("3000000"),
    3000000
  );
});

test("reject a negative block height: '-1' => undefined", () => {
  assert.equal(
    parseBlockHeight("-1"),
    undefined
  );
});

test("reject a fraction block height: '1.5' => undefined", () => {
  assert.equal(
    parseBlockHeight("1.5"),
    undefined
  );
}); 

test("reject a invalid block height: 'hello' => undefined", () => {
  assert.equal(
    parseBlockHeight("hello"),
    undefined
  );
});

test("reject a invalid block height: '1e3' => undefined", () => {
  assert.equal(
    parseBlockHeight("1e3"),
    undefined
  );
}); 

test("reject a invalid block height: '' => undefined", () => {
  assert.equal(
    parseBlockHeight(""),
    undefined
  );
});

test("accepts a zero block height: '0' => 0", () => {
  assert.equal(
    parseBlockHeight("0"),
    0
  );
});

test("converts relative offsets to global indices: [5, 7, 17] => [5, 12, 29]", () => {
  const offsets = [5, 7, 17];
  assert.deepEqual(
    toGlobalIndices(offsets),
    [5, 12, 29]
  );
});

test("return an empty array for empty offsets: [] => []", () => {
  assert.deepEqual(
    toGlobalIndices([]),
    []
  );
});
