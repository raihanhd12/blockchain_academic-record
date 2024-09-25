const { ethers } = require("hardhat");

describe("Mengatur Minimal Poin di Kontrak SKKM", function () {
    let SKKM, skkm, owner, admin;
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
        admin = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN_TI, ethers.provider);

        console.log("Deploying contract...");
        skkm = await SKKM.connect(owner).deploy();
        await skkm.deployed();
        console.log(`Contract deployed at: ${skkm.address}`);

        // Menambahkan pengguna dengan peran admin
        console.log("Adding admin user...");
        let tx = await skkm.connect(owner).addUser(admin.address, 3, "Admin", "456", "Dept");
        await tx.wait();
        let adminUser = await skkm.users(admin.address);
        console.log(`Admin user added: ${JSON.stringify(adminUser)}`);
        expect(adminUser.exists).to.be.true;
        expect(adminUser.userAddress).to.equal(admin.address);
    });

    // Mengatur minimal poin sebanyak 5 kali
    it("harus mengatur minimal poin oleh admin sebanyak 5 kali", async function () {
        this.timeout(120000); // Mengatur timeout menjadi 120 detik

        let tx, receipt;
        let startTime, endTime, formattedTime;

        for (let i = 1; i <= 5; i++) {
            try {
                // Mengatur minimal poin oleh admin
                console.log(`Setting minimal poin by admin, iteration ${i}...`);
                startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
                tx = await skkm.connect(admin).setMinimalPoin(i * 10);
                receipt = await tx.wait();
                endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
                formattedTime = formatTime(endTime); // Menghitung dan memformat waktu transaksi
                console.log(`Set minimal poin transaction hash: ${receipt.transactionHash}`);
                console.log(`Block number: ${receipt.blockNumber}`);
                console.log(`Waktu transaksi set minimal poin: ${formattedTime} detik`);

                // Verifikasi minimal poin setelah pengaturan
                let minimalPoin = await skkm.minimalPoin();
                expect(minimalPoin).to.equal(i * 10);
            } catch (error) {
                console.error(`Failed to set minimal poin on iteration ${i}:`, error);
                throw new Error(`Failed to set minimal poin on iteration ${i}`);
            }
        }
    });
});
