const { ethers } = require("hardhat");

describe("Sending QR Code to the Student Executive Board in the Activity Credit Contract", function () {
    let SKKM, skkm, owner, student, studentExecutiveBoard, departmentalStudentAssociation;
    let expect;

    // Importing chai and ethereum-waffle for assertions
    before(async function () {
        const chai = await import("chai");
        const { solidity } = await import("ethereum-waffle");
        chai.use(solidity);
        expect = chai.expect;
    });

    // Function to convert time to seconds and milliseconds format
    function formatTime(hrtime) {
        const seconds = hrtime[0];
        const milliseconds = hrtime[1] / 1000000;
        return `${seconds < 10 ? '0' : ''}${seconds}.${milliseconds < 100 ? '0' : ''}${milliseconds.toFixed(2).replace('.', ',')}`;
    }

    // Initialize the contract before each test
    beforeEach(async function () {
        this.timeout(120000); // Set timeout to 120 seconds

        SKKM = await ethers.getContractFactory("SKKM");

        owner = new ethers.Wallet(process.env.PRIVATE_KEY_SUPERADMIN, ethers.provider);
        student = new ethers.Wallet(process.env.PRIVATE_KEY_STUDENT_TI, ethers.provider);
        studentExecutiveBoard = new ethers.Wallet(process.env.PRIVATE_KEY_BEM_TI, ethers.provider);
        departmentalStudentAssociation = new ethers.Wallet(process.env.PRIVATE_KEY_HMJ_TI, ethers.provider);

        console.log("Deploying contract...");
        skkm = await SKKM.connect(owner).deploy();
        await skkm.deployed();
        console.log(`Contract deployed at: ${skkm.address}`);

        // Adding users with roles Student, Departmental Student Association, and Student Executive Board
        console.log("Adding Student, Departmental Student Association, and Student Executive Board users...");
        let tx = await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await tx.wait();
        let studentUser = await skkm.users(student.address);
        console.log(`Student user added: ${JSON.stringify(studentUser)}`);
        expect(studentUser.exists).to.be.true;
        expect(studentUser.userAddress).to.equal(student.address);

        tx = await skkm.connect(owner).addUser(departmentalStudentAssociation.address, 2, "Departmental Student Association", "456", "Dept");
        await tx.wait();
        let departmentUser = await skkm.users(departmentalStudentAssociation.address);
        console.log(`Departmental Student Association user added: ${JSON.stringify(departmentUser)}`);
        expect(departmentUser.exists).to.be.true;
        expect(departmentUser.userAddress).to.equal(departmentalStudentAssociation.address);

        tx = await skkm.connect(owner).addUser(studentExecutiveBoard.address, 4, "Student Executive Board", "789", "Dept");
        await tx.wait();
        let studentExecutiveUser = await skkm.users(studentExecutiveBoard.address);
        console.log(`Student Executive Board user added: ${JSON.stringify(studentExecutiveUser)}`);
        expect(studentExecutiveUser.exists).to.be.true;
        expect(studentExecutiveUser.userAddress).to.equal(studentExecutiveBoard.address);

        // Submitting an initial Activity Credit for testing
        console.log(`Submitting initial Activity Credit...`);
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
        console.log(`Initial Activity Credit submitted.`);

        console.log(`Verifying Activity Credit...`);
        tx = await skkm.connect(departmentalStudentAssociation).verifySKKM(0, true, "");
        await tx.wait();
        console.log(`Activity Credit verified.`);

        console.log(`Validating Activity Credit...`);
        tx = await skkm.connect(departmentalStudentAssociation).validateSKKM(
            0,
            `Validated Category`,
            `Validated Type`,
            `Validated Achievement`,
            `Validated Assessment`,
            4
        );
        await tx.wait();
        console.log(`Activity Credit validated.`);

        console.log("Setting minimal points...");
        tx = await skkm.connect(owner).setMinimalPoin(4);
        await tx.wait();
        console.log("Minimal points set.");
    });

    // Sending five QR Codes to the Student Executive Board
    it("should send five QR Codes to the Student Executive Board", async function () {
        this.timeout(120000); // Set timeout to 120 seconds

        let tx, receipt;
        let startTime, endTime, formattedTime;

        for (let i = 1; i <= 5; i++) {
            try {
                // Generate QR Code
                console.log(`Generating QR Code ${i}...`);
                tx = await skkm.connect(student).generateQRCode(`QRCodeData${i}`);
                await tx.wait();
                console.log(`QR Code ${i} generated.`);

                // Verify QR Code status before sending
                let qrCode = await skkm.qrcodes(i - 1);
                console.log(`QR Code ${i} status before sending: ${qrCode.status}`);

                // Sending QR Code to Student Executive Board
                console.log(`Sending QR Code ${i} to Student Executive Board...`);
                startTime = process.hrtime(); // Record time before transaction
                tx = await skkm.connect(student).submitQRCode(`QRCodeData${i}`);
                receipt = await tx.wait();
                endTime = process.hrtime(startTime); // Record time after transaction
                formattedTime = formatTime(endTime); // Calculate and format transaction time
                console.log(`Send QR Code ${i} transaction hash: ${receipt.transactionHash}`);
                console.log(`Block number: ${receipt.blockNumber}`);
                console.log(`Transaction time for QR Code ${i}: ${formattedTime} seconds`);

                // Verify QR Code status after sending
                qrCode = await skkm.qrcodes(i - 1);
                expect(qrCode.qrCodeData).to.equal(`QRCodeData${i}`);
                expect(qrCode.status).to.equal(6); // Status.SendToStudentExecutiveBoard
            } catch (error) {
                console.error(`Failed to send QR Code ${i} to Student Executive Board:`, error);
                throw new Error(`Failed to send QR Code ${i} to Student Executive Board`);
            }
        }
    });
});
