import assert from "assert";
import moneroTs from "monero-ts";
import {
  connectDaemon,
  getOuts
} from "../src/rpc.js";


export default class TestDaemon {
  
  runTests() {

    describe("TEST INTEGRATION", function() {

      after(async function() {
        await moneroTs.shutdown();
      });

      describe("connectDaemon", function() {

        it("connects to monerod and gets daemon info", async function() {
          const daemon = await connectDaemon();
          const info = await daemon.getInfo();
          assert(info.height > 0);
          assert.equal(typeof info.isSynchronized, "boolean");  
        });
      });

      describe("getOuts", function() {

        it("gets an output by global index", async function() {
          const response = await getOuts([0]);
          assert.equal(response.outs.length, 1);
          const output = response.outs[0];
          assert.equal(typeof output.height, "number");
          assert.equal(typeof output.key, "string");
          assert.equal(typeof output.mask, "string");
          assert.equal(typeof output.txid, "string");
          assert.equal(typeof output.unlocked, "boolean");
        });
      });
    });
  }
}