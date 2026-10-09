import assert from "assert";

import {
  atomicUnitsToXmr,
  isValidHash,
  parseBlockHeight,
  toGlobalIndices
} from "../src/utils.js";

export default class TestUtils {
  
  runTests() {

    describe("TEST UTILS", function() {

      describe("atomicUnitsToXmr", function() {

        it("converts atomic units to XMR: 709_440_000n => '0.00070944'", function() {
          assert.equal(
            atomicUnitsToXmr(709_440_000n),
            "0.00070944"
          );
        });

        it("converts exact whole XMR amount: 1_000_000_000_000n => '1'", function() {
          assert.equal(
            atomicUnitsToXmr(1_000_000_000_000n),
            "1"
          );
        });

        it("converts zero atomic units: 0n => '0'", function() {
          assert.equal( 
            atomicUnitsToXmr(0n),
            "0"
          );
        });

        it("converts fractional XMR amount: 1_500_000_000_000n => '1.5'", function() {
          assert.equal(
            atomicUnitsToXmr(1_500_000_000_000n),
            "1.5"
          );
        });
      });

      describe("isValidHash", function() {

        it("accepts a valid transaction hash: hash = 'a'.repeat(64) => true", function() {
          const hash = "a".repeat(64);
          assert.equal(
            isValidHash(hash),
            true
          );
        }); 

        it("rejects a short transaction hash: hash = 'a'.repeat(63) => false", function() {
          const hash = "a".repeat(63);
          assert.equal(
            isValidHash(hash),
            false
          ); 
        });

        it("reject non-hex characters: hash = 'z'.repeat(64) => false", function() {
          const hash = "z".repeat(64);
          assert.equal(
            isValidHash(hash),
            false
          );
        });
      });

      describe("parseBlockHeight", function() {

        it("parses a valid block height: '3000000' => 3000000", function() {
          assert.equal(
            parseBlockHeight("3000000"),
            3000000
          );
        });

        it("reject a negative block height: '-1' => undefined", function() {
          assert.equal(
            parseBlockHeight("-1"),
            undefined
          );
        });

        it("reject a fraction block height: '1.5' => undefined", function() {
          assert.equal(
            parseBlockHeight("1.5"),
            undefined
          );
        }); 

        it("reject a invalid block height: 'hello' => undefined", function() {
          assert.equal(
            parseBlockHeight("hello"),
            undefined
          );
        });

        it("reject a invalid block height: '1e3' => undefined", function() {
          assert.equal(
            parseBlockHeight("1e3"),
            undefined
          );
        }); 

        it("reject a invalid block height: '' => undefined", function() {
          assert.equal(
            parseBlockHeight(""),
            undefined
          );
        });

        it("accepts a zero block height: '0' => 0", function() {
          assert.equal(
            parseBlockHeight("0"),
            0
          );
        });
      });

      describe("toGlobalIndices", function() {

        it("converts relative offsets to global indices: [5, 7, 17] => [5, 12, 29]", function() {
          const offsets = [5, 7, 17];
          assert.deepEqual(
            toGlobalIndices(offsets),
            [5, 12, 29]
          );
        });

        it("return an empty array for empty offsets: [] => []", function() {
          assert.deepEqual(
            toGlobalIndices([]),
            []
          );
        });
      });
    });
  }
}
