const { ethers } = require("hardhat");

describe("Mengedit SKKM di Kontrak SKKM", function () {
    let SKKM, skkm, owner, student, anotherStudent, hmj;
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
        [owner, student, anotherStudent, hmj] = await ethers.getSigners();
        skkm = await SKKM.deploy();
        await skkm.deployed();

        // Menambahkan pengguna dengan peran mahasiswa dan HMJ
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await skkm.connect(owner).addUser(anotherStudent.address, 1, "Another Student", "456", "Dept");
        await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "789", "Dept");

        // Menambahkan SKKM baru oleh mahasiswa untuk pengujian edit
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

    // Mengedit SKKM yang ada oleh mahasiswa
    it("harus mengedit SKKM yang ada oleh mahasiswa", async function () {
        const tx = await skkm.connect(student).editSKKM(
            0,
            "Updated Activity 1",
            "Updated Activity 1 EN",
            "CERT123",
            "Updated Category 1",
            "Updated Type 1",
            "Updated Achievement 1",
            "Updated Assessment 1",
            "ipfsHash2",
            15
        );
        const receipt = await tx.wait();
        console.log(`Edit SKKM transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const skkmRequest = await skkm.requests(0);
        expect(skkmRequest.activityNameID).to.equal("Updated Activity 1");
        expect(skkmRequest.creditPoin).to.equal(15);
    });

    // Memastikan hanya mahasiswa yang membuat SKKM yang dapat mengeditnya
    it("harus gagal jika mahasiswa lain mencoba mengedit SKKM", async function () {
        try {
            await skkm.connect(anotherStudent).editSKKM(
                0,
                "Updated Activity 1",
                "Updated Activity 1 EN",
                "CERT123",
                "Updated Category 1",
                "Updated Type 1",
                "Updated Achievement 1",
                "Updated Assessment 1",
                "ipfsHash2",
                15
            );
        } catch (error) {
            expect(error.message).to.include("Unauthorized");
        }
    });

    // Menguji pembatasan pengeditan berdasarkan status SKKM
    it("harus gagal jika status SKKM tidak memungkinkan pengeditan", async function () {
        // Simulasikan perubahan status SKKM ke Verified oleh HMJ
        await skkm.connect(hmj).verifySKKM(0, true, "");

        try {
            await skkm.connect(student).editSKKM(
                0,
                "Updated Activity 1",
                "Updated Activity 1 EN",
                "CERT123",
                "Updated Category 1",
                "Updated Type 1",
                "Updated Achievement 1",
                "Updated Assessment 1",
                "ipfsHash2",
                15
            );
        } catch (error) {
            expect(error.message).to.include("Cannot edit request after verification");
        }
    });
});
