const { ethers } = require("hardhat");

describe("Adding Student Activity Credit in the Activity Credit Contract", function () {
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
    });

    // Menambahkan lima SKKM baru oleh mahasiswa
    it("must add five new Activity Credit by students", async function () {
        let tx, receipt;
        let startTime, endTime, formattedTime;

        // Fungsi untuk submit SKKM
        async function submitSKKM(activityNameID, activityNameEN, certificateNumber, activityCategory, activityType, achievement, assessmentBasis, ipfsHash, creditPoin) {
            startTime = process.hrtime(); // Mencatat waktu sebelum transaksi
            tx = await skkm.connect(student).submitSKKM(
                activityNameID,
                activityNameEN,
                certificateNumber,
                activityCategory,
                activityType,
                achievement,
                assessmentBasis,
                ipfsHash,
                creditPoin
            );
            receipt = await tx.wait();
            endTime = process.hrtime(startTime); // Mencatat waktu setelah transaksi
            formattedTime = formatTime(endTime); // Menghitung dan memformat waktu transaksi
            console.log(`Submit ${activityNameID} transaction hash: ${receipt.transactionHash}`);
            console.log(`Block number: ${receipt.blockNumber}`);
            console.log(`Transaction Time ${activityNameID}: ${formattedTime} seconds`);
        }

        try {
            console.log("Submitting Activity Credit 1...");
            await submitSKKM("Activity 1", "Activity 1 EN", "CERT123", "Category 1", "Type 1", "Achievement 1", "Assessment 1", "ipfsHash1", 10);
            console.log("Submitting Activity Credit 2...");
            await submitSKKM("Activity 2", "Activity 2 EN", "CERT456", "Category 2", "Type 2", "Achievement 2", "Assessment 2", "ipfsHash2", 20);
            console.log("Submitting Activity Credit 3...");
            await submitSKKM("Activity 3", "Activity 3 EN", "CERT789", "Category 3", "Type 3", "Achievement 3", "Assessment 3", "ipfsHash3", 30);
            console.log("Submitting Activity Credit 4...");
            await submitSKKM("Activity 4", "Activity 4 EN", "CERT101", "Category 4", "Type 4", "Achievement 4", "Assessment 4", "ipfsHash4", 40);
            console.log("Submitting Activity Credit 5...");
            await submitSKKM("Activity 5", "Activity 5 EN", "CERT102", "Category 5", "Type 5", "Achievement 5", "Assessment 5", "ipfsHash5", 50);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            expect.fail("Submit Activity Credit failed");
        }

        const skkmRequest1 = await skkm.requests(0);
        expect(skkmRequest1.student).to.equal(student.address);
        expect(skkmRequest1.activityNameID).to.equal("Activity 1");
        expect(skkmRequest1.creditPoin).to.equal(10);

        const skkmRequest2 = await skkm.requests(1);
        expect(skkmRequest2.student).to.equal(student.address);
        expect(skkmRequest2.activityNameID).to.equal("Activity 2");
        expect(skkmRequest2.creditPoin).to.equal(20);

        const skkmRequest3 = await skkm.requests(2);
        expect(skkmRequest3.student).to.equal(student.address);
        expect(skkmRequest3.activityNameID).to.equal("Activity 3");
        expect(skkmRequest3.creditPoin).to.equal(30);

        const skkmRequest4 = await skkm.requests(3);
        expect(skkmRequest4.student).to.equal(student.address);
        expect(skkmRequest4.activityNameID).to.equal("Activity 4");
        expect(skkmRequest4.creditPoin).to.equal(40);

        const skkmRequest5 = await skkm.requests(4);
        expect(skkmRequest5.student).to.equal(student.address);
        expect(skkmRequest5.activityNameID).to.equal("Activity 5");
        expect(skkmRequest5.creditPoin).to.equal(50);
    });
});
