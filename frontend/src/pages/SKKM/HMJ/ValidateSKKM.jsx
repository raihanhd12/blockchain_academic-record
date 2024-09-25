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
  Textarea,
} from "@material-tailwind/react";
import { FaEye } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { BigNumber } from "ethers"; // Import BigNumber dari Ethers.js
import { activityData } from "@constants"; // Adjust the path as needed
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const ValidateSKKM = () => {
  const [skkmRequests, setSkkmRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hmjData, setHmjData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const hmjAddress = useAddress();
  const { contract } = useContract(contractAddress, abi);
  const [isValidating, setIsValidating] = useState(false);
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
          const requests = await contract.call("getSKKMNotValidatedByHMJ");
          const requestsWithStudentData = await Promise.all(
            requests.map(async (request) => {
              const studentData = await fetchStudentData(request.student);
              return { ...request, studentData };
            })
          );
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

  const handleValidateSKKM = async () => {
    setIsValidating(true);
    const startTime = Date.now(); // Mulai timer
    try {
      if (contract && selectedRequest) {
        await contract.call("validateSKKM", [
          selectedRequest.skkmId,
          formData.activityCategory,
          formData.activityType,
          formData.achievement,
          formData.assessmentBasis,
          BigNumber.from(String(formData.creditPoin * 10 ** 18)), // Mengonversi creditPoin ke BigNumber dengan basis 10^18
        ]);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Hentikan timer dan hitung durasi
        const successMsg = `Successfully validated SKKM with unique code: ${selectedRequest.skkmId} in ${duration} seconds`;
        setSuccessMessage(successMsg);
        setDialogOpen(false); // Tutup dialog sebelum menampilkan toast
        toast.success(successMsg);
        setTimeout(() => {
          setSuccessMessage("");
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error(`Error validating SKKM:`, error);
      setDialogOpen(false); // Tutup dialog sebelum menampilkan toast
      toast.error(`Error validating SKKM.`);
    } finally {
      setIsValidating(false);
    }
  };

  const openDialog = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
    setFormData({
      activityCategory: request.activityCategory,
      activityType: request.activityType,
      achievement: request.achievement,
      assessmentBasis: request.assessmentBasis,
      creditPoin: request.creditPoin / 10 ** 18, // Convert to normal number
    });
  };

  const closeDialog = () => {
    if (!isValidating) {
      setDialogOpen(false);
      setSelectedRequest(null);
    }
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
    if (selectedRequest && selectedRequest.status === "Revised") {
      setRevisedMessage(selectedRequest.unverifiedMessage);
    } else {
      setRevisedMessage("");
    }
  }, [selectedRequest]);

  const [formData, setFormData] = useState({
    activityCategory: "",
    activityType: "",
    achievement: "",
    assessmentBasis: "",
    creditPoin: 0,
  });

  const handleSelectChange = (selectedOption, { name }) => {
    if (name === "activityCategory") {
      setFormData((prevData) => ({
        ...prevData,
        activityCategory: selectedOption ? selectedOption.value : "",
        activityType: "",
        achievement: "",
        assessmentBasis: "",
        creditPoin: 0,
      }));
    } else if (name === "activityType") {
      setFormData((prevData) => ({
        ...prevData,
        activityType: selectedOption ? selectedOption.value : "",
        achievement: "",
        assessmentBasis: "",
        creditPoin: 0,
      }));
    } else if (name === "achievement") {
      const creditPoin = getCreditPoin(
        formData.activityCategory,
        formData.activityType,
        selectedOption ? selectedOption.value : ""
      );
      setFormData((prevData) => ({
        ...prevData,
        achievement: selectedOption ? selectedOption.value : "",
        assessmentBasis: "",
        creditPoin,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: selectedOption ? selectedOption.value : "",
      }));
    }
  };

  const getCreditPoin = (category, level, achievement) => {
    const categoryData =
      activityData.KEGIATAN_WAJIB.find((cat) => cat.category === category) ||
      activityData.KEGIATAN_PILIHAN.find((cat) => cat.category === category);
    if (!categoryData) return 0;

    const levelData = categoryData.levels.find((lvl) => lvl.level === level);
    if (!levelData) return 0;

    const achievementData = levelData.achievements.find(
      (ach) => ach.achievement === achievement
    );
    return achievementData ? achievementData.credit : 0;
  };

  const getFilteredActivityTypes = () => {
    const category = formData.activityCategory;
    const categoryData =
      activityData.KEGIATAN_WAJIB.find((cat) => cat.category === category) ||
      activityData.KEGIATAN_PILIHAN.find((cat) => cat.category === category);

    if (!categoryData) return [];

    return categoryData.levels || [];
  };

  const getFilteredAchievements = () => {
    const category = formData.activityCategory;
    const categoryData =
      activityData.KEGIATAN_WAJIB.find((cat) => cat.category === category) ||
      activityData.KEGIATAN_PILIHAN.find((cat) => cat.category === category);

    if (!categoryData) return [];

    const level = formData.activityType;
    const levelData = categoryData.levels.find((lvl) => lvl.level === level);
    return levelData ? levelData.achievements : [];
  };

  const getFilteredAssessmentBasis = () => {
    const category = formData.activityCategory;
    const categoryData =
      activityData.KEGIATAN_WAJIB.find((cat) => cat.category === category) ||
      activityData.KEGIATAN_PILIHAN.find((cat) => cat.category === category);

    if (!categoryData) return [];

    const level = formData.activityType;
    const levelData = categoryData.levels.find((lvl) => lvl.level === level);
    const achievementData = levelData?.achievements.find(
      (ach) => ach.achievement === formData.achievement
    );
    return achievementData ? achievementData.assessmentBasis : [];
  };

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
            Activity Credit Validate
          </Typography>
          <Typography color="white" className="mt-1 text-sm text-center p-2">
            These are menu for Validate Activity Credit Student From{" "}
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
                        {request.studentData.identifier || "N/A"}{" "}
                        {/* Student Identifier */}
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
                SKKM Details
              </Typography>
            </CardHeader>
          </DialogHeader>
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
                <Select
                  name="activityCategory"
                  value={
                    formData.activityCategory
                      ? {
                          value: formData.activityCategory,
                          label: formData.activityCategory,
                        }
                      : null
                  }
                  onChange={(selectedOption, actionMeta) =>
                    handleSelectChange(selectedOption, actionMeta)
                  }
                  options={Object.values(activityData)
                    .flat()
                    .map((category) => ({
                      value: category.category,
                      label: category.category,
                    }))}
                  className="rounded border border-red-600 text-black "
                  placeholder="Pilih Kategori"
                  isClearable
                  autoFocus={false} // Menambahkan autoFocus false
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Activity Type
                </Typography>
                <Select
                  name="activityType"
                  value={
                    formData.activityType
                      ? {
                          value: formData.activityType,
                          label: formData.activityType,
                        }
                      : null
                  }
                  onChange={(selectedOption, actionMeta) =>
                    handleSelectChange(selectedOption, actionMeta)
                  }
                  options={getFilteredActivityTypes().map((type) => ({
                    value: type.level,
                    label: type.level,
                  }))}
                  className="rounded border border-red-600 text-black "
                  placeholder="Pilih Kategori dahulu"
                  isDisabled={!formData.activityCategory}
                  isClearable
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Achievement
                </Typography>
                <Select
                  name="achievement"
                  value={
                    formData.achievement
                      ? {
                          value: formData.achievement,
                          label: formData.achievement,
                        }
                      : null
                  }
                  onChange={(selectedOption, actionMeta) =>
                    handleSelectChange(selectedOption, actionMeta)
                  }
                  options={getFilteredAchievements().map((achievement) => ({
                    value: achievement.achievement,
                    label: achievement.achievement,
                  }))}
                  className="rounded border border-red-600 text-black "
                  placeholder="Pilih Tingkat Kegiatan dahulu"
                  isClearable
                  isDisabled={
                    !formData.activityCategory || !formData.activityType
                  }
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Assessment Basis
                </Typography>
                <Select
                  name="assessmentBasis"
                  value={
                    formData.assessmentBasis
                      ? {
                          value: formData.assessmentBasis,
                          label: formData.assessmentBasis,
                        }
                      : null
                  }
                  onChange={(selectedOption, actionMeta) =>
                    handleSelectChange(selectedOption, actionMeta)
                  }
                  options={getFilteredAssessmentBasis().map((basis) => ({
                    value: basis,
                    label: basis,
                  }))}
                  className="rounded border border-red-600 text-black "
                  placeholder="Pilih Assessment Basis"
                  isClearable
                  isDisabled={!formData.achievement}
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Credit Poin
                </Typography>
                <Input
                  label="Credit Poin"
                  type="number"
                  value={formData.creditPoin}
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
              {selectedRequest.status === "Revised" && (
                <div className="col-span-3">
                  <Typography className="mb-2" color="red" variant="h6">
                    Unverified Message
                  </Typography>
                  <Textarea
                    label="Unverified Message"
                    value={revisedMessage || "N/A"}
                    disabled
                    size="lg"
                  />
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
              disabled={isValidating} // Disable button while validating
            >
              <span>Close</span>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="gradient"
                color="deep-purple"
                onClick={handleValidateSKKM}
                disabled={isValidating} // Disable button while validating
              >
                <span>{isValidating ? "Loading..." : "Validate SKKM"}</span>
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
    </div>
  );
};

export default ValidateSKKM;
