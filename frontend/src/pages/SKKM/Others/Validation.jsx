import React, { useState } from "react";
import { useContract } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
} from "@material-tailwind/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";
import { useAddress } from "@thirdweb-dev/react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import QrCodeIcon from "@mui/icons-material/QrCode";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import VerifiedIcon from "@mui/icons-material/Verified";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { MediaRenderer } from "@thirdweb-dev/react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient( 95deg, rgb(134,0,255) 0%, rgb(171,71,188) 50%, rgb(88,0,214) 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient( 95deg, rgb(134,0,255) 0%, rgb(171,71,188) 50%, rgb(88,0,214) 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    backgroundImage:
      "linear-gradient( 136deg, rgb(134,0,255) 0%, rgb(171,71,188) 50%, rgb(88,0,214) 100%)",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  }),
  ...(ownerState.completed && {
    backgroundImage:
      "linear-gradient( 136deg, rgb(134,0,255) 0%, rgb(171,71,188) 50%, rgb(88,0,214) 100%)",
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: <QrCodeIcon />,
    2: <QrCodeScannerIcon />,
    3: <ScheduleSendIcon />,
    4: <VerifiedIcon />,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,
  icon: PropTypes.node,
};

const steps = [
  "Enter QR Code",
  "QR Code Found",
  "Submitted to SEB",
  "Validated by SEB",
];

const Validation = () => {
  const [qrCode, setQrCode] = useState("");
  const [skkmList, setSkkmList] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [role, setRole] = useState(null);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);
  const [studentAddress, setStudentAddress] = useState("");

  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);

  const handleZoomDialogOpen = () => setIsZoomDialogOpen(true);
  const handleZoomDialogClose = () => setIsZoomDialogOpen(false);

  const handleInputChange = (e) => {
    setQrCode(e.target.value);
  };

  const handleValidateQRCode = async () => {
    try {
      const skkmRequests = await contract.call("getSKKMByQRCode", [qrCode]);

      // Ambil address student dari hasil getSKKMByQRCode
      const studentAddress = skkmRequests[0].student;
      setStudentAddress(studentAddress);

      const qrCodeStatus = await contract.call("getQRCodeByStudent", [
        studentAddress,
      ]);
      const studentInfo = await contract.call("users", [studentAddress]);

      setSkkmList(skkmRequests);
      setStudentInfo(studentInfo);
      setRole(studentInfo.role);

      const qrStatus = qrCodeStatus.status;
      if (qrStatus === 7) {
        setActiveStep(3); // Validated by BEM
      } else if (qrStatus === 6) {
        setActiveStep(2); // Submitted to BEM
      } else if (qrStatus === 5) {
        setActiveStep(1); // Generated
      } else {
        setActiveStep(0); // Default or invalid status
      }

      toast.success("QR Code found");
    } catch (error) {
      console.error("Error validating QR Code:", error);
      setSkkmList([]);
      setActiveStep(0); // Reset step if not found
      toast.error("QR Code not found");
    }
  };

  const handleSendQRCodeToBEM = async () => {
    setLoading(true);
    const startTime = Date.now(); // Mulai timer
    try {
      await contract.call("submitQRCode", [qrCode]);
      setActiveStep(2); // Set step to indicate QR code is sent to BEM\
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Hentikan timer dan hitung durasi
      toast.success(`QR Code submitted to BEM in ${duration} seconds`);
      setLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error submitting QR Code:", error);
      toast.error("Error submitting QR Code");
      setLoading(false);
    }
  };

  const convertToFloat = (value) => {
    const floatValue = parseFloat(ethers.utils.formatEther(value));
    return isNaN(floatValue) ? 0 : floatValue;
  };

  const getCreditPointColor = (points) => {
    if (points >= 1 && points <= 10) return "blue";
    if (points >= 11 && points <= 20) return "red";
    if (points >= 21 && points <= 30) return "green";
    if (points >= 31 && points <= 40) return "amber";
    if (points >= 41 && points <= 50) return "pink";
    if (points >= 51 && points <= 60) return "indigo";
    if (points >= 61 && points <= 70) return "purple";
    if (points >= 71 && points <= 80) return "teal";
    if (points >= 81 && points <= 90) return "cyan";
    return "gray";
  };

  const totalPoints = skkmList.reduce(
    (total, request) => total + convertToFloat(request.creditPoin),
    0
  );

  const TABLE_HEAD = [
    "No",
    "Activity Name (ID / EN)",
    "Category / Type",
    "Credit Point",
    "Timestamp",
  ];

  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
  };

  return (
    <Card className="h-full w-full bg-white shadow-lg rounded-lg">
      <ToastContainer />
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          Validate QR Code
        </Typography>
        <Typography
          color="white"
          className="mt-1 text-sm text-center p-2 font-mediu"
        >
          This Validate QR Code.
        </Typography>
      </CardHeader>
      <CardBody className="p-4">
        <div className="mb-4">
          <Input
            label="Enter QR Code"
            value={qrCode}
            onChange={handleInputChange}
            placeholder="Enter QR Code here"
            className="mb-2"
          />
          <Button
            onClick={handleValidateQRCode}
            color="purple"
            className="mt-2"
          >
            Check
          </Button>
        </div>
        <div className="flex justify-center mb-4">
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
        {studentInfo && (
          <div className="mb-4 text-center">
            <Typography variant="h5" color="black">
              Student Information
            </Typography>
            <div className="flex justify-center items-center text-sm text-black">
              <span>
                Name: <span className="font-bold">{studentInfo.name}</span> |
                NIM: <span className="font-bold">{studentInfo.identifier}</span>{" "}
                | Department:{" "}
                <span className="font-bold">{studentInfo.department}</span> |
                Total Credit Points:{" "}
              </span>
              <Chip
                className="mx-2"
                color={getCreditPointColor(totalPoints)}
                value={totalPoints.toFixed(1)}
              />
            </div>
          </div>
        )}
        <div className="mt-4">
          {skkmList.length > 0 && (
            <Card
              className="h-full w-full overflow-y-auto"
              style={{ maxHeight: "240px" }}
            >
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skkmList.map((request, index) => (
                    <tr
                      key={index}
                      className="even:bg-blue-gray-50/50 cursor-pointer"
                      onClick={() => handleOpenDialog(request)}
                    >
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {index + 1}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {request.activityNameID}
                          <br />
                          {request.activityNameEN}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {request.activityCategory}
                          <br />
                          {request.activityType}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {convertToFloat(request.creditPoin).toFixed(2)}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {new Date(request.timestamp * 1000).toLocaleString()}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        {skkmList.length > 0 &&
          activeStep === 1 &&
          role === 1 &&
          studentAddress === useAddress() && (
            <div>
              <Button
                onClick={handleSendQRCodeToBEM}
                color="green"
                className="mt-4"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Send to BEM"}
              </Button>
            </div>
          )}
      </CardBody>
      {selectedRequest && (
        <Dialog
          size="lg"
          open={openDialog}
          handler={handleCloseDialog}
          dismiss={{ enabled: false }}
          animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0.9, y: -100 },
          }}
        >
          <DialogHeader className="justify-center text-deep-purple-900">
            <CardHeader className="rounded-3 bg-dark-sidebar mb-2 border-deep-purple-400 border-4">
              <Typography
                variant="h4"
                color="white"
                className="font-bold text-center p-5"
              >
                SKKM Details
              </Typography>
            </CardHeader>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Activity Name ID
                </Typography>
                <Input
                  label="Activity Name ID"
                  value={selectedRequest.activityNameID || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Activity Name EN
                </Typography>
                <Input
                  label="Activity Name EN"
                  value={selectedRequest.activityNameEN || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Certificate Number
                </Typography>
                <Input
                  label="Certificate Number"
                  value={selectedRequest.certificateNumber || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Activity Category
                </Typography>
                <Input
                  label="Activity Category"
                  value={selectedRequest.activityCategory || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Activity Type
                </Typography>
                <Input
                  label="Activity Type"
                  value={selectedRequest.activityType || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Achievement
                </Typography>
                <Input
                  label="Achievement"
                  value={selectedRequest.achievement || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Assessment Basis
                </Typography>
                <Input
                  label="Assessment Basis"
                  value={selectedRequest.assessmentBasis || "N/A"}
                  disabled
                  size="lg"
                />
              </div>

              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Credit Poin
                </Typography>
                <Input
                  label="Credit Poin"
                  value={
                    convertToFloat(selectedRequest.creditPoin).toFixed(2) ||
                    "N/A"
                  }
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  IPFS Hash{" "}
                  <a
                    href={`https://${
                      import.meta.env.VITE_CLIENT_ID
                    }.ipfscdn.io/ipfs/${selectedRequest.ipfsHash.replace(
                      /^ipfs:\/\//,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm font-semibold"
                  >
                    Check on Web
                  </a>
                </Typography>
                <Input
                  label="IPFS Hash"
                  value={
                    selectedRequest.ipfsHash
                      .replace(/^ipfs:\/\//, "")
                      .split("/")[0] || "N/A"
                  }
                  disabled
                  size="lg"
                />
              </div>
            </div>
            {selectedRequest.ipfsHash && (
              <div className="mt-4 flex justify-center">
                <Zoom>
                  <div className="flex justify-center border-2 border-purple-300 border-dashed p-2 rounded-lg">
                    {selectedRequest.ipfsHash.endsWith(".pdf") ? (
                      <div
                        className="w-96 overflow-y-auto"
                        style={{
                          maxHeight: "200px",
                          border: "1px solid #ccc",
                        }}
                        onClick={handleZoomDialogOpen}
                      >
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                          <Viewer
                            fileUrl={`https://${
                              import.meta.env.VITE_CLIENT_ID
                            }.ipfscdn.io/ipfs/${selectedRequest.ipfsHash.replace(
                              /^ipfs:\/\//,
                              ""
                            )}`}
                          />
                        </Worker>
                      </div>
                    ) : (
                      <MediaRenderer
                        src={`${selectedRequest.ipfsHash}`}
                        style={{ width: "100%", maxHeight: "200px" }}
                      />
                    )}
                  </div>
                </Zoom>
              </div>
            )}
          </DialogBody>
          <DialogFooter className="flex justify-end">
            <Button
              variant="gradient"
              color="red"
              onClick={handleCloseDialog}
              className="mr-1"
            >
              Close
            </Button>
          </DialogFooter>
          <Dialog
            open={isZoomDialogOpen}
            handler={handleZoomDialogClose}
            size="lg"
            dismiss={{ enabled: false }}
            animate={{
              mount: { scale: 1, y: 0 },
              unmount: { scale: 0.9, y: -100 },
            }}
          >
            <DialogHeader>Zoomed PDF View</DialogHeader>
            <DialogBody
              divider
              className="overflow-y-auto"
              style={{ maxHeight: "70vh" }}
            >
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={`https://${
                    import.meta.env.VITE_CLIENT_ID
                  }.ipfscdn.io/ipfs/${selectedRequest.ipfsHash.replace(
                    /^ipfs:\/\//,
                    ""
                  )}`}
                />
              </Worker>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="gradient"
                color="red"
                onClick={handleZoomDialogClose}
              >
                Close
              </Button>
            </DialogFooter>
          </Dialog>
        </Dialog>
      )}
    </Card>
  );
};

export default Validation;
