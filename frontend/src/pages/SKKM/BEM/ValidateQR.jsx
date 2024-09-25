import React, { useEffect, useState } from "react";
import { useAddress, useContract, MediaRenderer } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  CardFooter,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import { FaEye } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { ethers } from "ethers";

const ValidateQR = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [bemData, setBemData] = useState(null); // State untuk menyimpan data BEM
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const bemAddress = useAddress();
  const { contract } = useContract(contractAddress, abi);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const totalPages = Math.ceil(qrCodes.length / itemsPerPage);
  const paginatedQRCode = qrCodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleZoomDialogOpen = () => setIsZoomDialogOpen(true);
  const handleZoomDialogClose = () => setIsZoomDialogOpen(false);

  useEffect(() => {
    const fetchBemData = async () => {
      try {
        const data = await contract.call("users", [bemAddress]);
        setBemData(data);
      } catch (error) {
        console.error("Error fetching BEM data:", error);
      }
    };

    fetchBemData();
  }, [contract, bemAddress]);

  useEffect(() => {
    const fetchQrCodes = async () => {
      try {
        if (bemData) {
          const qrCodeList = await contract.call("getQRNotValidatedByBEM");
          const qrCodesWithStudentData = await Promise.all(
            qrCodeList.map(async (qrCode) => {
              const studentData = await contract.call("users", [
                qrCode.student,
              ]);
              return { ...qrCode, studentData };
            })
          );
          const filteredQrCodes = qrCodesWithStudentData.filter(
            (qrCode) => qrCode.studentData.department === bemData.department
          );
          setQrCodes(filteredQrCodes);
        }
      } catch (error) {
        console.error("Error fetching QR codes:", error);
        toast.error("Error fetching QR codes");
      }
    };

    if (bemData) {
      fetchQrCodes();
    }
  }, [contract, bemData]);

  const handleValidateByBEM = async (qrCodeId) => {
    setIsValidating(true); // Set loading state to true
    try {
      const startTime = Date.now(); // Mulai timer
      await contract.call("validateQRCodeByBEM", [qrCodeId]);
      setQrCodes((prev) => prev.filter((qr) => qr.qrCodeId !== qrCodeId));
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Hentikan timer dan hitung durasi
      toast.success(`QR Code validated by BEM in ${duration} seconds`);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error validating QR Code by BEM:", error);
      toast.error("Error validating QR Code by BEM");
    } finally {
      setIsValidating(false); // Set loading state to false
    }
  };

  const openDialog = async (qrCode) => {
    setSelectedQRCode(qrCode);
    try {
      const skkmRequests = await contract.call("getSKKMByQRCode", [
        qrCode.qrCodeData,
      ]);
      setSelectedQRCode({ ...qrCode, skkmRequests });
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching SKKM requests:", error);
      toast.error("Error fetching SKKM requests");
    }
  };

  const openCertificateDialog = (certificate) => {
    setSelectedCertificate(certificate);
    setCertificateDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedQRCode(null);
  };

  const closeCertificateDialog = () => {
    setCertificateDialogOpen(false);
    setSelectedCertificate(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const convertToFloat = (value) => {
    const floatValue = parseFloat(ethers.utils.formatEther(value));
    return isNaN(floatValue) ? 0 : floatValue;
  };

  return (
    <div>
      <ToastContainer />
      <Card className="h-full w-full bg-white shadow-lg rounded-lg">
        <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
          <Typography
            variant="h4"
            color="white"
            className="font-bold text-center p-2"
          >
            Validate QR Codes by BEM
          </Typography>
          <Typography color="white" className="mt-1 text-sm text-center p-2">
            These are menu for Validate QR Codes by{" "}
            <span className="font-extrabold">
              {bemData ? bemData.department : "Loading..."}
            </span>
          </Typography>
          <Typography
            color="white"
            className="mt-1 text-sm text-center p-2 font-extrabold"
          >
            Name :{" "}
            <span className="font-medium">
              {bemData ? bemData.name : "Loading..."}
            </span>
            {" | "}
            NIM :{" "}
            <span className="font-medium">
              {bemData ? bemData.identifier : "Loading..."}
            </span>
          </Typography>
        </CardHeader>
        <CardBody
          className="overflow-auto px-0 p-0"
          style={{ maxHeight: "550px" }}
        >
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr>
                <th
                  className="p-4 border-b border-neutral-700 border-r"
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#000000",
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="paragraph"
                    className="leading-none font-semibold text-purple-500"
                  >
                    QR Code ID
                  </Typography>
                </th>
                <th
                  className="p-4 border-b border-neutral-700 border-r"
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#000000",
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="paragraph"
                    className="leading-none font-semibold text-purple-500"
                  >
                    QR Code Data
                  </Typography>
                </th>
                <th
                  className="p-4 border-b border-neutral-700 border-r"
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#000000",
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="paragraph"
                    className="leading-none font-semibold text-purple-500"
                  >
                    Student Address
                  </Typography>
                </th>
                <th
                  className="p-4 border-b border-neutral-700"
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#000000",
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="paragraph"
                    className="leading-none font-semibold text-purple-500"
                  >
                    Action
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedQRCode.length > 0 ? (
                paginatedQRCode.map((qrCode, index) => (
                  <tr key={index}>
                    <td className="p-4 border-b border-black border-r bg-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {qrCode.qrCodeId.toString()}
                      </Typography>
                    </td>
                    <td className="p-4 border-b border-black border-r bg-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {qrCode.qrCodeData}
                      </Typography>
                    </td>
                    <td className="p-4 border-b border-black border-r">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {qrCode.student}
                      </Typography>
                    </td>
                    <td className="p-4 border-b border-black text-center">
                      <IconButton
                        ripple={true}
                        onClick={() => openDialog(qrCode)}
                      >
                        <FaEye className="text-purple-400" />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      No QR codes to validate by BEM.
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            color="purple"
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <IconButton
                key={i}
                variant={currentPage === i + 1 ? "outlined" : "text"}
                color="purple"
                size="sm"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </IconButton>
            ))}
          </div>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            color="purple"
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </CardFooter>
      </Card>

      {selectedQRCode && (
        <Dialog
          size="xl"
          open={dialogOpen}
          handler={closeDialog}
          dismiss={{ enabled: false }}
          animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0.9, y: -100 },
          }}
        >
          <DialogHeader className="justify-center text-deep-purple-900 flex">
            <CardHeader className="rounded-3 bg-dark-sidebar mb-2 border-deep-purple-400 border-4">
              <Typography
                variant="h4"
                color="white"
                className="font-bold text-center p-5"
              >
                QR Code Details
              </Typography>
            </CardHeader>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  QR Code ID
                </Typography>
                <Input
                  label="QR Code ID"
                  value={selectedQRCode.qrCodeId.toString() || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  QR Code Data
                </Typography>
                <Input
                  label="QR Code Data"
                  value={selectedQRCode.qrCodeData || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Student Address
                </Typography>
                <Input
                  label="Student Address"
                  value={selectedQRCode.student || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
            </div>
            <div
              className="mt-4"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {selectedQRCode.skkmRequests && (
                <Card className="h-full w-full">
                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            No
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Activity Name (ID / EN)
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Category / Type
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Credit Point
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Timestamp
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQRCode.skkmRequests.map((request, index) => (
                        <tr
                          key={index}
                          className="even:bg-blue-gray-50/50 cursor-pointer"
                          onClick={() => openCertificateDialog(request)}
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
                              {new Date(
                                request.timestamp * 1000
                              ).toLocaleString()}
                            </Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outlined"
              color="red"
              onClick={closeDialog}
              className="mr-1"
              disabled={isValidating} // Disable button while validating
            >
              <span>Close</span>
            </Button>
            <Button
              onClick={() => handleValidateByBEM(selectedQRCode.qrCodeId)}
              color="green"
              className="mt-2"
              disabled={isValidating} // Disable button while validating
            >
              {isValidating ? "Validating..." : "Validate"}
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
                  }.ipfscdn.io/ipfs/${selectedQRCode.ipfsHash?.replace(
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

      {selectedCertificate && (
        <Dialog
          size="lg"
          open={certificateDialogOpen}
          handler={closeCertificateDialog}
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
                  value={selectedCertificate.activityNameID || "N/A"}
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
                  value={selectedCertificate.activityNameEN || "N/A"}
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
                  value={selectedCertificate.certificateNumber || "N/A"}
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
                  value={selectedCertificate.activityCategory || "N/A"}
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
                  value={selectedCertificate.activityType || "N/A"}
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
                  value={selectedCertificate.achievement || "N/A"}
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
                  value={selectedCertificate.assessmentBasis || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Credit Point
                </Typography>
                <Input
                  label="Credit Point"
                  value={convertToFloat(selectedCertificate.creditPoin).toFixed(
                    2
                  )}
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
                    }.ipfscdn.io/ipfs/${selectedCertificate.ipfsHash?.replace(
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
                    selectedCertificate.ipfsHash
                      ?.replace(/^ipfs:\/\//, "")
                      .split("/")[0] || "N/A"
                  }
                  disabled
                  size="lg"
                />
              </div>
            </div>
            {selectedCertificate?.ipfsHash && (
              <div className="mt-4 flex justify-center">
                <Zoom>
                  <div className="flex justify-center border-2 border-purple-300 border-dashed p-2 rounded-lg">
                    {selectedCertificate.ipfsHash.endsWith(".pdf") ? (
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
                            }.ipfscdn.io/ipfs/${selectedCertificate.ipfsHash.replace(
                              /^ipfs:\/\//,
                              ""
                            )}`}
                          />
                        </Worker>
                      </div>
                    ) : (
                      <MediaRenderer
                        src={`${selectedCertificate.ipfsHash}`}
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
              onClick={closeCertificateDialog}
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
                  }.ipfscdn.io/ipfs/${selectedCertificate.ipfsHash?.replace(
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
    </div>
  );
};

export default ValidateQR;
