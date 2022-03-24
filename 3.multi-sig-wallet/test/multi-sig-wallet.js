
const { assert } = require("chai");
const chai = require("chai")
chai.use(require("chai-as-promised"))

const expect = chai.expect

const MultiSigWallet = artifacts.require("MultiSigWallet");

contract("MultiSigWallet", accounts => {
    const verifiers = [accounts[0], accounts[1], accounts[2]];
    const zeroAddress = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
    const num_confirmations = 2;

    let wallet;
    beforeEach(async () => {
        wallet = await MultiSigWallet.new(verifiers, num_confirmations);
    })

    describe("constructor", async () => {
        it("should reject if no verifiers", async () => {
            await expect(MultiSigWallet.new([], num_confirmations)).to.be.rejected;
        })
        it("should reject if num verifiers < num confirmations", async () => {
            await expect(MultiSigWallet.new(verifiers, 4)).to.be.rejected;
        })
        it("should reject if zero address in verifiers", async () => {
            await expect(MultiSigWallet.new([accounts[0], accounts[1], zeroAddress], 2)).to.be.rejected;
        })
        it("should reject if verifiers not unique", async () => {
            await expect(MultiSigWallet.new([accounts[0], accounts[0], accounts[1]], 2)).to.be.rejected;
        })
    })

    describe("submit", async () => {
        it("should submit", async () => {
            await wallet.submit(accounts[3], 0, "0x1234", {from: accounts[0]});
            assert.equal(await wallet.getTxCount(), 1);
            const tx = await wallet.getTx(0);
            assert.equal(tx.txId, 0);
            assert.equal(tx.to, accounts[3]);
            assert.equal(tx.value, 0);
            assert.equal(tx.data, "0x1234");
            assert.equal(tx.excuted, false);
            assert.equal(tx.numConfirmed, 0);
        })
        it("should reject if not verifier", async () => {
            await expect(wallet.submit(accounts[3], 0, "0x1234", {from: accounts[4]}))
                .to.be.rejected;
        })
    })

    describe("confirm", async () => {
        beforeEach(async () => {
            await wallet.submit(accounts[3], 0, "0x1234", {from: accounts[0]});
        })
        it("should confirm", async () => {
            await wallet.confirm(0, {from: accounts[1]});
            const tx = await wallet.getTx(0);
            assert.equal(tx.numConfirmed, 1);
            assert.equal(await wallet.isConfirmed(0, accounts[1]), true);
        })
        it("should reject if not verifier", async () => {
            await expect(wallet.confirm(0, {from: accounts[3]})).to.be.rejected;
        })
        it("should reject if txId not exist", async () => {
            await expect(wallet.confirm(1, {from: accounts[1]})).to.be.rejected;
        })
        it("should reject if tx already confirmed", async () => {
            await wallet.confirm(0, {from: accounts[1]});
            await expect(wallet.confirm(0, {from: accounts[1]})).to.be.rejected;
        })
        it("should reject if tx already excuted", async () => {
            await wallet.confirm(0, {from: accounts[0]});
            await wallet.confirm(0, {from: accounts[1]});
            await wallet.excute(0, {from: accounts[0]});
            await expect(wallet.confirm(0, {from: accounts[1]})).to.be.rejected;
        })
    })

    describe("revoke", async () => {
        const verifer = accounts[0];
        beforeEach(async () => {
            await wallet.submit(accounts[3], 0, "0x1234", {from: verifer});            
            await wallet.confirm(0, {from: verifer});
        })
        it("should revoke", async () => {
            assert.equal(await wallet.isConfirmed(0, verifer), true);
            await wallet.revoke(0, {from: verifer});
            assert.equal(await wallet.isConfirmed(0, verifer), false);
        })
        it("should reject if not verifier", async () => {
            await expect(wallet.revoke(0, {from: accounts[3]})).to.be.rejected;
        })
        it("should reject if tx not exist", async () => {
            await expect(wallet.revoke(1, {from: verifer})).to.be.rejected;
        })
        it("should reject if tx excuted", async () => {
            await wallet.confirm(0, {from: accounts[1]});
            await wallet.excute(0, {from: accounts[0]});
            assert.equal((await wallet.getTx(0)).excuted, true);
            await expect(wallet.revoke(0, {from: verifer})).to.be.rejected;   
        })
        it("should reject if tx not confirmed", async () => {
            await expect(wallet.revoke(0, {from: accounts[1]})).to.be.rejected;
        })
    })

    describe("excute", async () => {
        const verifer = accounts[0];
        beforeEach(async () => {
            await wallet.submit(accounts[3], 0, "0x1234", {from: verifer});            
            await wallet.confirm(0, {from: verifer});  
        })
        it("should excute", async () => {
            await wallet.confirm(0, {from: accounts[1]});
            await wallet.excute(0, {from: accounts[0]});
            assert.equal((await wallet.getTx(0)).excuted, true);
        })
        it("shoud reject if tx not exist", async () => {
            await wallet.confirm(0, {from: accounts[1]});
            await expect(wallet.excute(1, {from: accounts[0]})).to.be.rejected;
        })
        it("shoud reject if tx excuted", async () => {
            await wallet.confirm(0, {from: accounts[1]});
            await wallet.excute(0, {from: accounts[0]});  
            assert.equal((await wallet.getTx(0)).excuted, true);
            await expect(wallet.excute(0, {from: accounts[0]})).to.be.rejected;
        })
        it("shoud reject if num confirmations not reached", async () => {
            await expect(wallet.excute(0, {from: accounts[0]})).to.be.rejected;
        })
    })
});