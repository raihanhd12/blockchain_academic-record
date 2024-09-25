const { ethers } = require("hardhat");

describe("Verifikasi SKKM di Kontrak SKKM oleh HMJ", function () {
    let SKKM, skkm, owner, student, hmj;
    let expect;

    // Mengimpor chai dan ethereum-waffle untuk assertion
    before(async function () {
        const chai = await import("chai");
        const { solidity } = await import("ethereum-waffle");
        chai.use(solidity);
        expect = chai.expect;
    });

    // Inisialisasi kontrak sebelum setiap pengujian
    beforeEach(async function () {
        SKKM = await ethers.getContractFactory("SKKM");
        [owner, student, hmj] = await ethers.getSigners();
        skkm = await SKKM.deploy();
        await skkm.deployed();

        // Menambahkan pengguna dengan peran mahasiswa dan HMJ
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "789", "Dept");

        // Mahasiswa menambahkan SKKM
        await skkm.connect(student).submitSKKM(
            "Activity 1",
            "Activity 1 EN",
            "CERT123",
            "Category 1",
            "Type 1",
            "Achievement 1",
            "Assessment 1",
            "ipfsHash1",
            10
        );
    });

    // Verifikasi SKKM oleh HMJ
    it("harus memverifikasi SKKM oleh HMJ", async function () {
        const tx = await skkm.connect(hmj).verifySKKM(0, true, "");
        const receipt = await tx.wait();
        console.log(`Verify SKKM transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const skkmRequest = await skkm.requests(0);
        expect(skkmRequest.status).to.equal(1); // Status.Verified
    });

    // Penolakan SKKM oleh HMJ
    it("harus menolak SKKM oleh HMJ dengan pesan penolakan", async function () {
        const tx = await skkm.connect(hmj).verifySKKM(0, false, "Data tidak valid");
        const receipt = await tx.wait();
        console.log(`Reject SKKM transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const skkmRequest = await skkm.requests(0);
        expect(skkmRequest.status).to.equal(2); // Status.Unverified
        expect(skkmRequest.unverifiedMessage).to.equal("Data tidak valid");
    });
});
