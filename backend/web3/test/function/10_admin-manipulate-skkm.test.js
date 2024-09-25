const { ethers } = require("hardhat");

describe("Manipulasi SKKM oleh Admin di Kontrak SKKM", function () {
    let SKKM, skkm, owner, student, admin;
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
        [owner, student, admin] = await ethers.getSigners();
        skkm = await SKKM.deploy();
        await skkm.deployed();

        // Menambahkan pengguna dengan peran mahasiswa dan admin
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await skkm.connect(owner).addUser(admin.address, 3, "Admin", "789", "Dept");

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

    // Memastikan admin tidak bisa mengedit SKKM yang dibuat oleh mahasiswa
    it("harus gagal jika admin mencoba mengedit SKKM yang dibuat oleh mahasiswa", async function () {
        try {
            const tx = await skkm.connect(admin).editSKKM(
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
        } catch (error) {
            expect(error.message).to.include("Only students can perform this action");
        }
    });

    // Memastikan admin tidak bisa menghapus SKKM yang dibuat oleh mahasiswa
    it("harus gagal jika admin mencoba menghapus SKKM yang dibuat oleh mahasiswa", async function () {
        try {
            const tx = await skkm.connect(admin).deleteSKKM(0);
            const receipt = await tx.wait();
            console.log(`Delete SKKM transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
        } catch (error) {
            expect(error.message).to.include("Only students can perform this action");
        }
    });
});
