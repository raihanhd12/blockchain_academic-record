const { ethers } = require("hardhat");

describe("Validating Activity Credit in the Activity Credit Contract", function () {
    let SKKM, skkm, owner, student, departmentStudentAssociation;
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
        departmentStudentAssociation = new ethers.Wallet(process.env.PRIVATE_KEY_HMJ_TI, ethers.provider);

        console.log("Deploying contract...");
        skkm = await SKKM.connect(owner).deploy();
        await skkm.deployed();
        console.log(`Contract deployed at: ${skkm.address}`);

        // Adding users with Student and Departmental Student Association roles
        console.log("Adding student and Departmental Student Association users...");
        let tx = await skkm.connect(owner).addUser(student.address, 1, "Student", "123", "Dept");
        await tx.wait();
        let studentUser = await skkm.users(student.address);
        console.log(`Student user added: ${JSON.stringify(studentUser)}`);
        expect(studentUser.exists).to.be.true;
        expect(studentUser.userAddress).to.equal(student.address);

        tx = await skkm.connect(owner).addUser(departmentStudentAssociation.address, 2, "Departmental Student Association", "456", "Dept");
        await tx.wait();
        let departmentUser = await skkm.users(departmentStudentAssociation.address);
        console.log(`Departmental Student Association user added: ${JSON.stringify(departmentUser)}`);
        expect(departmentUser.exists).to.be.true;
        expect(departmentUser.userAddress).to.equal(departmentStudentAssociation.address);

        // Submitting five Activity Credits for validation testing
        for (let i = 1; i <= 5; i++) {
            console.log(`Submitting initial Activity Credit ${i}...`);
            tx = await skkm.connect(student).submitSKKM(
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
            console.log(`Initial Activity Credit ${i} submitted.`);

            // Verifying Activity Credit to enable validation
            console.log(`Verifying Activity Credit ${i}...`);
            tx = await skkm.connect(departmentStudentAssociation).verifySKKM(i - 1, true, "Verified by Departmental Student Association");
            await tx.wait();
            console.log(`Activity Credit ${i} verified.`);
        }
    });

    // Validate five existing Activity Credits by the Departmental Student Association
    it("should validate five existing Activity Credits by the Departmental Student Association", async function () {
        this.timeout(120000); // Set timeout to 120 seconds

        let tx, receipt;
        let startTime, endTime, formattedTime;

        for (let i = 0; i < 5; i++) {
            try {
                // Validating Activity Credit
                console.log(`Validating Activity Credit ${i + 1}...`);
                startTime = process.hrtime(); // Record time before transaction
                tx = await skkm.connect(departmentStudentAssociation).validateSKKM(
                    i,
                    `Validated Category ${i + 1}`,
                    `Validated Type ${i + 1}`,
                    `Validated Achievement ${i + 1}`,
                    `Validated Assessment ${i + 1}`,
                    10 * (i + 1)
                ); // Validate Activity Credit with corresponding ID
                receipt = await tx.wait();
                endTime = process.hrtime(startTime); // Record time after transaction
                formattedTime = formatTime(endTime); // Calculate and format transaction time
                console.log(`Validate Activity Credit ${i + 1} transaction hash: ${receipt.transactionHash}`);
                console.log(`Block number: ${receipt.blockNumber}`);
                console.log(`Transaction time for Activity Credit ${i + 1}: ${formattedTime} seconds`);

                // Verify that the Activity Credit has been validated
                const skkmRequest = await skkm.requests(i);
                expect(skkmRequest.status).to.equal(3); // Status.Valid
            } catch (error) {
                console.error(`Failed to validate Activity Credit ${i + 1}:`, error);
                throw new Error(`Failed to validate Activity Credit ${i + 1}`);
            }
        }
    });
});
