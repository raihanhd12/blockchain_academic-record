const { ethers } = require("hardhat");

describe("Pengaturan Minimal Poin di Kontrak SKKM", function () {
    let SKKM, skkm, owner, admin, student;
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
        [owner, admin, student] = await ethers.getSigners();
        skkm = await SKKM.deploy();
        await skkm.deployed();

        // Menambahkan pengguna dengan peran admin dan mahasiswa
        await skkm.connect(owner).addUser(admin.address, 3, "Admin", "admin123", "Admin Dept");
        await skkm.connect(owner).addUser(student.address, 1, "Student", "student123", "Student Dept");
    });

    // Menguji pengaturan minimal poin oleh admin
    it("harus memperbarui minimal poin oleh admin", async function () {
        const newMinimalPoin = 20;

        // Admin memperbarui minimal poin
        const tx = await skkm.connect(admin).setMinimalPoin(newMinimalPoin);
        const receipt = await tx.wait();
        console.log(`Set Minimal Poin transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        // Memastikan perubahan minimal poin diterapkan dengan benar
        const minimalPoin = await skkm.minimalPoin();
        expect(minimalPoin).to.equal(newMinimalPoin);
    });

    // Menguji bahwa non-admin tidak bisa memperbarui minimal poin
    it("harus gagal jika non-admin mencoba memperbarui minimal poin", async function () {
        const newMinimalPoin = 30;

        await expect(
            skkm.connect(student).setMinimalPoin(newMinimalPoin)
        ).to.be.revertedWith("Only admin can perform this action");
    });
});
