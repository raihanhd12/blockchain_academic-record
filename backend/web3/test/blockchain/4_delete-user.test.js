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

    // Fungsi untuk mengkonversi waktu ke format detik dan milidetik
    function formatTime(hrtime) {
        const seconds = hrtime[0];
        const milliseconds = hrtime[1] / 1000000;
        return `${seconds < 10 ? '0' : ''}${seconds}.${milliseconds < 100 ? '0' : ''}${milliseconds.toFixed(2).replace('.', ',')}`;
    }

    // Inisialisasi kontrak sebelum setiap pengujian
    beforeEach(async function () {
        SKKM = await ethers.getContractFactory("SKKM");

        // Menginisialisasi dompet dengan private key
        owner = new ethers.Wallet(process.env.PRIVATE_KEY_SUPERADMIN, ethers.provider);
        student = new ethers.Wallet(process.env.PRIVATE_KEY_STUDENT_TI, ethers.provider);
        student_an = new ethers.Wallet(process.env.PRIVATE_KEY_STUDENT_AN, ethers.provider);
        hmj = new ethers.Wallet(process.env.PRIVATE_KEY_HMJ_TI, ethers.provider);
        admin = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN_TI, ethers.provider);
        bem = new ethers.Wallet(process.env.PRIVATE_KEY_BEM_TI, ethers.provider);

        // Deploy kontrak
        skkm = await SKKM.connect(owner).deploy();
        await skkm.deployed();

        // Menambahkan pengguna
        await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await skkm.connect(owner).addUser(student_an.address, 1, "Student AN", "1231", "Dept");
        await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "456", "Dept");
        await skkm.connect(owner).addUser(admin.address, 3, "Admin", "789", "Dept");
        await skkm.connect(owner).addUser(bem.address, 4, "BEM", "101", "Dept");
    });

    // Menguji penghapusan pengguna
    it("harus menghapus pengguna yang ada", async function () {
        let tx, receipt;
        let startTime, endTime;

        // Menghapus pengguna dengan peran Student
        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).deleteUser(student.address);
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Delete Student TI with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        // Memastikan pengguna telah dihapus dari mapping
        const studentUser = await skkm.users(student.address);
        expect(studentUser.exists).to.be.false;

        // Memeriksa bahwa pengguna telah dihapus dari allUsers array
        let allUsersAfterDelete = await skkm.getAllUsers();
        let userExistsInArray = allUsersAfterDelete.some(user => user.userAddress === student.address);
        expect(userExistsInArray).to.be.false;

        // Menghapus pengguna dengan peran Student
        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).deleteUser(student_an.address);
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Delete Student AN with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        // Memastikan pengguna telah dihapus dari mapping
        const studentUserAN = await skkm.users(student_an.address);
        expect(studentUserAN.exists).to.be.false;

        // Memeriksa bahwa pengguna telah dihapus dari allUsers array
        let allUsersAfterDeleteAN = await skkm.getAllUsers();
        let userExistsInArrayAN = allUsersAfterDeleteAN.some(user => user.userAddress === student_an.address);
        expect(userExistsInArrayAN).to.be.false;

        // Menghapus pengguna dengan peran HMJ
        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).deleteUser(hmj.address);
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Delete HMJ TI with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        const hmjUser = await skkm.users(hmj.address);
        expect(hmjUser.exists).to.be.false;

        allUsersAfterDelete = await skkm.getAllUsers();
        userExistsInArray = allUsersAfterDelete.some(user => user.userAddress === hmj.address);
        expect(userExistsInArray).to.be.false;

        // Menghapus pengguna dengan peran Admin
        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).deleteUser(admin.address);
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Delete Admin TI with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        const adminUser = await skkm.users(admin.address);
        expect(adminUser.exists).to.be.false;

        allUsersAfterDelete = await skkm.getAllUsers();
        userExistsInArray = allUsersAfterDelete.some(user => user.userAddress === admin.address);
        expect(userExistsInArray).to.be.false;

        // Menghapus pengguna dengan peran BEM
        startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
        tx = await skkm.connect(owner).deleteUser(bem.address);
        receipt = await tx.wait();
        endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
        console.log(`Delete BEM TI with transaction hash: ${receipt.transactionHash}`);
        console.log(`Block number: ${receipt.blockNumber}`);
        console.log(`Waktu transaksi: ${formatTime(endTime)} detik`);

        const bemUser = await skkm.users(bem.address);
        expect(bemUser.exists).to.be.false;

        allUsersAfterDelete = await skkm.getAllUsers();
        userExistsInArray = allUsersAfterDelete.some(user => user.userAddress === bem.address);
        expect(userExistsInArray).to.be.false;
    });
});
