const { ethers } = require("hardhat");

describe("Memperbarui Pengguna di Kontrak SKKM", function () {
    let SKKM, skkm, owner, student, hmj, admin, bem;
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
        [owner, student, hmj, admin, bem] = await ethers.getSigners();
        skkm = await SKKM.deploy();
        await skkm.deployed();

        // Menambahkan pengguna
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "456", "Dept");
    });

    // Menguji pembaruan informasi pengguna
    it("harus memperbarui informasi pengguna yang sudah ada", async function () {
        const tx = await skkm.connect(owner).updateUser(student.address, 1, "Updated Student", "123", "Updated Dept");
        const receipt = await tx.wait();
        console.log(`Update transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const updatedUser = await skkm.users(student.address);
        expect(updatedUser.name).to.equal("Updated Student");
        expect(updatedUser.department).to.equal("Updated Dept");
    });

    // Menguji validasi pembaruan identifier untuk memastikan tidak ada duplikasi
    it("harus gagal jika identifier sudah digunakan", async function () {
        try {
            const tx = await skkm.connect(owner).updateUser(student.address, 1, "Updated Student", "456", "Updated Dept");
            const receipt = await tx.wait();
            console.log(`Update transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
        } catch (error) {
            expect(error.message).to.include("Identifier already exists");
        }
    });
});
