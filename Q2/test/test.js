const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // verify zkey and wasm key for input a = 1, b = 2
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // print the output for given input (1*2), which is in 1st key of public signals
        console.log('1x2 =',publicSignals[0]);

        // convert public signal to BigInteger
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert proof to BigInteger
        const editedProof = unstringifyBigInts(proof);
        // get calldata from proof and public signal
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        // replace the following characters with empty string, and split based on comma
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        // create params     
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // check for verification using the params
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        // create random params 
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        // verify that the params don't verify the proof
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here 
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        // print the output for given input (1 * 2 * 3), which is in 1st key of public signals
        console.log('1x2x3 =',publicSignals[0]);

        // convert public signal to BigInteger
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert proof to BigInteger
        const editedProof = unstringifyBigInts(proof);
        // get calldata from proof and public signal
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        // replace the following characters with empty string, and split based on comma
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        // create params     
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // check for verification using the params
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/_plonkMultiplier3/circuit_final.zkey");
        // print the output for given input (1 * 2 * 3), which is in 1st key of public signals
        console.log('1x2x3 =',publicSignals[0]);
        // console.log(proof)

        // convert public signal to BigInteger
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert proof to BigInteger
        const editedProof = unstringifyBigInts(proof);
        // get calldata from proof and public signal
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        
        // replace the following characters with empty string, and split based on comma
        const argv = calldata.replace(/["[\]\s]/g, "").split(',');

        // create params
        const proof_ = argv[0];
        const Input = [argv[1].toString()];

        // Call verify proof method using the above prepared parameters and assert it to be true
        expect(await verifier.verifyProof(proof_, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let proof_ = 0x01de96bc;
        let Input = ['0x000078'];
        expect(await verifier.verifyProof(proof_, Input)).to.be.false;
    });
});