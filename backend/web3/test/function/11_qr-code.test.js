const { ethers } = require("hardhat");

describe("QR Code di Kontrak SKKM", function () {
    let SKKM, skkm, owner, student, hmj, bem;
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
        [owner, student, hmj, bem] = await ethers.getSigners();
        skkm = await SKKM.deploy();
        await skkm.deployed();

        // Menambahkan pengguna dengan peran mahasiswa, HMJ, dan BEM
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "456", "Dept");
        await skkm.connect(owner).addUser(bem.address, 4, "BEM", "789", "Dept");

        // Menambahkan SKKM oleh mahasiswa dan memvalidasi poin minimal
        await skkm.connect(owner).setMinimalPoin(10);
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
        await skkm.connect(hmj).verifySKKM(0, true, "");
        await skkm.connect(hmj).validateSKKM(
            0,
            "Validated Category 1",
            "Validated Type 1",
            "Validated Achievement 1",
            "Validated Assessment 1",
            10
        );
    });

    // Menghasilkan QR Code oleh mahasiswa
    it("harus menghasilkan QR Code oleh mahasiswa", async function () {
        const tx = await skkm.connect(student).generateQRCode("QRCodeData");
        const receipt = await tx.wait();
        console.log(`Generate QR Code transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const qrCode = await skkm.getQRCodeByStudent(student.address);
        expect(qrCode.qrCodeData).to.equal("QRCodeData");
        console.log(`QR Code status: ${qrCode.status}`);
        expect(qrCode.status).to.equal(5); // Status.Generated
    });

    // Mengirim QR Code ke BEM
    it("harus mengirim QR Code ke BEM", async function () {
        await skkm.connect(student).generateQRCode("QRCodeData");

        const tx = await skkm.connect(student).submitQRCode("QRCodeData");
        const receipt = await tx.wait();
        console.log(`Submit QR Code transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const qrCode = await skkm.getQRCodeByStudent(student.address);
        console.log(`QR Code status: ${qrCode.status}`);
        expect(qrCode.status).to.equal(6); // Status.SendToBEM
    });

    // Validasi QR Code oleh BEM
    it("harus memvalidasi QR Code oleh BEM", async function () {
        await skkm.connect(student).generateQRCode("QRCodeData");
        await skkm.connect(student).submitQRCode("QRCodeData");

        const tx = await skkm.connect(bem).validateQRCodeByBEM(0);
        const receipt = await tx.wait();
        console.log(`Validate QR Code transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const qrCode = await skkm.getQRCodeByStudent(student.address);
        console.log(`QR Code status: ${qrCode.status}`);
        expect(qrCode.status).to.equal(7); // Status.ValidatedByBEM
    });

    // Menguji batasan minimal poin sebelum menghasilkan QR Code
    it("harus gagal menghasilkan QR Code jika poin kurang dari minimal", async function () {
        await skkm.connect(owner).setMinimalPoin(20); // Set minimal poin lebih tinggi dari total poin yang dimiliki mahasiswa

        try {
            const tx = await skkm.connect(student).generateQRCode("QRCodeData");
            const receipt = await tx.wait();
            console.log(`Generate QR Code transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
        } catch (error) {
            expect(error.message).to.include("Minimal poin not reached");
        }
    });
});
