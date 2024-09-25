const { ethers } = require("hardhat");

describe("Pengambilan Data di Kontrak SKKM", function () {
    let SKKM, skkm, owner, student1, student2, hmj, bem;
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
        [owner, student1, student2, hmj, bem] = await ethers.getSigners();
        skkm = await SKKM.deploy();
        await skkm.deployed();

        // Menambahkan pengguna dengan peran mahasiswa, HMJ, dan BEM
        await skkm.connect(owner).addUser(student1.address, 1, "Student1", "123", "Dept");
        await skkm.connect(owner).addUser(student2.address, 1, "Student2", "456", "Dept");
        await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "789", "Dept");
        await skkm.connect(owner).addUser(bem.address, 4, "BEM", "101", "Dept");

        // Menambahkan SKKM oleh mahasiswa
        await skkm.connect(student1).submitSKKM(
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

        await skkm.connect(student2).submitSKKM(
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

        // Mahasiswa 1 menghasilkan QR Code
        await skkm.connect(owner).setMinimalPoin(10);
        await skkm.connect(hmj).verifySKKM(0, true, "");
        await skkm.connect(hmj).validateSKKM(
            0,
            "Validated Category 1",
            "Validated Type 1",
            "Validated Achievement 1",
            "Validated Assessment 1",
            10
        );
        await skkm.connect(student1).generateQRCode("QRCodeData1");
    });

    // Mengambil SKKM berdasarkan mahasiswa
    it("harus mengambil SKKM berdasarkan mahasiswa", async function () {
        const skkmListStudent1 = await skkm.getSKKMByStudent(student1.address);
        expect(skkmListStudent1.length).to.equal(1);
        expect(skkmListStudent1[0].activityNameID).to.equal("Activity 1");

        const skkmListStudent2 = await skkm.getSKKMByStudent(student2.address);
        expect(skkmListStudent2.length).to.equal(1);
        expect(skkmListStudent2[0].activityNameID).to.equal("Activity 2");
    });

    // Mengambil QR Code berdasarkan mahasiswa
    it("harus mengambil QR Code berdasarkan mahasiswa", async function () {
        const qrCode = await skkm.getQRCodeByStudent(student1.address);
        expect(qrCode.qrCodeData).to.equal("QRCodeData1");
    });

    // Mengambil semua SKKM
    it("harus mengambil semua SKKM", async function () {
        const allSKKM = await skkm.getAllSKKM();
        expect(allSKKM.length).to.equal(2);
    });

    // Mengambil semua pengguna
    it("harus mengambil semua pengguna", async function () {
        const allUsers = await skkm.getAllUsers();
        expect(allUsers.length).to.equal(4); // Owner, Student1, Student2, HMJ, BEM
    });

    // Mengambil semua QR Code
    it("harus mengambil semua QR Code", async function () {
        const allQRCodes = await skkm.getAllQRCodes();
        expect(allQRCodes.length).to.equal(1);
        expect(allQRCodes[0].qrCodeData).to.equal("QRCodeData1");
    });
});
