const { ethers } = require("hardhat");

describe("Menghapus Pengguna dari Kontrak SKKM", function () {
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
        await skkm.connect(owner).addUser(admin.address, 3, "Admin", "789", "Dept");
        await skkm.connect(owner).addUser(bem.address, 4, "BEM", "101", "Dept");
    });

    // Menguji penghapusan pengguna
    it("harus menghapus pengguna yang ada", async function () {
        // Menghapus pengguna dengan peran Student
        let tx = await skkm.connect(owner).deleteUser(student.address);
        let receipt = await tx.wait();
        console.log(`Delete transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        // Memastikan pengguna telah dihapus dari mapping dan array
        const studentUser = await skkm.users(student.address);
        expect(studentUser.exists).to.be.false;

        // Memeriksa bahwa pengguna telah dihapus dari allUsers array
        const allUsers = await skkm.getAllUsers();
        const userExistsInArray = allUsers.some(user => user.userAddress === student.address);
        expect(userExistsInArray).to.be.false;
    });

    // Menguji error jika pengguna tidak ada
    it("harus gagal jika pengguna tidak ada", async function () {
        try {
            const tx = await skkm.connect(owner).deleteUser("0x0000000000000000000000000000000000000001");
            const receipt = await tx.wait();
            console.log(`Delete transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
        } catch (error) {
            expect(error.message).to.include("User does not exist");
        }
    });
});
