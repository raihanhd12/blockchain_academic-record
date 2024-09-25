const { ethers } = require("hardhat");

describe("Menambahkan Pengguna ke Kontrak SKKM", function () {
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
    });

    // Menguji penambahan pengguna dengan peran yang berbeda
    it("harus menambahkan pengguna dengan peran Student, HMJ, Admin, dan BEM", async function () {
        let tx, receipt;

        tx = await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        receipt = await tx.wait();
        console.log(`Student added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        tx = await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "456", "Dept");
        receipt = await tx.wait();
        console.log(`HMJ added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        tx = await skkm.connect(owner).addUser(admin.address, 3, "Admin", "789", "Dept");
        receipt = await tx.wait();
        console.log(`Admin added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        tx = await skkm.connect(owner).addUser(bem.address, 4, "BEM", "101", "Dept");
        receipt = await tx.wait();
        console.log(`BEM added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);

        const studentUser = await skkm.users(student.address);
        expect(studentUser.exists).to.be.true;
        expect(studentUser.role).to.equal(1); // Role.Student

        const hmjUser = await skkm.users(hmj.address);
        expect(hmjUser.exists).to.be.true;
        expect(hmjUser.role).to.equal(2); // Role.HMJ

        const adminUser = await skkm.users(admin.address);
        expect(adminUser.exists).to.be.true;
        expect(adminUser.role).to.equal(3); // Role.Admin

        const bemUser = await skkm.users(bem.address);
        expect(bemUser.exists).to.be.true;
        expect(bemUser.role).to.equal(4); // Role.BEM
    });

    // Menguji error jika pengguna sudah ada
    it("harus gagal jika pengguna sudah ada", async function () {
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        try {
            const tx = await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
            const receipt = await tx.wait();
            console.log(`Transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
        } catch (error) {
            expect(error.message).to.include("User already exists");
        }
    });

    // Menguji error jika identifier sudah digunakan
    it("harus gagal jika identifier sudah digunakan", async function () {
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        try {
            const tx = await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "123", "Dept");
            const receipt = await tx.wait();
            console.log(`Transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
        } catch (error) {
            expect(error.message).to.include("Identifier already exists");
        }
    });
});
