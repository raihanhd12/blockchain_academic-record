import React, { useEffect, useState } from "react";
import { useAddress, useContract, MediaRenderer } from "@thirdweb-dev/react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
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
  Chip,
  Textarea,
  Checkbox,
} from "@material-tailwind/react";
import { FaEye } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const VerifySKKM = () => {
  const [skkmRequests, setSkkmRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hmjData, setHmjData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [unverifyDialogOpen, setUnverifyDialogOpen] = useState(false);
  const [unverifyMessage, setUnverifyMessage] = useState("");
  const [checkedFields, setCheckedFields] = useState({});
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const hmjAddress = useAddress();
  const { contract } = useContract(contractAddress, abi);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmittingUnverify, setIsSubmittingUnverify] = useState(false);
  const totalPages = Math.ceil(skkmRequests.length / itemsPerPage);
  const paginatedRequests = skkmRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [revisedMessage, setRevisedMessage] = useState("");

  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);

  const handleZoomDialogOpen = () => setIsZoomDialogOpen(true);
  const handleZoomDialogClose = () => setIsZoomDialogOpen(false);

  const fetchStudentData = async (studentAddress) => {
    try {
      const data = await contract.call("users", [studentAddress]);
      return data;
    } catch (error) {
      console.error("Error fetching student data:", error);
      return null;
    }
  };

  const fetchHMJData = async () => {
    try {
      const data = await contract.call("users", [hmjAddress]);
      setHmjData(data);
    } catch (error) {
      console.error("Error fetching HMJ data:", error);
    }
  };

  useEffect(() => {
    const fetchSKKMRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        if (contract && hmjData) {
          const requests = await contract.call("getSKKMNotVerifiedByHMJ");
          const requestsWithStudentData = await Promise.all(
            requests.map(async (request) => {
              const studentData = await fetchStudentData(request.student);
              return { ...request, studentData };
            })
          );
          // Filter requests based on department matching
          const filteredRequests = requestsWithStudentData.filter(
            (request) =>
              request.studentData &&
              hmjData &&
              request.studentData.department === hmjData.department
          );

          setSkkmRequests(filteredRequests);
        }
      } catch (error) {
        console.error("Error fetching SKKM requests:", error);
        setError("Error fetching SKKM requests.");
      }
      setLoading(false);
    };

    if (hmjData) {
      fetchSKKMRequests();
    }
  }, [contract, hmjAddress, hmjData]);

  useEffect(() => {
    fetchHMJData();
  }, [contract, hmjAddress]);

  const handleVerifySKKM = async (uniqueCode, isVerified, message = "") => {
    setIsVerifying(true);
    const startTime = Date.now(); // Start timer
    try {
      if (contract) {
        await contract.call("verifySKKM", [uniqueCode, isVerified, message]);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Stop timer and calculate duration
        const successMsg = isVerified
          ? `Successfully verified SKKM with unique code: ${uniqueCode} in ${duration} seconds`
          : `Successfully unverified SKKM with unique code: ${uniqueCode} in ${duration} seconds`;
        closeDialog();
        setSuccessMessage(successMsg);
        toast.success(successMsg);
        setTimeout(() => {
          setSuccessMessage("");
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error(
        `Error ${isVerified ? "verifying" : "unverifying"} SKKM:`,
        error
      );
      toast.error(`Error ${isVerified ? "verifying" : "unverifying"} SKKM.`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckboxChange = (field) => {
    setCheckedFields((prev) => {
      const newCheckedFields = { ...prev, [field]: !prev[field] };

      let updatedMessage = "";
      let count = 0;

      Object.keys(newCheckedFields).forEach((key) => {
        if (newCheckedFields[key]) {
          count++;
          const fieldMessage = `${count}. <strong style="color:red;">${key}:</strong><br>-<br><br>`;
          updatedMessage += fieldMessage;
        }
      });

      setUnverifyMessage(updatedMessage);

      return newCheckedFields;
    });
  };

  const handleSubmitUnverify = async () => {
    setIsSubmittingUnverify(true);
    if (selectedRequest) {
      await handleVerifySKKM(selectedRequest.skkmId, false, unverifyMessage);
      closeUnverifyDialog();
      closeDialog(); // Menutup dialog utama setelah unverify
    }
    setIsSubmittingUnverify(false);
  };

  const openDialog = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!isVerifying) {
      setDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const openUnverifyDialog = (request) => {
    setSelectedRequest(request);
    setUnverifyDialogOpen(true);
  };

  const closeUnverifyDialog = () => {
    setUnverifyDialogOpen(false);
    setDialogOpen(true); // Membuka kembali dialog utama
    setCheckedFields({});
    setUnverifyMessage("");
  };

  const openMessageDialog = () => {
    setMessageDialogOpen(true);
  };

  const closeMessageDialog = () => {
    setMessageDialogOpen(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const truncateText = (text, maxWords) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + " ...";
    }
    return text;
  };

  useEffect(() => {
    if (selectedRequest && selectedRequest.status === 4) {
      setRevisedMessage(selectedRequest.unverifiedMessage);
    } else {
      setRevisedMessage("");
    }
  }, [selectedRequest]);

  return (
    <div>
      <ToastContainer />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Card className="h-full w-full bg-white shadow-lg rounded-lg">
        <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
          <Typography
            variant="h4"
            color="white"
            className="font-bold text-center p-2"
          >
            Activity Credit Verify
          </Typography>
          <Typography color="white" className="mt-1 text-sm text-center p-2">
            These are menu for Verify Activity Credit Student From :{" "}
            <span className="font-extrabold">
              {hmjData ? hmjData.department : "Loading..."}
            </span>
          </Typography>
          <Typography
            color="white"
            className="mt-1 text-sm text-center p-2 font-extrabold"
          >
            Name :{" "}
            <span className="font-medium">
              {hmjData ? hmjData.name : "Loading..."}
            </span>
            {" | "}
            NIM :{" "}
            <span className="font-medium">
              {hmjData ? hmjData.identifier : "Loading..."}
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
                    Unique Code
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
                    Student/Identifier/Address
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
                    Activity Name ID/Certificate Number/Activity Type
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
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request, index) => (
                  <tr key={index}>
                    <td className="p-4 border-b border-black border-r bg-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.skkmId.toString()}
                      </Typography>
                    </td>
                    <td className="p-4 border-b border-black border-r ">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.studentData.name || "N/A"}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.studentData.identifier || "N/A"}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.student || "N/A"}
                      </Typography>
                    </td>
                    <td className="p-4 border-b border-black border-r bg-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {truncateText(request.activityNameID, 10) || "N/A"}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.certificateNumber || "N/A"}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.activityType || "N/A"}
                      </Typography>
                    </td>
                    <td className="p-4 border-b border-black text-center">
                      <IconButton
                        ripple={true}
                        onClick={() => openDialog(request)}
                      >
                        <FaEye className="text-purple-400" />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center">
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

      {selectedRequest && (
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
                Activity Credit Details
              </Typography>
            </CardHeader>
          </DialogHeader>
          <div className="flex justify-end pr-5">
            {selectedRequest.status === 4 ? (
              <Chip color="brown" value="Revised" />
            ) : (
              <Chip color="amber" value="Pending" />
            )}
          </div>
          <DialogBody>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Student Name
                </Typography>
                <Input
                  label="Student"
                  value={selectedRequest.studentData.name || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Student Identifier
                </Typography>
                <Input
                  label="Identifier"
                  value={selectedRequest.studentData.identifier || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Address
                </Typography>
                <Input
                  label="Address"
                  value={selectedRequest.student || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Activity Name ID
                </Typography>
                <Textarea
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
                <Textarea
                  label="Activity Name EN"
                  value={selectedRequest.activityNameEN || "N/A"}
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
                  disabled
                  size="lg"
                />
              </div>
              {selectedRequest.status === 4 && (
                <div>
                  <Typography className="mb-2" color="deep-purple" variant="h6">
                    Unverified Message
                  </Typography>
                  <Button
                    variant="outlined"
                    color="brown"
                    fullWidth="true"
                    onClick={openMessageDialog}
                  >
                    See Message
                  </Button>
                  <Dialog
                    size="sm"
                    open={messageDialogOpen}
                    handler={closeMessageDialog}
                  >
                    <DialogHeader className="justify-center text-deep-purple-900">
                      <CardHeader className="rounded-3 bg-dark-sidebar mb-2 border-brown-400 border-4">
                        <Typography
                          variant="h4"
                          color="white"
                          className="font-bold text-center p-5"
                        >
                          Unverified Message
                        </Typography>
                      </CardHeader>
                    </DialogHeader>
                    <DialogBody>
                      <div
                        className="text-lg text-deep-purple"
                        dangerouslySetInnerHTML={{ __html: revisedMessage }}
                      />
                    </DialogBody>
                    <DialogFooter className="pt-0 flex justify-center">
                      <Button
                        variant="outlined"
                        color="red"
                        onClick={closeMessageDialog}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </Dialog>
                </div>
              )}
            </div>
            <div className="flex justify-center items-center mt-4">
              <div className="text-center">
                {selectedRequest.ipfsHash && (
                  <div className="mb-4 flex justify-center ">
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
          <DialogFooter className="flex justify-between">
            <Button
              variant="outlined"
              color="red"
              onClick={closeDialog}
              className="mr-1"
              disabled={isVerifying}
            >
              <span>Close</span>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="gradient"
                color="red"
                onClick={() => openUnverifyDialog(selectedRequest)}
                disabled={isVerifying}
              >
                <span>{isVerifying ? "Loading..." : "Unverify SKKM"}</span>
              </Button>
              <Button
                variant="gradient"
                color="deep-purple"
                onClick={() => {
                  handleVerifySKKM(selectedRequest.skkmId, true);
                }}
                disabled={isVerifying}
              >
                <span>{isVerifying ? "Loading..." : "Verify SKKM"}</span>
              </Button>
            </div>
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

      {selectedRequest && (
        <Dialog
          size="lg"
          open={unverifyDialogOpen}
          dismiss={{ enabled: false }}
          handler={closeUnverifyDialog}
        >
          <DialogHeader className="justify-center text-deep-purple-900">
            <CardHeader className="rounded-3 bg-dark-sidebar mb-2 border-red-400 border-4">
              <Typography
                variant="h4"
                color="white"
                className="font-bold text-center p-5"
              >
                Unverify SKKM
              </Typography>
            </CardHeader>
          </DialogHeader>
          <DialogBody>
            <Typography
              className="mb-3 font-bold"
              color="deep-purple"
              variant="h6"
            >
              Select the fields that need to be revised{" "}
              <span className="text-red-500 underline">before</span> enter a
              message.
            </Typography>
            <div className="grid grid-cols-2 gap-2">
              <Checkbox
                color="blue"
                label={
                  <Typography color="blue-gray" className="flex font-medium">
                    Activity Name ID
                  </Typography>
                }
                checked={checkedFields["Activity Name ID"] || false}
                onChange={() => handleCheckboxChange("Activity Name ID")}
              />
              <Checkbox
                color="red"
                label={
                  <Typography color="blue-gray" className="flex font-medium">
                    Activity Name EN
                  </Typography>
                }
                checked={checkedFields["Activity Name EN"] || false}
                onChange={() => handleCheckboxChange("Activity Name EN")}
              />
              <Checkbox
                color="green"
                label={
                  <Typography color="blue-gray" className="flex font-medium">
                    Activity Category
                  </Typography>
                }
                checked={checkedFields["Activity Category"] || false}
                onChange={() => handleCheckboxChange("Activity Category")}
              />
              <Checkbox
                color="amber"
                label={
                  <Typography color="blue-gray" className="flex font-medium">
                    Certificate Number
                  </Typography>
                }
                checked={checkedFields["Certificate Number"] || false}
                onChange={() => handleCheckboxChange("Certificate Number")}
              />
              <Checkbox
                color="teal"
                label={
                  <Typography color="blue-gray" className="flex font-medium">
                    Activity Type
                  </Typography>
                }
                checked={checkedFields["Activity Type"] || false}
                onChange={() => handleCheckboxChange("Activity Type")}
              />
              <Checkbox
                color="indigo"
                label={
                  <Typography color="blue-gray" className="flex font-medium">
                    Achievement
                  </Typography>
                }
                checked={checkedFields["Achievement"] || false}
                onChange={() => handleCheckboxChange("Achievement")}
              />
              <Checkbox
                color="purple"
                label={
                  <Typography color="blue-gray" className="flex font-medium">
                    Assessment Basis
                  </Typography>
                }
                checked={checkedFields["Assessment Basis"] || false}
                onChange={() => handleCheckboxChange("Assessment Basis")}
              />
              <Checkbox
                color="blue"
                label={
                  <Typography color="blue-gray" className="flex font-medium">
                    IPFS Hash
                  </Typography>
                }
                checked={checkedFields["IPFS Hash"] || false}
                onChange={() => handleCheckboxChange("IPFS Hash")}
              />
            </div>
            <ReactQuill
              value={unverifyMessage}
              onChange={setUnverifyMessage}
              modules={{
                toolbar: [
                  [{ header: "1" }, { header: "2" }, { font: [] }],
                  [{ size: [] }],
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                  ],
                  [{ color: [] }, { background: [] }],
                  ["link", "image", "video"],
                  ["clean"],
                ],
              }}
              formats={[
                "header",
                "font",
                "size",
                "bold",
                "italic",
                "underline",
                "strike",
                "blockquote",
                "list",
                "bullet",
                "indent",
                "link",
                "image",
                "video",
                "color",
                "background",
              ]}
              style={{ width: "100%", color: "black" }}
              theme="snow"
            />
          </DialogBody>
          <DialogFooter className="pt-0 flex justify-between">
            <Button
              variant="outlined"
              color="red"
              onClick={closeUnverifyDialog}
              className="mr-1"
              disabled={isSubmittingUnverify}
            >
              <span>Close</span>
            </Button>
            <Button
              variant="gradient"
              color="purple"
              onClick={handleSubmitUnverify}
              disabled={isSubmittingUnverify}
            >
              <span>{isSubmittingUnverify ? "Loading..." : "Submit"}</span>
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};

export default VerifySKKM;
