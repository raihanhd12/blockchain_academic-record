const { ethers } = require("hardhat");

describe("Menghapus SKKM di Kontrak SKKM", function () {
    let SKKM, skkm, owner, student;
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

        console.log("Deploying contract...");
        skkm = await SKKM.connect(owner).deploy();
        await skkm.deployed();
        console.log(`Contract deployed at: ${skkm.address}`);

        // Menambahkan pengguna dengan peran mahasiswa
        console.log("Adding student user...");
        const addUserTx = await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await addUserTx.wait();
        const studentUser = await skkm.users(student.address);
        console.log(`Student user added: ${JSON.stringify(studentUser)}`);
        expect(studentUser.exists).to.be.true;
        expect(studentUser.userAddress).to.equal(student.address);

        // Menambahkan lima SKKM untuk diuji hapus
        for (let i = 1; i <= 5; i++) {
            console.log(`Submitting initial SKKM ${i}...`);
            const tx = await skkm.connect(student).submitSKKM(
                `Initial Activity ${i}`,
                `Initial Activity EN ${i}`,
                `CERT_INIT_${i}`,
                `Initial Category ${i}`,
                `Initial Type ${i}`,
                `Initial Achievement ${i}`,
                `Initial Assessment ${i}`,
                `ipfsHashInit${i}`,
                10 * i
            );
            await tx.wait();
            console.log(`Initial SKKM ${i} submitted.`);
        }
    });

    // Menghapus lima SKKM yang ada oleh mahasiswa
    it("harus menghapus lima SKKM yang ada oleh mahasiswa", async function () {
        let tx, receipt;
        let startTime, endTime, formattedTime;

        for (let i = 4; i >= 0; i--) {
            // Menghapus SKKM
            startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
            tx = await skkm.connect(student).deleteSKKM(i); // Menghapus SKKM dengan ID yang sesuai
            receipt = await tx.wait();
            endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
            formattedTime = formatTime(endTime); // Menghitung dan memformat waktu transaksi
            console.log(`Delete SKKM ${i + 1} transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
            console.log(`Waktu transaksi SKKM ${i + 1}: ${formattedTime} detik`);

            // Verifikasi bahwa SKKM telah dihapus
            const skkmExists = await skkm.requests(i).catch(() => null);
            expect(skkmExists).to.be.null;
        }
    });
});
