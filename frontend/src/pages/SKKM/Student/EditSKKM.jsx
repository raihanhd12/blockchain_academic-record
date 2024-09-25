import React, { useState, useRef, useEffect } from "react";
import Modal from "react-modal";
import Select from "react-select";
import { Web3Button, darkTheme, useStorageUpload } from "@thirdweb-dev/react";
import { useParams, useNavigate } from "react-router-dom";
import { useAddress } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";
import { ethers } from "ethers";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Typography,
  Radio,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import translate from "translate";
import { activityData } from "@constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const EditSKKM = () => {
  const { uniqueCode } = useParams();
  const address = useAddress();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [formData, setFormData] = useState({
    activityNameID: "",
    activityNameEN: "",
    certificateNumber: "",
    activityCategory: "",
    activityType: "",
    achievement: "",
    assessmentBasis: "",
    ipfsHash: "",
    creditPoin: "",
  });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
  const { mutateAsync: upload } = useStorageUpload();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (address && uniqueCode) {
      fetchRequestData();
    }
  }, [address, uniqueCode]);

  useEffect(() => {
    const translateActivityName = async () => {
      if (formData.activityNameID) {
        try {
          const translatedText = await translate(formData.activityNameID, {
            from: "id",
            to: "en",
          });
          setFormData((prevData) => ({
            ...prevData,
            activityNameEN: translatedText,
          }));
        } catch (error) {
          console.error("Error translating activity name:", error);
        }
      }
    };

    translateActivityName();
  }, [formData.activityNameID]);

  const fetchRequestData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const skkmRequests = await contract.getSKKMByStudent(address);
      const request = skkmRequests.find(
        (req) => req.skkmId.toString() === uniqueCode
      );

      if (!request) {
        throw new Error("Request not found");
      }

      setRequest(request);
      setFormData({
        activityNameID: request.activityNameID,
        activityNameEN: request.activityNameEN,
        certificateNumber: request.certificateNumber,
        activityCategory: request.activityCategory,
        activityType: request.activityType,
        achievement: request.achievement,
        assessmentBasis: request.assessmentBasis,
        ipfsHash: request.ipfsHash,
        creditPoin: ethers.utils.formatUnits(request.creditPoin, 18),
      });
      setFilePreview(
        `https://${
          import.meta.env.VITE_CLIENT_ID
        }.ipfscdn.io/ipfs/${request.ipfsHash.replace(/^ipfs:\/\//, "")}`
      );
    } catch (error) {
      console.error("Error fetching request data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      ...(name === "activityNameID" && value === ""
        ? { activityNameEN: "" }
        : {}),
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

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
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
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

  const handleFileChange = (e) => {
    const chosenFile = e.target.files[0];
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/bmp",
      "image/gif",
      "application/pdf",
    ];
    if (chosenFile && allowedTypes.includes(chosenFile.type)) {
      setFile(chosenFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(chosenFile);
    } else {
      toast.error(
        "Invalid file type. Only JPG, JPEG, PNG, BMP, GIF, and PDF files are allowed."
      );
      setFile(null);
      setFilePreview(null);
    }
  };

  const handleClearImage = () => {
    setFile(null);
    setFilePreview(
      `https://${
        import.meta.env.VITE_CLIENT_ID
      }.ipfscdn.io/ipfs/${request.ipfsHash.replace(/^ipfs:\/\//, "")}`
    );
  };

  const handleClearRadio = () => {
    setFormData((prevData) => ({
      ...prevData,
      assessmentBasis: "",
    }));
  };

  const handleSuccess = (duration) => {
    toast.success(`SKKM edited successfully in ${duration} seconds!`, {
      onClose: () => {
        navigate("/skkm/detail-skkm");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
    });
  };

  const handleError = (error) => {
    console.error("Error submitting SKKM:", error);
    const errorMessage =
      error?.reason || error?.message || "An unknown error occurred";
    toast.error(errorMessage);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.activityNameID)
      newErrors.activityNameID = "This field is required";
    if (!formData.activityNameEN)
      newErrors.activityNameEN = "This field is required";
    if (!formData.certificateNumber)
      newErrors.certificateNumber = "This field is required";
    if (!formData.activityCategory)
      newErrors.activityCategory = "This field is required";
    if (!formData.activityType)
      newErrors.activityType = "This field is required";
    if (!formData.achievement) newErrors.achievement = "This field is required";
    if (!formData.assessmentBasis)
      newErrors.assessmentBasis = "This field is required";
    if (!formData.creditPoin || isNaN(formData.creditPoin)) {
      newErrors.creditPoin = "Credit point is invalid or missing";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (contract) => {
    if (!validateForm()) return;

    const startTime = Date.now(); // Start timer

    if (file) {
      try {
        const [ipfsUri] = await upload({ data: [file] });
        formData.ipfsHash = ipfsUri;
      } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        toast.error("Error uploading file to IPFS");
        return;
      }
    }

    try {
      await contract.editSKKM(
        parseInt(uniqueCode),
        formData.activityNameID,
        formData.activityNameEN,
        formData.certificateNumber,
        formData.activityCategory,
        formData.activityType,
        formData.achievement,
        formData.assessmentBasis,
        formData.ipfsHash,
        ethers.utils.parseUnits(formData.creditPoin.toString(), 18)
      );
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Stop timer and calculate duration
      handleSuccess(duration);
    } catch (error) {
      handleError(error);
    }
  };

  const renderFilePreview = () => {
    if (!filePreview) {
      return (
        <Typography variant="small" color="blue-gray">
          No file selected
        </Typography>
      );
    }

    if (
      filePreview.includes("data:application/pdf") ||
      filePreview.includes(".pdf")
    ) {
      return (
        <div
          className="w-full overflow-y-auto"
          onClick={() => setIsZoomDialogOpen(true)}
          style={{
            maxHeight: "400px",
            maxWidth: "50%",
            border: "1px solid #ccc",
          }}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer fileUrl={filePreview} />
          </Worker>
        </div>
      );
    }

    return (
      <img
        src={filePreview}
        alt="File Preview"
        className="rounded max-h-64 cursor-pointer"
        onClick={() => setIsZoomDialogOpen(true)}
      />
    );
  };

  const handleZoomDialogClose = () => {
    setIsZoomDialogOpen(false);
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
          Edit SKKM
        </Typography>
        <Typography color="white" className="mt-1 text-sm text-center p-2">
          Modify the details of your SKKM request.
        </Typography>
      </CardHeader>
      <CardBody className="overflow-auto px-4 py-6 bg-white max-h-[630px]">
        <form className="space-y-6">
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Nama Kegiatan (BHS.INDONESIA)
            </Typography>
            <Input
              color="purple"
              type="text"
              name="activityNameID"
              value={formData.activityNameID}
              onChange={handleChange}
              placeholder="Enter activity name ID"
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {errors.activityNameID && (
              <Typography color="red" variant="small">
                {errors.activityNameID}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Nama Kegiatan (ENGLISH)
            </Typography>
            <Input
              color="purple"
              type="text"
              name="activityNameEN"
              value={formData.activityNameEN}
              onChange={handleChange}
              placeholder="Enter activity name EN"
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {errors.activityNameEN && (
              <Typography color="red" variant="small">
                {errors.activityNameEN}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              No. Sertifikat/SK/ST
            </Typography>
            <Input
              color="purple"
              type="text"
              name="certificateNumber"
              value={formData.certificateNumber}
              onChange={handleChange}
              placeholder="Enter no sertif"
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {errors.certificateNumber && (
              <Typography color="red" variant="small">
                {errors.certificateNumber}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Kategori Kegiatan
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
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="Pilih Kategori"
              isClearable
            />
            {errors.activityCategory && (
              <Typography color="red" variant="small">
                {errors.activityCategory}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Tingkat Kegiatan
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
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="Pilih Kategori dahulu"
              isDisabled={!formData.activityCategory}
              isClearable
            />
            {errors.activityType && (
              <Typography color="red" variant="small">
                {errors.activityType}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Jabatan/Prestasi Kegiatan
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
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="Pilih Tingkat Kegiatan dahulu"
              isClearable
              isDisabled={!formData.activityCategory || !formData.activityType}
            />
            {errors.achievement && (
              <Typography color="red" variant="small">
                {errors.achievement}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Dasar Penilaian
            </Typography>
            <div className="flex flex-row items-center gap-4">
              {formData.achievement ? (
                getFilteredAssessmentBasis().map((basis) => (
                  <label
                    key={basis}
                    className={`flex items-center ${
                      formData.assessmentBasis === basis
                        ? "text-purple-600"
                        : "text-gray-700"
                    }`}
                  >
                    <Radio
                      name="assessmentBasis"
                      value={basis}
                      checked={formData.assessmentBasis === basis}
                      onChange={handleChange}
                      color="purple"
                      label={basis}
                      className="transition duration-150 ease-in-out"
                    />
                  </label>
                ))
              ) : (
                <Typography color="red" variant="small">
                  Pilih Jabatan/Prestasi Kegiatan terlebih dahulu
                </Typography>
              )}
              {formData.assessmentBasis && (
                <Button
                  variant="outlined"
                  color="red"
                  className="ml-auto"
                  onClick={handleClearRadio}
                >
                  Clear Selection
                </Button>
              )}
            </div>
            {errors.assessmentBasis && (
              <Typography color="red" variant="small">
                {errors.assessmentBasis}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              IPFS Hash{" "}
              <span className="text-red-500 text-xs font-normal">
                (JPG|JPEG|PNG|BMP|GIF|PDF)
              </span>
            </Typography>
            <div className="flex items-center gap-2">
              <Input
                color="purple"
                type="text"
                name="ipfsHash"
                value={formData.ipfsHash}
                onChange={handleChange}
                placeholder="IPFS Hash"
                className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                disabled
              />
              <Button
                variant="gradient"
                component="label"
                className="flex items-center gap-3"
                onClick={() => fileInputRef.current.click()}
                color="purple"
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
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
                Unggah Sertifikat
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              File Preview
            </Typography>
            <div
              className="border rounded p-2 flex flex-col justify-center items-center"
              style={{
                minHeight: "150px",
                borderStyle: "dashed",
                borderColor: "#cccccc",
              }}
            >
              {renderFilePreview()}
              {file && (
                <Button
                  variant="outlined"
                  className="mt-4"
                  color="red"
                  onClick={handleClearImage}
                >
                  Clear File
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardBody>
      <CardFooter className="flex items-center justify-between border-blue-gray-50 p-4">
        <Button
          variant="gradient"
          color="red"
          onClick={() => navigate("/skkm/detail-skkm")}
        >
          Cancel
        </Button>
        <Button
          variant="gradient"
          color="purple"
          onClick={async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
              import.meta.env.VITE_CONTRACT_ADDRESS,
              abi,
              signer
            );
            await handleSubmit(contract);
          }}
        >
          Save Changes
        </Button>
      </CardFooter>
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
            <Viewer fileUrl={filePreview} />
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
    </Card>
  );
};

export default EditSKKM;
