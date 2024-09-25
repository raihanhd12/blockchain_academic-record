const { ethers } = require("hardhat");

describe("Validasi SKKM di Kontrak SKKM oleh HMJ", function () {
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

    // Validasi SKKM oleh HMJ
    it("harus memvalidasi SKKM oleh HMJ", async function () {
        // Verifikasi SKKM oleh HMJ
        await skkm.connect(hmj).verifySKKM(0, true, "");

        // Validasi SKKM oleh HMJ
        const tx = await skkm.connect(hmj).validateSKKM(
            0,
            "Validated Category 1",
            "Validated Type 1",
            "Validated Achievement 1",
            "Validated Assessment 1",
            15
        );
        const receipt = await tx.wait();
        console.log(`Validate SKKM transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const skkmRequest = await skkm.requests(0);
        expect(skkmRequest.status).to.equal(3); // Status.Valid
        expect(skkmRequest.activityCategory).to.equal("Validated Category 1");
        expect(skkmRequest.creditPoin).to.equal(15);
    });

    // Memastikan hanya SKKM yang diverifikasi yang bisa divalidasi
    it("harus gagal memvalidasi SKKM yang belum diverifikasi", async function () {
        try {
            const tx = await skkm.connect(hmj).validateSKKM(
                0,
                "Validated Category 1",
                "Validated Type 1",
                "Validated Achievement 1",
                "Validated Assessment 1",
                15
            );
            const receipt = await tx.wait();
            console.log(`Validate SKKM transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
        } catch (error) {
            expect(error.message).to.include("Request not verified by HMJ");
        }
    });
});
