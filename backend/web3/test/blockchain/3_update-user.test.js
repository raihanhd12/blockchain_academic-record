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

    // Fungsi untuk mengkonversi waktu ke format detik dan milidetik
    function formatTime(hrtime) {
        const seconds = hrtime[0];
        const milliseconds = hrtime[1] / 1000000;
        return `${seconds < 10 ? '0' : ''}${seconds}.${milliseconds < 100 ? '0' : ''}${milliseconds.toFixed(2).replace('.', ',')}`;
    }

    // Inisialisasi kontrak sebelum setiap pengujian
    beforeEach(async function () {
        SKKM = await ethers.getContractFactory("SKKM");
        owner = new ethers.Wallet(process.env.PRIVATE_KEY_SUPERADMIN, ethers.provider);
        student = new ethers.Wallet(process.env.PRIVATE_KEY_STUDENT_TI, ethers.provider);
        student_an = new ethers.Wallet(process.env.PRIVATE_KEY_STUDENT_AN, ethers.provider);
        hmj = new ethers.Wallet(process.env.PRIVATE_KEY_HMJ_TI, ethers.provider);
        admin = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN_TI, ethers.provider);
        bem = new ethers.Wallet(process.env.PRIVATE_KEY_BEM_TI, ethers.provider);

        skkm = await SKKM.connect(owner).deploy();
        await skkm.deployed();

        // Menambahkan pengguna
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await skkm.connect(owner).addUser(student_an.address, 1, "Student1", "1231", "Dept");
        await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "456", "Dept");
        await skkm.connect(owner).addUser(admin.address, 3, "Admin", "789", "Dept");
        await skkm.connect(owner).addUser(bem.address, 4, "BEM", "101", "Dept");
    });

    // Menguji pembaruan pengguna dengan peran yang berbeda
    it("harus memperbarui pengguna dengan peran Student, HMJ, Admin, dan BEM", async function () {
        let tx, receipt;
        let startTime, endTime;

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).updateUser(student.address, 1, "Student Updated", "123", "New Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Student updated with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).updateUser(student_an.address, 1, "Student Updated", "1231", "New Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Student AN updated with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).updateUser(hmj.address, 2, "HMJ Updated", "456", "New Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`HMJ updated with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).updateUser(admin.address, 3, "Admin Updated", "789", "New Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Admin updated with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).updateUser(bem.address, 4, "BEM Updated", "101", "New Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`BEM updated with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        const updatedStudentUser = await skkm.users(student.address);
        expect(updatedStudentUser.exists).to.be.true;
        expect(updatedStudentUser.name).to.equal("Student Updated");

        const updatedStudentUserAN = await skkm.users(student_an.address);
        expect(updatedStudentUserAN.exists).to.be.true;
        expect(updatedStudentUserAN.name).to.equal("Student Updated");

        const updatedHMJUser = await skkm.users(hmj.address);
        expect(updatedHMJUser.exists).to.be.true;
        expect(updatedHMJUser.name).to.equal("HMJ Updated");

        const updatedAdminUser = await skkm.users(admin.address);
        expect(updatedAdminUser.exists).to.be.true;
        expect(updatedAdminUser.name).to.equal("Admin Updated");

        const updatedBEMUser = await skkm.users(bem.address);
        expect(updatedBEMUser.exists).to.be.true;
        expect(updatedBEMUser.name).to.equal("BEM Updated");
    });
});
