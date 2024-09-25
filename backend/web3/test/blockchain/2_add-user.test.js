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
    });

    // Menguji penambahan pengguna dengan peran yang berbeda
    it("harus menambahkan pengguna dengan peran Student, HMJ, Admin, dan BEM", async function () {
        let tx, receipt;
        let startTime, endTime;

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Student added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).addUser(student_an.address, 1, "Student1", "1231", "Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Student added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "456", "Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`HMJ added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).addUser(admin.address, 3, "Admin", "789", "Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Admin added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).addUser(bem.address, 4, "BEM", "101", "Dept");
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`BEM added with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        const studentUser = await skkm.users(student.address);
        expect(studentUser.exists).to.be.true;
        expect(studentUser.role).to.equal(1); // Role.Student

        const studentUser1 = await skkm.users(student_an.address);
        expect(studentUser1.exists).to.be.true;
        expect(studentUser1.role).to.equal(1); // Role.Student

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
});
