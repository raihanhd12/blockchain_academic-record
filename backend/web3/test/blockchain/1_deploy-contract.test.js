const { ethers } = require("hardhat");

describe("Inisialisasi Kontrak SKKM", function () {
    let SKKM, owner;
    let expect;

    // Mengimpor chai untuk assertion
    before(async function () {
        const chai = await import("chai");
        expect = chai.expect;
    });

    // Fungsi untuk mengkonversi waktu ke format detik dan milidetik
    function formatTime(hrtime) {
        const seconds = hrtime[0];
        const milliseconds = hrtime[1] / 1000000;
        return `${seconds < 10 ? '0' : ''}${seconds}.${milliseconds < 100 ? '0' : ''}${milliseconds.toFixed(2).replace('.', ',')}`;
    }

    // Menguji apakah kontrak diinisialisasi dengan benar
    it("Smart Contract sudah berhasil di deploy dengan benar lima kali", async function () {
        SKKM = await ethers.getContractFactory("SKKM");
        [owner] = await ethers.getSigners();

        for (let i = 0; i < 5; i++) {
            const startTime = process.hrtime(); // Mencatat waktu sebelum transaksi deploy
            const skkm = await SKKM.deploy();
            await skkm.deployed();
            const endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi deploy

            const formattedTime = formatTime(endTime); // Menghitung dan memformat waktu transaksi
            console.log(`Deploy ${i + 1} - Waktu transaksi deploy: ${formattedTime} detik`);

            // Memastikan alamat superAdmin adalah alamat penginisialisasi
            const superAdmin = await skkm.superAdmin();
            expect(superAdmin).to.equal(owner.address);

            // Mendapatkan receipt dari transaksi deploy
            const deployTransaction = skkm.deployTransaction;
            const receipt = await deployTransaction.wait();

            // Mendapatkan hash transaksi
            const transactionHash = receipt.transactionHash;
            console.log(`Deploy ${i + 1} - Hash transaksi: ${transactionHash}`);

            // Mendapatkan nomor blok dari transaksi deploy
            const blockNumber = receipt.blockNumber;
            console.log(`Deploy ${i + 1} - Nomor blok: ${blockNumber}`);
        }
    });
});
