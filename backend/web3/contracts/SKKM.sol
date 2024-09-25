// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SKKM {
    address public superAdmin;
    uint public minimalPoin;

    enum Role {
        None,
        Student,
        HMJ,
        Admin,
        BEM
    }

    enum Status {
        Pending,
        Verified,
        Unverified,
        Valid,
        Revised,
        Generated,
        SendToBEM,
        ValidatedByBEM
    }

    struct SKKMRequest {
        uint skkmId;
        address student;
        string activityNameID;
        string activityNameEN;
        string certificateNumber;
        string activityCategory;
        string activityType;
        string achievement;
        string assessmentBasis;
        string ipfsHash;
        uint creditPoin;
        Status status;
        string unverifiedMessage;
        uint timestamp;
    }

    struct User {
        uint userId;
        address userAddress;
        string name;
        string identifier;
        string department;
        Role role;
        bool exists;
    }

    struct QRCode {
        uint qrCodeId;
        address student;
        string qrCodeData;
        Status status;
        uint timestamp;
    }

    mapping(address => User) public users;
    mapping(string => bool) private identifiers;
    mapping(address => mapping(string => bool))
        private studentCertificateNumbers;
    SKKMRequest[] public requests;
    User[] public allUsers;
    QRCode[] public qrcodes;
    mapping(address => bool) public hasGeneratedQRCode;
    mapping(address => uint) public lastQRCodeTimestamp;

    event SKKMSubmitted(
        uint requestId,
        address indexed student,
        string ipfsHash,
        string certificateNumber,
        address triggeredBy
    );

    event SKKMVerified(
        uint requestId,
        address indexed verifier,
        bool isVerified,
        string message,
        address triggeredBy
    );

    event SKKMValidated(
        uint requestId,
        address indexed validator,
        bool isValid,
        address triggeredBy
    );

    event SKKMEdited(
        uint requestId,
        address indexed student,
        string ipfsHash,
        string certificateNumber,
        address triggeredBy
    );

    event SKKMDeleted(
        uint requestId,
        address indexed student,
        address triggeredBy
    );
    event UserDeleted(address indexed user, address triggeredBy);
    event MinimalPoinUpdated(uint newMinimalPoin, address triggeredBy);
    event QRCodeGenerated(
        uint qrCodeId,
        address indexed student,
        string qrCodeData,
        uint timestamp,
        address triggeredBy
    );
    event QRCodeSubmitted(
        uint qrCodeId,
        address indexed student,
        string qrCodeData,
        uint timestamp,
        address triggeredBy
    );

    event UserAdded(
        uint userId,
        address indexed user,
        string name,
        string identifier,
        string department,
        Role role,
        address triggeredBy
    );

    event QRCodeValidatedByBEM(
        uint qrCodeId,
        address indexed validator,
        address indexed student,
        address triggeredBy
    );

    modifier onlySuperAdmin() {
        require(
            msg.sender == superAdmin,
            "Only super admin can perform this action"
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            users[msg.sender].role == Role.Admin || msg.sender == superAdmin,
            "Only admin can perform this action"
        );
        _;
    }

    modifier onlyStudent() {
        require(
            users[msg.sender].role == Role.Student,
            "Only students can perform this action"
        );
        _;
    }

    modifier onlyHMJ() {
        require(
            users[msg.sender].role == Role.HMJ,
            "Only HMJ can perform this action"
        );
        _;
    }

    modifier onlyBEM() {
        require(
            users[msg.sender].role == Role.BEM,
            "Only BEM can perform this action"
        );
        _;
    }

    constructor() {
        superAdmin = msg.sender;
    }

    function addUser(
        address user,
        Role role,
        string memory name,
        string memory identifier,
        string memory department
    ) external payable {
        require(
            msg.sender == superAdmin ||
                (role != Role.Admin && users[msg.sender].role == Role.Admin),
            "Only admin or super admin can perform this action"
        );
        require(!users[user].exists, "User already exists");
        require(!identifiers[identifier], "Identifier already exists");

        User memory newUser = User({
            userId: allUsers.length,
            userAddress: user,
            name: name,
            identifier: identifier,
            department: department,
            role: role,
            exists: true
        });

        users[user] = newUser;
        allUsers.push(newUser);

        identifiers[identifier] = true;

        if (msg.value > 0) {
            payable(user).transfer(msg.value);
        }

        emit UserAdded(
            newUser.userId,
            user,
            name,
            identifier,
            department,
            role,
            msg.sender
        );
    }

    function updateUser(
        address user,
        Role role,
        string memory name,
        string memory identifier,
        string memory department
    ) external onlyAdmin {
        require(users[user].exists, "User does not exist");
        require(
            !identifiers[identifier] ||
                keccak256(bytes(identifier)) ==
                keccak256(bytes(users[user].identifier)),
            "Identifier already exists"
        );

        User storage existingUser = users[user];
        existingUser.name = name;
        existingUser.identifier = identifier;
        existingUser.department = department;
        existingUser.role = role;

        allUsers[existingUser.userId] = existingUser;

        identifiers[identifier] = true;
    }

    function deleteUser(address user) external onlyAdmin {
        require(users[user].exists, "User does not exist");

        delete identifiers[users[user].identifier];
        uint userId = users[user].userId;
        delete users[user];

        for (uint i = userId; i < allUsers.length - 1; i++) {
            allUsers[i] = allUsers[i + 1];
            users[allUsers[i].userAddress].userId = i;
        }
        allUsers.pop();

        emit UserDeleted(user, msg.sender);
    }

    function submitSKKM(
        string memory activityNameID,
        string memory activityNameEN,
        string memory certificateNumber,
        string memory activityCategory,
        string memory activityType,
        string memory achievement,
        string memory assessmentBasis,
        string memory ipfsHash,
        uint creditPoin
    ) external onlyStudent {
        require(
            !studentCertificateNumbers[msg.sender][certificateNumber],
            "Certificate number already exists"
        );

        uint requestId = requests.length;
        requests.push(
            SKKMRequest({
                skkmId: requestId,
                student: msg.sender,
                activityNameID: activityNameID,
                activityNameEN: activityNameEN,
                certificateNumber: certificateNumber,
                activityCategory: activityCategory,
                activityType: activityType,
                achievement: achievement,
                assessmentBasis: assessmentBasis,
                ipfsHash: ipfsHash,
                creditPoin: creditPoin,
                status: Status.Pending,
                unverifiedMessage: "",
                timestamp: 0
            })
        );
        studentCertificateNumbers[msg.sender][certificateNumber] = true;
        emit SKKMSubmitted(
            requestId,
            msg.sender,
            ipfsHash,
            certificateNumber,
            msg.sender
        );
    }

    function editSKKM(
        uint requestId,
        string memory activityNameID,
        string memory activityNameEN,
        string memory newCertificateNumber,
        string memory activityCategory,
        string memory activityType,
        string memory achievement,
        string memory assessmentBasis,
        string memory ipfsHash,
        uint creditPoin
    ) external onlyStudent {
        require(requestId < requests.length, "Invalid request ID");
        SKKMRequest storage request = requests[requestId];
        require(request.student == msg.sender, "Unauthorized");
        require(
            request.status == Status.Pending ||
                request.status == Status.Unverified ||
                request.status == Status.Revised,
            "Cannot edit request after verification"
        );

        require(
            keccak256(bytes(request.certificateNumber)) ==
                keccak256(bytes(newCertificateNumber)) ||
                !studentCertificateNumbers[msg.sender][newCertificateNumber],
            "Certificate number already exists"
        );

        studentCertificateNumbers[msg.sender][
            request.certificateNumber
        ] = false;
        request.activityNameID = activityNameID;
        request.activityNameEN = activityNameEN;
        request.certificateNumber = newCertificateNumber;
        request.activityCategory = activityCategory;
        request.activityType = activityType;
        request.achievement = achievement;
        request.assessmentBasis = assessmentBasis;
        request.ipfsHash = ipfsHash;
        request.creditPoin = creditPoin;

        if (request.status == Status.Unverified) {
            request.status = Status.Revised;
        } else if (request.status == Status.Pending) {
            request.status = Status.Pending;
        }

        studentCertificateNumbers[msg.sender][newCertificateNumber] = true;
        emit SKKMEdited(
            requestId,
            msg.sender,
            ipfsHash,
            newCertificateNumber,
            msg.sender
        );
    }

    function deleteSKKM(uint requestId) external onlyStudent {
        require(requestId < requests.length, "Invalid request ID");
        SKKMRequest storage request = requests[requestId];
        require(request.student == msg.sender, "Unauthorized");
        require(
            request.status == Status.Pending,
            "Cannot delete request after verification"
        );

        studentCertificateNumbers[msg.sender][
            request.certificateNumber
        ] = false;

        for (uint i = requestId; i < requests.length - 1; i++) {
            requests[i] = requests[i + 1];
            requests[i].skkmId = i;
        }
        requests.pop();

        emit SKKMDeleted(requestId, msg.sender, msg.sender);
    }

    function verifySKKM(
        uint requestId,
        bool isVerified,
        string memory message
    ) external onlyHMJ {
        require(requestId < requests.length, "Invalid request ID");
        SKKMRequest storage request = requests[requestId];
        require(
            request.status == Status.Pending ||
                request.status == Status.Revised,
            "Request already processed"
        );
        request.status = isVerified ? Status.Verified : Status.Unverified;
        request.unverifiedMessage = isVerified ? "" : message;
        emit SKKMVerified(
            requestId,
            msg.sender,
            isVerified,
            message,
            msg.sender
        );
    }

    function validateSKKM(
        uint requestId,
        string memory activityCategory,
        string memory activityType,
        string memory achievement,
        string memory assessmentBasis,
        uint creditPoin
    ) external onlyHMJ {
        require(requestId < requests.length, "Invalid request ID");
        SKKMRequest storage request = requests[requestId];
        require(
            request.status == Status.Verified,
            "Request not verified by HMJ"
        );

        request.activityCategory = activityCategory;
        request.activityType = activityType;
        request.achievement = achievement;
        request.assessmentBasis = assessmentBasis;
        request.creditPoin = creditPoin;
        request.status = Status.Valid;
        request.timestamp = block.timestamp;
        emit SKKMValidated(requestId, msg.sender, true, msg.sender);
    }

    function submitQRCode(string memory qrCodeData) external onlyStudent {
        require(hasGeneratedQRCode[msg.sender], "Generate QR Code first");
        QRCode storage qrCode = qrcodes[qrcodes.length - 1];
        require(qrCode.status == Status.Generated, "Invalid QR Code status");

        qrCode.status = Status.SendToBEM;
        qrCode.qrCodeData = qrCodeData;
        qrCode.timestamp = block.timestamp;

        emit QRCodeSubmitted(
            qrCode.qrCodeId,
            msg.sender,
            qrCodeData,
            qrCode.timestamp,
            msg.sender
        );
    }

    function validateQRCodeByBEM(uint qrCodeId) external onlyBEM {
        require(qrCodeId < qrcodes.length, "Invalid QR Code ID");
        QRCode storage qrCode = qrcodes[qrCodeId];
        require(
            qrCode.status == Status.SendToBEM,
            "QR Code must be sent to BEM first"
        );

        qrCode.status = Status.ValidatedByBEM;
        emit QRCodeValidatedByBEM(
            qrCodeId,
            msg.sender,
            qrCode.student,
            msg.sender
        );
    }

    function getSKKMByStudent(
        address student
    ) external view returns (SKKMRequest[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].student == student) {
                count++;
            }
        }

        SKKMRequest[] memory result = new SKKMRequest[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].student == student) {
                result[index] = requests[i];
                index++;
            }
        }
        return result;
    }

    function getSKKMByQRCode(
        string memory qrCode
    ) external view returns (SKKMRequest[] memory) {
        address student = address(0);
        uint qrCodeTimestamp = 0;
        for (uint256 i = 0; i < qrcodes.length; i++) {
            if (
                keccak256(bytes(qrcodes[i].qrCodeData)) ==
                keccak256(bytes(qrCode))
            ) {
                student = qrcodes[i].student;
                qrCodeTimestamp = qrcodes[i].timestamp;
                break;
            }
        }

        require(student != address(0), "QR Code not found");

        uint256 count = 0;
        for (uint256 i = 0; i < requests.length; i++) {
            if (
                requests[i].student == student &&
                requests[i].status == Status.Valid &&
                requests[i].timestamp <= qrCodeTimestamp
            ) {
                count++;
            }
        }

        SKKMRequest[] memory result = new SKKMRequest[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < requests.length; i++) {
            if (
                requests[i].student == student &&
                requests[i].status == Status.Valid &&
                requests[i].timestamp <= qrCodeTimestamp
            ) {
                result[index] = requests[i];
                index++;
            }
        }
        return result;
    }

    function getQRNotValidatedByBEM() external view returns (QRCode[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < qrcodes.length; i++) {
            if (qrcodes[i].status == Status.SendToBEM) {
                count++;
            }
        }

        QRCode[] memory result = new QRCode[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < qrcodes.length; i++) {
            if (qrcodes[i].status == Status.SendToBEM) {
                result[index] = qrcodes[i];
                index++;
            }
        }
        return result;
    }

    function getSKKMNotVerifiedByHMJ()
        external
        view
        returns (SKKMRequest[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < requests.length; i++) {
            if (
                requests[i].status == Status.Pending ||
                requests[i].status == Status.Revised
            ) {
                count++;
            }
        }

        SKKMRequest[] memory result = new SKKMRequest[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < requests.length; i++) {
            if (
                requests[i].status == Status.Pending ||
                requests[i].status == Status.Revised
            ) {
                result[index] = requests[i];
                index++;
            }
        }
        return result;
    }

    function getSKKMNotValidatedByHMJ()
        external
        view
        returns (SKKMRequest[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].status == Status.Verified) {
                count++;
            }
        }

        SKKMRequest[] memory result = new SKKMRequest[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].status == Status.Verified) {
                result[index] = requests[i];
                index++;
            }
        }
        return result;
    }

    function setMinimalPoin(uint _minimalPoin) external onlyAdmin {
        minimalPoin = _minimalPoin;
        emit MinimalPoinUpdated(_minimalPoin, msg.sender);
    }

    function generateQRCode(string memory qrCodeData) external onlyStudent {
        uint totalPoin = 0;
        for (uint i = 0; i < requests.length; i++) {
            if (
                requests[i].student == msg.sender &&
                requests[i].status == Status.Valid
            ) {
                totalPoin += requests[i].creditPoin;
            }
        }
        require(totalPoin >= minimalPoin, "Minimal poin not reached");

        uint qrCodeId = qrcodes.length;
        uint currentTimestamp = block.timestamp;
        qrcodes.push(
            QRCode({
                qrCodeId: qrCodeId,
                student: msg.sender,
                qrCodeData: qrCodeData,
                status: Status.Generated,
                timestamp: currentTimestamp
            })
        );
        lastQRCodeTimestamp[msg.sender] = currentTimestamp;
        hasGeneratedQRCode[msg.sender] = true;

        emit QRCodeGenerated(
            qrCodeId,
            msg.sender,
            qrCodeData,
            currentTimestamp,
            msg.sender
        );
    }

    function getQRCodeByStudent(
        address student
    ) external view returns (QRCode memory) {
        require(users[student].exists, "Student does not exist");
        require(hasGeneratedQRCode[student], "QR Code not generated");
        QRCode storage qrCode = qrcodes[qrcodes.length - 1];
        return qrCode;
    }

    function getAllSKKM() external view returns (SKKMRequest[] memory) {
        return requests;
    }

    function getAllUsers() external view returns (User[] memory) {
        return allUsers;
    }

    function getAllQRCodes() external view returns (QRCode[] memory) {
        return qrcodes;
    }
}
