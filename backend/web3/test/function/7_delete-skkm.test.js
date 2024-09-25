const { ethers } = require("hardhat");

describe("Menghapus SKKM di Kontrak SKKM", function () {
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
    });

    // Menghapus SKKM oleh mahasiswa yang membuatnya
    it("harus menghapus SKKM oleh mahasiswa yang membuatnya", async function () {
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

        // Ambil jumlah permintaan SKKM sebelum penghapusan
        const initialRequests = await skkm.getAllSKKM();
        const initialRequestsCount = initialRequests.length;

        const tx = await skkm.connect(student).deleteSKKM(0);
        const receipt = await tx.wait();
        console.log(`Delete SKKM transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        // Ambil jumlah permintaan SKKM setelah penghapusan
        const finalRequests = await skkm.getAllSKKM();
        const finalRequestsCount = finalRequests.length;

        expect(finalRequestsCount).to.equal(initialRequestsCount - 1);

        const deletedRequest = finalRequests.find(req => req.skkmId === 0);
        expect(deletedRequest).to.be.undefined;
    });

    // Memastikan SKKM yang sudah diverifikasi tidak bisa dihapus
    it("harus gagal menghapus SKKM yang sudah diverifikasi", async function () {
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

        // Simulasikan perubahan status SKKM ke Verified oleh HMJ
        await skkm.connect(hmj).verifySKKM(0, true, "");

        try {
            const tx = await skkm.connect(student).deleteSKKM(0);
            const receipt = await tx.wait();
            console.log(`Delete SKKM transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
        } catch (error) {
            expect(error.message).to.include("Cannot delete request after verification");
        }
    });
});
