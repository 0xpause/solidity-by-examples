
const HelloWorld = artifacts.require("HelloWorld");

contract("HelloWorld", accounts => {

    let helloWorld;
    beforeEach(async () => {
        helloWorld = await HelloWorld.new();
    })

    it("should return 'Hello World'", async () => {
        const word = await helloWorld.greet();
        assert.equal(word, "Hello World")
    })
});