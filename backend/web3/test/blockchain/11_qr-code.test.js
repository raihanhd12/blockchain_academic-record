const { ethers } = require("hardhat");

describe("Mengatur QR Code di Kontrak SKKM", function () {
    let SKKM, skkm, owner, student, bem, hmj;
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
        this.timeout(120000); // Mengatur timeout menjadi 120 detik

        SKKM = await ethers.getContractFactory("SKKM");

        owner = new ethers.Wallet(process.env.PRIVATE_KEY_SUPERADMIN, ethers.provider);
        student = new ethers.Wallet(process.env.PRIVATE_KEY_STUDENT_TI, ethers.provider);
        bem = new ethers.Wallet(process.env.PRIVATE_KEY_BEM_TI, ethers.provider);
        hmj = new ethers.Wallet(process.env.PRIVATE_KEY_HMJ_TI, ethers.provider);

        console.log("Deploying contract...");
        skkm = await SKKM.connect(owner).deploy();
        await skkm.deployed();
        console.log(`Contract deployed at: ${skkm.address}`);

        // Menambahkan pengguna dengan peran mahasiswa, HMJ, dan BEM
        console.log("Adding student, HMJ, and BEM users...");
        let tx = await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await tx.wait();
        let studentUser = await skkm.users(student.address);
        console.log(`Student user added: ${JSON.stringify(studentUser)}`);
        expect(studentUser.exists).to.be.true;
        expect(studentUser.userAddress).to.equal(student.address);

        tx = await skkm.connect(owner).addUser(hmj.address, 2, "HMJ", "456", "Dept");
        await tx.wait();
        let hmjUser = await skkm.users(hmj.address);
        console.log(`HMJ user added: ${JSON.stringify(hmjUser)}`);
        expect(hmjUser.exists).to.be.true;
        expect(hmjUser.userAddress).to.equal(hmj.address);

        tx = await skkm.connect(owner).addUser(bem.address, 4, "BEM", "789", "Dept");
        await tx.wait();
        let bemUser = await skkm.users(bem.address);
        console.log(`BEM user added: ${JSON.stringify(bemUser)}`);
        expect(bemUser.exists).to.be.true;
        expect(bemUser.userAddress).to.equal(bem.address);

        // Menambahkan satu SKKM untuk diuji
        console.log(`Submitting initial SKKM...`);
        tx = await skkm.connect(student).submitSKKM(
            `Initial Activity`,
            `Initial Activity EN`,
            `CERT_INIT`,
            `Initial Category`,
            `Initial Type`,
            `Initial Achievement`,
            `Initial Assessment`,
            `ipfsHashInit`,
            4
        );
        await tx.wait();
        console.log(`Initial SKKM submitted.`);

        console.log(`Verifying SKKM...`);
        tx = await skkm.connect(hmj).verifySKKM(0, true, "");
        await tx.wait();
        console.log(`SKKM verified.`);

        console.log(`Validating SKKM...`);
        tx = await skkm.connect(hmj).validateSKKM(
            0,
            `Validated Category`,
            `Validated Type`,
            `Validated Achievement`,
            `Validated Assessment`,
            4
        );
        await tx.wait();
        console.log(`SKKM validated.`);

        console.log("Setting minimal poin...");
        tx = await skkm.connect(owner).setMinimalPoin(4);
        await tx.wait();
        console.log("Minimal poin set.");
    });

    // Mengatur lima QR Code untuk mahasiswa
    it("harus mengatur lima QR Code untuk mahasiswa", async function () {
        this.timeout(120000); // Mengatur timeout menjadi 120 detik

        let tx, receipt;
        let startTime, endTime, formattedTime;

        for (let i = 1; i <= 5; i++) {
            try {
                // Mengatur QR Code
                console.log(`Setting QR Code ${i}...`);
                startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
                tx = await skkm.connect(student).generateQRCode(`QRCodeData${i}`);
                receipt = await tx.wait();
                endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
                formattedTime = formatTime(endTime); // Menghitung dan memformat waktu transaksi
                console.log(`Set QR Code ${i} transaction hash: ${receipt.transactionHash}`);
                console.log(`Block number: ${receipt.blockNumber}`);
                console.log(`Waktu transaksi QR Code ${i}: ${formattedTime} detik`);

                // Verifikasi bahwa QR Code telah diatur
                const qrCode = await skkm.qrcodes(i - 1);
                expect(qrCode.qrCodeData).to.equal(`QRCodeData${i}`);
                expect(qrCode.status).to.equal(5); // Status.Generated
            } catch (error) {
                console.error(`Failed to set QR Code ${i}:`, error);
                throw new Error(`Failed to set QR Code ${i}`);
            }
        }
    });
});
