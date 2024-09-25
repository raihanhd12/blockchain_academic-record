const { ethers } = require("hardhat");

describe("Menambah SKKM di Kontrak SKKM", function () {
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
    });

    // Menambahkan SKKM baru oleh mahasiswa
    it("harus menambahkan SKKM baru oleh mahasiswa", async function () {
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
        console.log(`Submit SKKM transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const skkmRequest = await skkm.requests(0);
        expect(skkmRequest.student).to.equal(student.address);
        expect(skkmRequest.activityNameID).to.equal("Activity 1");
        expect(skkmRequest.creditPoin).to.equal(10);
    });

    // Kasus gagal ketika pengguna bukan mahasiswa mencoba menambahkan SKKM
    it("harus gagal ketika pengguna bukan mahasiswa mencoba menambahkan SKKM", async function () {
        try {
            await skkm.connect(hmj).submitSKKM(
                "Activity 2",
                "Activity 2 EN",
                "CERT456",
                "Category 2",
                "Type 2",
                "Achievement 2",
                "Assessment 2",
                "ipfsHash2",
                20
            );
            expect.fail("Pengguna bukan mahasiswa berhasil menambahkan SKKM");
        } catch (error) {
            expect(error.message).to.include("Only students can perform this action");
        }
    });

    // Kasus gagal ketika SKKM dengan nomor sertifikat yang sama sudah ada
    it("harus gagal ketika SKKM dengan nomor sertifikat yang sama sudah ada", async function () {
        await skkm.connect(student).submitSKKM(
            "Activity 3",
            "Activity 3 EN",
            "CERT789",
            "Category 3",
            "Type 3",
            "Achievement 3",
            "Assessment 3",
            "ipfsHash3",
            30
        );

        try {
            await skkm.connect(student).submitSKKM(
                "Activity 4",
                "Activity 4 EN",
                "CERT789",
                "Category 4",
                "Type 4",
                "Achievement 4",
                "Assessment 4",
                "ipfsHash4",
                40
            );
            expect.fail("SKKM dengan nomor sertifikat yang sama berhasil ditambahkan");
        } catch (error) {
            expect(error.message).to.include("Certificate number already exists");
        }
    });
});
