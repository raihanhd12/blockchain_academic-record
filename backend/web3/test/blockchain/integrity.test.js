const { ethers } = require("hardhat");

describe("Kontrak SKKM - Test Integritas Data di Blockchain", function () {
    let SKKM, skkm, owner, student;
    let expect;

    // Mengimpor chai untuk assertion
    before(async function () {
        const chai = await import("chai");
        expect = chai.expect;
    });

    // Menjalankan sebelum setiap pengujian
    beforeEach(async function () {
        // Menginisialisasi kontrak SKKM dan mendapatkan signers
        SKKM = await ethers.getContractFactory("SKKM");
        [owner, student] = await ethers.getSigners();
        skkm = await SKKM.deploy();
        await skkm.deployed();

        // Menambahkan pengguna dengan peran mahasiswa
        const addUserTx = await skkm.connect(owner).addUser(
            student.address,
            1, // Role.Student
            "Raihan",
            "12345",
            "Teknik Informatika"
        );
        const addUserReceipt = await addUserTx.wait();
        console.log(`Mahasiswa berhasil ditambahkan`);
        console.log(`Hash transaksi: ${addUserReceipt.transactionHash}`);

        // Mengambil hash blok dari transaksi addUser
        const addUserBlock = await ethers.provider.getBlock(addUserReceipt.blockNumber);
        console.log(`Hash blok: ${addUserBlock.hash}`);
    });

    it("harus submit data dan verifikasi konsistensi hash di blockchain", async function () {
        console.log("Menjalankan pengujian: Submit data dan verifikasi konsistensi hash di blockchain");

        // Submit data SKKM oleh mahasiswa
        const tx = await skkm.connect(student).submitSKKM(
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
        const receipt = await tx.wait();
        const transactionHash = receipt.transactionHash;
        console.log("Data berhasil disubmit");
        console.log(`Hash transaksi: ${transactionHash}`);

        // Mengambil data request dari blockchain
        const request = await skkm.requests(0);
        const originalDataHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(
            ["string", "string", "string", "string", "string", "string", "string", "string", "uint256"],
            [request.activityNameID, request.activityNameEN, request.certificateNumber, request.activityCategory, request.activityType, request.achievement, request.assessmentBasis, request.ipfsHash, request.creditPoin]
        ));
        console.log(`Hash data asli: ${originalDataHash}`);

        // Mengambil hash blok dari transaksi submitSKKM
        const blockNumber = receipt.blockNumber;
        const block = await ethers.provider.getBlock(blockNumber);
        const blockHash = block.hash;
        console.log(`Hash blok: ${blockHash}`);

        // Mencoba memanipulasi data
        try {
            const manipulateTx = await skkm.connect(owner).editSKKM(
                0,
                "Activity 1 Manipulated",
                "Activity 1 EN",
                "CERT123",
                "Category 1",
                "Type 1",
                "Achievement 1",
                "Assessment 1",
                "ipfsHash2",
                10
            );
            await manipulateTx.wait();
            expect.fail("Super admin tidak berhasil memanipulasi data.");
        } catch (err) {
            const manipulateTxHash = err.transactionHash;
            console.log("Super admin gagal memanipulasi data: Only students can perform this action");
            console.log(`Hash transaksi manipulasi: ${manipulateTxHash}`);
        }

        // Mengambil data request setelah upaya manipulasi
        const requestAfter = await skkm.requests(0);
        const newDataHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(
            ["string", "string", "string", "string", "string", "string", "string", "string", "uint256"],
            [requestAfter.activityNameID, requestAfter.activityNameEN, requestAfter.certificateNumber, requestAfter.activityCategory, requestAfter.activityType, requestAfter.achievement, requestAfter.assessmentBasis, requestAfter.ipfsHash, requestAfter.creditPoin]
        ));
        console.log(`Hash data baru: ${newDataHash}`);

        // Verifikasi bahwa hash data tetap konsisten setelah upaya manipulasi
        expect(originalDataHash).to.equal(newDataHash);
        console.log("Hash data tetap konsisten setelah upaya manipulasi.");
    });
});
