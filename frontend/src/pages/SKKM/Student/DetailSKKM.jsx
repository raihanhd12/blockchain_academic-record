import React, { useState, useEffect } from "react";
import { useAddress, MediaRenderer, useContract } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Drawer,
  Textarea,
  Spinner,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { FaInfoCircle, FaCheck, FaRegCopy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import QRCode from "qrcode.react";

const TABS = [
  {
    label: "All",
    value: "semua",
  },
  {
    label: "Verified",
    value: "verified",
  },
  {
    label: "Valid",
    value: "valid",
  },
];

const TABLE_HEAD = [
  "Activity Name ID / Certificate Number",
  "Activity Type / Achievement",
  "Poin",
  "SKPI",
  "Status",
  "Action",
];

const DetailSKKM = () => {
  const [skkmList, setSkkmList] = useState([]);
  const [filteredSkkmList, setFilteredSkkmList] = useState([]);
  const [activeTab, setActiveTab] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [oneTimeCodes, setOneTimeCodes] = useState({});
  const [minimalPoin, setMinimalPoin] = useState(0);
  const address = useAddress();
  const navigate = useNavigate();
  const [openBottom, setOpenBottom] = useState(false);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);

  const [openQRCodeDialog, setOpenQRCodeDialog] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [qrInputValue, setQrInputValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [loadingSetQRCode, setLoadingSetQRCode] = useState(false);
  const [initialQRCode, setInitialQRCode] = useState("");
  const [hasNewValidCertificate, setHasNewValidCertificate] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const openDeleteSKKMDialog = (requestId) => {
    setDeleteRequestId(requestId);
    setOpenDeleteDialog(true);
  };

  const closeDeleteSKKMDialog = () => {
    setDeleteRequestId(null);
    setOpenDeleteDialog(false);
  };

  useEffect(() => {
    if (openQRCodeDialog && address) {
      const fetchQRCode = async () => {
        try {
          const qrCode = await contract.call("getQRCodeByStudent", [address]);
          setInitialQRCode(qrCode || "");
          setQrCodeValue(qrCode.qrCodeData || "");

          const skkmRequests = await contract.call("getSKKMByStudent", [
            address,
          ]);
          const validCertificates = skkmRequests.filter(
            (request) =>
              request.status === 3 && request.timestamp > qrCode.timestamp
          );

          setHasNewValidCertificate(validCertificates.length > 0);
        } catch (error) {
          console.error("Error fetching QR Code:", error);
        }
      };
      fetchQRCode();
    }
  }, [openQRCodeDialog, address, contract]);

  const handleGenerateCode = () => {
    if (validPoints >= minimalPoin) {
      const randomValue = Math.random().toString(36).substring(2, 12); // Generate 10 character random value
      const addressStart = address.substring(0, 5);
      const qrCodeValue = `${studentInfo.identifier}-${addressStart}-${randomValue}`;
      setQrCodeValue(qrCodeValue); // Set QR code value
      setIsCodeGenerated(true);
    } else {
      toast.error("Minimal points not reached");
    }
  };

  const handleSetQRCode = async () => {
    setLoadingSetQRCode(true);
    const startTime = Date.now(); // Mulai timer
    try {
      await contract.call("generateQRCode", [qrCodeValue]);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Hentikan timer dan hitung durasi
      toast.success(
        `QR Code set successfully in smart contract in ${duration} seconds`
      );
      handleCloseQRCodeDialog(); // Close the dialog when the QR Code is set

      // Update the state to reflect that there are no new valid certificates
      setHasNewValidCertificate(false);
    } catch (error) {
      console.error("Error setting QR Code in smart contract:", error);
      toast.error("Error setting QR Code in smart contract");
    } finally {
      setLoadingSetQRCode(false);
    }
  };

  const handleOpenQRCodeDialog = () => {
    setOpenQRCodeDialog(true);
  };

  const handleCloseQRCodeDialog = () => {
    setOpenQRCodeDialog(false);
    setIsCodeGenerated(false);
    setQrCodeValue(""); // Reset QR code value
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(qrCodeValue)
      .then(() => {
        toast.success("QR Code value copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy QR Code value");
      });
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);

  const handleZoomDialogOpen = () => setIsZoomDialogOpen(true);
  const handleZoomDialogClose = () => setIsZoomDialogOpen(false);

  const [size, setSize] = useState("xl");
  const openDrawerBottom = () => setOpenBottom(true);
  const closeDrawerBottom = () => setOpenBottom(false);

  const openDialog = (request) => {
    setSelectedRequest(request);
    setOpenModal(true);
  };

  const closeDialog = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  useEffect(() => {
    if (address) {
      fetchStudentData();
    }
  }, [address]);

  const fetchStudentData = async () => {
    try {
      const [skkmRequests, studentInfo, minimalPoin] = await Promise.all([
        contract.call("getSKKMByStudent", [address]),
        contract.call("users", [address]),
        contract.call("minimalPoin"),
      ]);

      const reversedRequests = [...skkmRequests].reverse();
      setSkkmList(reversedRequests);
      setStudentInfo(studentInfo);
      setMinimalPoin(ethers.utils.formatEther(minimalPoin)); // Convert minimalPoin to a readable format

      const validCertificates = reversedRequests.filter(
        (request) => request.status === 3
      );
      setHasNewValidCertificate(validCertificates.length > 0);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Error fetching student data");
    }
  };

  useEffect(() => {
    filterSKKMList();
  }, [activeTab, skkmList, searchTerm, currentPage]);

  const filterSKKMList = () => {
    let filteredList = skkmList;

    if (activeTab !== "semua") {
      const statusFilter = activeTab === "verified" ? 1 : 3;
      filteredList = filteredList.filter(
        (request) => request.status === statusFilter
      );
    }

    if (searchTerm) {
      filteredList = filteredList.filter(
        (request) =>
          request.activityNameID
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.certificateNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.activityType
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.achievement
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getStatusLabel(request.status)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSkkmList(filteredList);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Verified";
      case 2:
        return "Unverified";
      case 3:
        return "Valid";
      case 4:
        return "Revised";
      default:
        return "";
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(filteredSkkmList.length / itemsPerPage);

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  const handleEditSKKM = (request) => {
    const randomCode = generateRandomCode();
    setOneTimeCodes((prevCodes) => ({
      ...prevCodes,
      [request.skkmId]: randomCode,
    }));
    navigate(`/skkm/edit-skkm/${request.skkmId}/${randomCode}`);
  };

  const handleDeleteSKKM = async () => {
    setLoadingDelete(true);
    const startTime = Date.now(); // Start timer
    try {
      await contract.call("deleteSKKM", [deleteRequestId]);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Calculate duration
      toast.success(`SKKM deleted successfully in ${duration} seconds`);
      closeDeleteSKKMDialog();
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Delay 3 seconds before refreshing
    } catch (error) {
      console.error("Error deleting SKKM:", error);
      toast.error("Error deleting SKKM");
    } finally {
      setLoadingDelete(false);
    }
  };

  const paginatedSkkmList = filteredSkkmList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const convertToFloat = (value) => {
    const floatValue = parseFloat(ethers.utils.formatEther(value));
    return isNaN(floatValue) ? 0 : floatValue;
  };

  const totalPoin = skkmList.reduce((total, request) => {
    return total + convertToFloat(request.creditPoin);
  }, 0);

  const pendingPoints = skkmList.reduce((total, request) => {
    if (request.status === 0) {
      return total + convertToFloat(request.creditPoin);
    }
    return total;
  }, 0);

  const verifPoints = skkmList.reduce((total, request) => {
    if (request.status === 1) {
      return total + convertToFloat(request.creditPoin);
    }
    return total;
  }, 0);

  const unverifPoints = skkmList.reduce((total, request) => {
    if (request.status === 2) {
      return total + convertToFloat(request.creditPoin);
    }
    return total;
  }, 0);

  const validPoints = skkmList.reduce((total, request) => {
    if (request.status === 3) {
      return total + convertToFloat(request.creditPoin);
    }
    return total;
  }, 0);

  const revisedPoints = skkmList.reduce((total, request) => {
    if (request.status === 4) {
      return total + convertToFloat(request.creditPoin);
    }
    return total;
  }, 0);

  const minimalPoints = Math.max(minimalPoin - validPoints, 0);

  const truncateText = (text, maxWords) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + " ...";
    }
    return text;
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
          My Points
        </Typography>
        <div className="mt-1 text-sm text-center p-2">
          <Typography variant="h6" color="white">
            Student Identity
          </Typography>
          {studentInfo && (
            <div className="text-center p-2">
              <Typography color="white" className="mt-1 text-sm">
                Name: <span className="font-black">{studentInfo.name}</span>{" "}
                NIM:{" "}
                <span className="font-black">{studentInfo.identifier}</span>{" "}
                Department:{" "}
                <span className="font-black">{studentInfo.department}</span>
              </Typography>
            </div>
          )}
        </div>
      </CardHeader>
      {address ? (
        <>
          <CardBody
            className="px-0 pb-0 overflow-auto"
            style={{ maxHeight: "520px" }}
          >
            <div className="mb-4 flex items-center justify-between gap-8 px-4">
              <div className="w-full md:w-72">
                <Input
                  label="Search"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button
                  className="flex items-center gap-3"
                  size="sm"
                  color="red"
                  onClick={handleOpenQRCodeDialog} // tambahkan handler untuk dialog QR Code
                  disabled={validPoints < minimalPoin} // disable jika poin valid kurang dari minimal poin
                >
                  QR Code
                </Button>
                <Button
                  className="flex items-center gap-3"
                  size="sm"
                  onClick={() => navigate("/skkm/submit-skkm")}
                >
                  <PlusIcon strokeWidth={2} className="h-4 w-4" /> Add New
                </Button>
              </div>
            </div>

            <div className="mb-8 flex items-center justify-between gap-8 px-4">
              <Tabs value={activeTab} className="w-full">
                <TabsHeader
                  indicatorProps={{
                    className: "bg-purple-500 rounded-full",
                  }}
                  style={{ background: "none" }}
                >
                  {TABS.map(({ label, value }) => (
                    <Tab
                      key={value}
                      value={value}
                      onClick={() => setActiveTab(value)}
                      className={`px-4 py-2 rounded-full ${
                        activeTab === value
                          ? "bg-purple-500 text-white"
                          : "bg-black text-white"
                      } transition-colors duration-300`}
                    >
                      &nbsp;&nbsp;{label}&nbsp;&nbsp;
                    </Tab>
                  ))}
                </TabsHeader>
              </Tabs>
            </div>
            <div className="overflow-auto" style={{ maxHeight: "600px" }}>
              <table className="w-full min-w-max table-auto">
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head, index) => (
                      <th
                        key={head}
                        className={`p-4 border-b border-neutral-700 ${
                          index !== TABLE_HEAD.length - 1 ? "border-r" : ""
                        }`}
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
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ minHeight: "200px" }}>
                  {paginatedSkkmList.length > 0 ? (
                    paginatedSkkmList.map((request, index) => {
                      const isLast = index === paginatedSkkmList.length - 1;
                      const classes = isLast
                        ? "p-4"
                        : "p-4 border-b border-neutral-700";

                      return (
                        <tr key={index}>
                          <td
                            className={`${classes} border-r border-b border-blue-gray-100 bg-blue-gray-50`}
                          >
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {truncateText(request.activityNameID, 8)}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {request.certificateNumber}
                            </Typography>
                          </td>
                          <td className={`${classes} border-r`}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {request.activityType}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {request.achievement}
                            </Typography>
                          </td>
                          <td
                            className={`${classes} border-r border-blue-gray-100 bg-blue-gray-50`}
                          >
                            <Typography
                              variant="small"
                              className="font-normal text-center"
                            >
                              {convertToFloat(request.creditPoin).toFixed(1)}
                            </Typography>
                          </td>
                          <td className={`${classes} border-r`}>
                            <div className="flex justify-center items-center">
                              {request.SKPI ? (
                                <CheckIcon className="h-5 w-5 text-green-500" />
                              ) : (
                                <MinusIcon className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </td>
                          <td
                            className={`${classes} border-r border-blue-gray-100 bg-blue-gray-50`}
                          >
                            <div className="flex justify-center items-center">
                              <Chip
                                size="sm"
                                variant="ghost"
                                value={getStatusLabel(request.status)}
                                color={
                                  request.status === 0
                                    ? "amber"
                                    : request.status === 1
                                    ? "purple"
                                    : request.status === 2
                                    ? "pink"
                                    : request.status === 3
                                    ? "green"
                                    : "brown"
                                }
                              />
                            </div>
                          </td>
                          <td className={`${classes} text-center`}>
                            <div className="flex items-center justify-center gap-2">
                              <IconButton
                                className="items-center"
                                onClick={() => handleOpenModal(request)}
                              >
                                <EyeIcon className="h-5 w-5" />
                              </IconButton>
                              {(request.status === 0 ||
                                request.status === 2) && (
                                <>
                                  <IconButton
                                    className="items-center"
                                    onClick={() => handleEditSKKM(request)}
                                  >
                                    <PencilIcon className="h-5 w-5 text-blue-500" />
                                  </IconButton>
                                  {request.status === 0 && (
                                    <IconButton
                                      className="items-center"
                                      onClick={() =>
                                        openDeleteSKKMDialog(request.skkmId)
                                      }
                                    >
                                      <TrashIcon className="h-5 w-5 text-red-500" />
                                    </IconButton>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={TABLE_HEAD.length}
                        className="p-4 text-center"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          No data available
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
          <div className="flex flex-col items-center justify-between p-4 border-t border-blue-gray-50 bg-gray-100">
            <div className="flex gap-2">
              <Button
                className="p-0"
                variant="text"
                size="sm"
                onClick={openDrawerBottom}
              >
                <FaInfoCircle />
              </Button>
              <span className="font-semibold text-black flex justify-center items-center">
                Total Credit Points =
              </span>
              {"  "}
              <Chip className="bg-blue-600" value={totalPoin.toFixed(1)} />
              <Chip className="bg-green-600" value={validPoints.toFixed(1)} />
              <Chip className="bg-purple-600" value={verifPoints.toFixed(1)} />
              <Chip className="bg-amber-600" value={pendingPoints.toFixed(1)} />
              <Chip className="bg-pink-600" value={unverifPoints.toFixed(1)} />
              <Chip className="bg-brown-600" value={revisedPoints.toFixed(1)} />
              <Chip className="bg-red-600" value={minimalPoints.toFixed(1)} />
            </div>
          </div>
        </>
      ) : (
        <CardBody className="flex justify-center items-center h-64">
          <Typography
            variant="h6"
            color="red"
            className="font-bold text-center"
          >
            Please log in first.
          </Typography>
        </CardBody>
      )}
      <CardFooter className="flex items-center justify-between border-blue-gray-50 p-4">
        <Button
          variant="outlined"
          className="border-purple-500 text-purple-500"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <IconButton
              key={i}
              variant={currentPage === i + 1 ? "outlined" : "text"}
              className="border-purple-500 text-purple-500"
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </IconButton>
          ))}
        </div>
        <Button
          variant="outlined"
          size="sm"
          className="border-purple-500 text-purple-500"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </CardFooter>
      <Dialog
        open={openDeleteDialog}
        handler={closeDeleteSKKMDialog}
        className=""
      >
        <DialogHeader>Are you sure you want to delete this SKKM?</DialogHeader>
        <DialogBody className="text-black">
          This action cannot be undone. The SKKM request will be permanently
          removed from the system.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={closeDeleteSKKMDialog}
            className="mr-1"
            disabled={loadingDelete}
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="purple"
            onClick={handleDeleteSKKM}
            disabled={loadingDelete}
          >
            {loadingDelete ? <Spinner size="sm" /> : <span>Confirm</span>}
          </Button>
        </DialogFooter>
      </Dialog>

      {openQRCodeDialog && (
        <Dialog
          size="sm"
          open={openQRCodeDialog}
          handler={handleCloseQRCodeDialog}
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
                QR Code Generate
              </Typography>
            </CardHeader>
          </DialogHeader>
          <DialogBody>
            <div>
              <Typography
                variant="small"
                className="font-bold"
                color="blue-gray"
              >
                QR Code
              </Typography>
              <div className="flex items-center">
                <Input
                  value={qrCodeValue}
                  disabled
                  className="max-w-md"
                  onClick={(e) => e.target.select()}
                />
                <Button
                  size="md"
                  color="deep-purple"
                  onMouseLeave={() => setCopied(false)}
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2"
                  disabled={!qrCodeValue}
                >
                  {copied ? (
                    <>
                      <FaCheck className="w-8 text-white" />
                      Copied
                    </>
                  ) : (
                    <>
                      <FaRegCopy className="w-8 text-white" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              {qrCodeValue && <QRCode value={qrCodeValue} />}
            </div>
            {hasNewValidCertificate && !isCodeGenerated && (
              <div className="flex justify-center mt-4">
                <Button
                  size="md"
                  color="deep-purple"
                  onClick={handleGenerateCode}
                  className="flex items-center gap-2"
                >
                  Generate Code
                </Button>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              variant="gradient"
              color="red"
              onClick={handleCloseQRCodeDialog}
              className="mr-2"
            >
              Close
            </Button>
            <Button
              variant="gradient"
              color="green"
              onClick={handleSetQRCode}
              disabled={!isCodeGenerated || loadingSetQRCode}
            >
              {loadingSetQRCode ? (
                <span className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  Setting...
                </span>
              ) : (
                "Set QR Code"
              )}
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {selectedRequest && (
        <Dialog
          size="lg"
          open={openModal}
          handler={closeDialog}
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
            <div className="grid grid-cols-2 gap-4">
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
                <Textarea
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
                <Textarea
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
                  // Updated to show only the hash part
                  disabled
                  size="lg"
                />
              </div>
            </div>
            <div className="flex justify-center items-center mt-4">
              <div className="text-center">
                {selectedRequest.ipfsHash && (
                  <div className="mb-4 flex justify-center">
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
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="flex justify-end">
            <Button
              variant="gradient"
              color="red"
              onClick={handleCloseModal}
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

      <Drawer
        placement="bottom"
        open={openBottom}
        dismiss={{ enabled: false }}
        onClose={closeDrawerBottom}
        className="h-3/4 bg-white shadow-none"
        overlayProps={{ className: "bg-transparent" }}
      >
        <div className="flex flex-col h-full p-4">
          <div className="mb-6 flex items-center justify-between">
            <Typography variant="h5" color="blue-gray">
              Keterangan
            </Typography>
            <IconButton
              variant="text"
              color="purple"
              onClick={closeDrawerBottom}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </IconButton>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-row gap-4">
              <div className="w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    ?
                  </div>
                  <Typography color="gray" className="font-normal">
                    Indikator ini menyatakan total angka kredit poin yang sudah
                    di submit.
                  </Typography>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center text-white">
                    ?
                  </div>
                  <Typography color="gray" className="font-normal">
                    Indikator ini menyatakan jumlah angka kredit poin yang sudah
                    divalidasi.
                  </Typography>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    ?
                  </div>
                  <Typography color="gray" className="font-normal">
                    Indikator ini menyatakan jumlah angka kredit poin yang sudah
                    diverified.
                  </Typography>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-amber-600 flex items-center justify-center text-white">
                    ?
                  </div>
                  <Typography color="gray" className="font-normal">
                    Indikator ini menyatakan jumlah angka kredit yang masih
                    pending.
                  </Typography>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-pink-600 flex items-center justify-center text-white">
                    ?
                  </div>
                  <Typography color="gray" className="font-normal">
                    Indikator ini menyatakan jumlah angka kredit yang tidak
                    lolos verified.
                  </Typography>
                </div>
              </div>
              <div className="w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-brown-600 flex items-center justify-center text-white">
                    ?
                  </div>
                  <Typography color="gray" className="font-normal">
                    Indikator ini menyatakan jumlah angka kredit yang sudah di
                    revised.
                  </Typography>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center text-white">
                    ?
                  </div>
                  <Typography color="gray" className="font-normal">
                    Indikator ini menyatakan jumlah angka kredit minimal yang
                    belum dicapai.
                  </Typography>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <Typography color="gray" className="font-normal">
                    Indikator ini artinya kegiatan tersebut diakui di SKPI.
                  </Typography>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MinusIcon className="h-5 w-5 text-red-500" />
                  <Typography color="gray" className="font-normal">
                    Indikator ini artinya kegiatan tersebut tidak diakui di
                    SKPI.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </Card>
  );
};

export default DetailSKKM;
