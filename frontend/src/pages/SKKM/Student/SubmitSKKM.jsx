import React, { useState, useRef, useEffect } from "react";
import Modal from "react-modal";
import Select from "react-select";
import { Web3Button, darkTheme, useStorageUpload } from "@thirdweb-dev/react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Radio,
} from "@material-tailwind/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import translate from "translate";
import { BigNumber } from "ethers";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import abi from "@abis/SKKM.json";
import { activityData } from "@constants";

const SubmitSKKM = () => {
  const [formData, setFormData] = useState({
    activityNameID: "",
    activityNameEN: "",
    certificateNumber: "",
    activityCategory: "",
    activityType: "",
    achievement: "",
    assessmentBasis: "",
    ipfsHash: "",
    uniqueCode: "",
  });

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

  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: upload } = useStorageUpload();
  const fileInputRef = useRef(null);
  const [contract, setContract] = useState(null);
  const [existingCertificates, setExistingCertificates] = useState([]);

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

  useEffect(() => {
    const fetchExistingCertificates = async () => {
      if (contract) {
        try {
          const studentAddress = await contract.signer.getAddress();
          const skkmRequests = await contract.getSKKMByStudent(studentAddress);
          const certificateNumbers = skkmRequests.map(
            (request) => request.certificateNumber
          );
          setExistingCertificates(certificateNumbers);
        } catch (error) {
          console.error("Error fetching existing certificates:", error);
        }
      }
    };

    fetchExistingCertificates();
  }, [contract]);

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
        creditPoin: 0, // Reset creditPoin when category changes
      }));
    } else if (name === "activityType") {
      setFormData((prevData) => ({
        ...prevData,
        activityType: selectedOption ? selectedOption.value : "",
        achievement: "",
        assessmentBasis: "",
        creditPoin: 0, // Reset creditPoin when activity type changes
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
        creditPoin, // Set creditPoin berdasarkan pilihan
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
        "Invalid file type. Only JPG, JPEG, PNG, BMP, GIF and PDF files are allowed."
      );
      setFile(null);
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleClearRadio = () => {
    setFormData((prevData) => ({
      ...prevData,
      assessmentBasis: "",
    }));
  };

  const handleSuccess = (duration) => {
    toast.success(`SKKM Submitted Successfully in ${duration} seconds`);
    setFormData({
      activityNameID: "",
      activityNameEN: "",
      certificateNumber: "",
      activityCategory: "",
      activityType: "",
      achievement: "",
      assessmentBasis: "",
      ipfsHash: "",
      uniqueCode: "",
      creditPoin: 0, // Resetting creditPoin
    });
    setFile(null);
    setFilePreview(null);
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
    if (existingCertificates.includes(formData.certificateNumber))
      newErrors.certificateNumber =
        "Certificate number already exists for this student";
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
        setError("Error uploading file to IPFS");
        return;
      }
    }

    try {
      await contract.call("submitSKKM", [
        formData.activityNameID,
        formData.activityNameEN,
        formData.certificateNumber,
        formData.activityCategory,
        formData.activityType,
        formData.achievement,
        formData.assessmentBasis,
        formData.ipfsHash,
        BigNumber.from(String(formData.creditPoin * 10 ** 18)), // Mengonversi creditPoin ke BigNumber dengan basis 10^18
      ]);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Stop timer and calculate duration
      handleSuccess(duration);
    } catch (error) {
      handleError(error);
    }
  };

  const isFilePDF = file && file.type === "application/pdf";

  return (
    <Card className="h-full w-full bg-white shadow-lg rounded-lg">
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          Submit Activity Credit
        </Typography>
        <Typography color="white" className="mt-1 text-sm text-center p-2">
          Fill out the form below to submit a new Activity Credit request.
        </Typography>
      </CardHeader>
      <CardBody className="overflow-auto px-4 py-6 bg-white max-h-[1000px]">
        <form className="space-y-6">
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Activity Name (BHS.INDONESIA)
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
              Activity Name (ENGLISH)
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
              Certificate Number
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
              Activity Categories
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
              placeholder="Select Category"
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
              Activity Level
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
              placeholder="Select a Category first"
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
              Activity Achievements
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
              placeholder="Select Activity Level first"
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
              Assessment Basis
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
                  Select Activity Achievement first
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
              IPFS Hash {""}
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
                Upload Certificate
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
              {filePreview ? (
                isFilePDF ? (
                  <>
                    <div
                      className="rounded cursor-pointer w-full overflow-y-auto"
                      onClick={() => setIsModalOpen(true)}
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
                    <Button
                      variant="outlined"
                      color="red"
                      className="mt-2"
                      onClick={handleClearFile}
                    >
                      Clear File
                    </Button>
                  </>
                ) : (
                  <>
                    <img
                      src={filePreview}
                      alt="File Preview"
                      className="rounded max-h-64 cursor-pointer"
                      onClick={() => setIsModalOpen(true)}
                    />
                    <Button
                      variant="outlined"
                      color="red"
                      className="mt-2"
                      onClick={handleClearFile}
                    >
                      Clear Image
                    </Button>
                  </>
                )
              ) : (
                <Typography variant="small" color="blue-gray">
                  No file selected
                </Typography>
              )}
            </div>
          </div>
        </form>
        <div className="mt-6 w-full">
          <Web3Button
            connectWallet={{
              className: "button-wallet-square-web3 border-none",
              modalSize: "wide",
              theme: darkTheme({
                colors: {
                  accentText: "#AC6AFF",
                  accentButtonBg: "#AC6AFF",
                  separatorLine: "#AC6AFF",
                  borderColor: "#604483",
                  secondaryText: "#949494",
                },
              }),
              btnTitle: "Login",
              welcomeScreen: {
                title: "Welcome to Ledger Kuliah",
                subtitle:
                  "Connect Wallet to See Your Student Activity Credit Unit",
              },
              termsOfServiceUrl:
                "https://www.termsandconditionsgenerator.com/live.php?token=TGU5uyKI2cdxnuXxopcVtvwPcM7yOeXm",
              privacyPolicyUrl:
                "https://www.privacypolicyonline.com/live.php?token=Fp50YxH1Ifr2groguH3TZT5Rct78Szrf",
              hideSwitchToPersonalWallet: true,
              showThirdwebBranding: false,
            }}
            contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS}
            contractAbi={abi}
            action={async (contract) => {
              await handleSubmit(contract);
            }}
            style={{
              width: "100%",
              background: "transparent",
              color: "rgb(0, 0, 0)",
              borderRadius: "0",
              fontWeight: "bold",
              padding: "10px 20px",
              position: "relative",
              zIndex: 1,
              display: "inline-block",
              transition: "color 0.3s ease-in-out, background 0.3s ease-in-out",
            }}
          >
            <div
              className="button-wallet-square-web3"
              style={{
                width: "100%",
                background: "transparent",
                color: "rgb(0, 0, 0)",
                borderRadius: "0",
                fontWeight: "bold",
                padding: "10px 20px",
                position: "relative",
                zIndex: 1,
                display: "inline-block",
                transition:
                  "color 0.3s ease-in-out, background 0.3s ease-in-out",
              }}
            >
              Submit
            </div>
          </Web3Button>
        </div>
      </CardBody>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000, // Ensure modal is above other content
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000, // Ensure overlay is above other content
          },
        }}
      >
        {isFilePDF ? (
          <div
            style={{
              minWidth: "90vh",
              zIndex: 2001,
              overflowY: "auto",
              maxHeight: "50vh",
            }}
          >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer fileUrl={filePreview} />
            </Worker>
          </div>
        ) : (
          <img
            src={filePreview}
            alt="File Preview"
            style={{ maxHeight: "90vh", maxWidth: "90vw", zIndex: 2001 }}
          />
        )}
        <Button
          variant="outlined"
          onClick={() => setIsModalOpen(false)}
          className="mt-4"
          color="red"
          style={{ zIndex: 2001 }}
        >
          Close
        </Button>
      </Modal>
      <ToastContainer />
    </Card>
  );
};

export default SubmitSKKM;
