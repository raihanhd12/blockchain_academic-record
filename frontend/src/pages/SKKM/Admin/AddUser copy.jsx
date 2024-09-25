import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Select,
  Option,
  Button,
} from "@material-tailwind/react";
import {
  Web3Button,
  darkTheme,
  useContract,
  useAddress,
} from "@thirdweb-dev/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import abi from "@abis/SKKM.json";
import { departments } from "@constants";

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    department: "",
    role: "1",
    ethAmount: "0.000000000000001",
  });
  const [addressInput, setAddressInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);
  const userAddress = useAddress();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (contract && userAddress) {
        const superAdmin = await contract.call("superAdmin");
        setIsSuperAdmin(superAdmin === userAddress);
        setLoading(false);
      }
    };
    checkSuperAdmin();
  }, [contract, userAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
    if (name === "role") {
      setFormData((prevData) => ({
        ...prevData,
        ethAmount: value === "3" ? "10" : "0.000000000000001",
      }));
    }
  };

  const handleSuccess = (duration) => {
    toast.success(`User added successfully in ${duration} seconds!`);
    setTimeout(() => {
      navigate("/skkm/user/add-user");
      window.location.reload();
    }, 3000);
    setFormData({
      name: "",
      identifier: "",
      department: "",
      role: "1",
      ethAmount: "0.000000000000001",
    });
    setAddressInput("");
  };

  const handleError = (error) => {
    console.error("Error adding user:", error);
    const errorMessage =
      error?.reason || error?.message || "An unknown error occurred";
    toast.error(errorMessage);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "This field is required";
    if (!formData.identifier) newErrors.identifier = "This field is required";
    if (!formData.department) newErrors.department = "This field is required";
    if (!addressInput) newErrors.address = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (contract) => {
    if (!validateForm()) return;

    try {
      const startTime = Date.now(); // Start timer
      const roleNumber = parseInt(formData.role);
      const ethAmount = ethers.utils.parseEther(formData.ethAmount);
      await contract.call(
        "addUser",
        [
          addressInput,
          roleNumber,
          formData.name,
          formData.identifier,
          formData.department,
        ],
        { value: ethAmount }
      );
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Stop timer and calculate duration
      handleSuccess(duration);
    } catch (error) {
      handleError(error);
    }
  };

  const roleOptions = [
    { value: "1", label: "Student" },
    { value: "2", label: "HMJ" },
    { value: "3", label: "Admin", superAdminOnly: true },
    { value: "4", label: "BEM" },
  ];

  return loading ? (
    <div>Loading...</div>
  ) : (
    <Card className="h-full w-full bg-white shadow-lg rounded-lg">
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          Add User
        </Typography>
        <Typography color="white" className="mt-1 text-sm text-center p-2">
          Fill out the form below to add a new user.
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
              Address
            </Typography>
            <Input
              color="purple"
              type="text"
              name="address"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter address"
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {errors.address && (
              <Typography color="red" variant="small">
                {errors.address}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Name
            </Typography>
            <Input
              color="purple"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {errors.name && (
              <Typography color="red" variant="small">
                {errors.name}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Identifier
            </Typography>
            <Input
              color="purple"
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter identifier"
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {errors.identifier && (
              <Typography color="red" variant="small">
                {errors.identifier}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Department
            </Typography>
            <Select
              color="purple"
              name="department"
              value={formData.department}
              onChange={(value) => handleSelectChange(value, "department")}
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
            {errors.department && (
              <Typography color="red" variant="small">
                {errors.department}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              Role
            </Typography>
            <Select
              color="purple"
              name="role"
              value={formData.role}
              onChange={(value) => handleSelectChange(value, "role")}
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              {roleOptions
                .filter((option) => isSuperAdmin || !option.superAdminOnly)
                .map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
            </Select>
            {errors.role && (
              <Typography color="red" variant="small">
                {errors.role}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              ETH Amount
            </Typography>
            <Input
              color="purple"
              type="text"
              name="ethAmount"
              value={formData.ethAmount}
              onChange={handleChange}
              placeholder="Enter ETH amount"
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              disabled
            />
            {errors.ethAmount && (
              <Typography color="red" variant="small">
                {errors.ethAmount}
              </Typography>
            )}
          </div>
        </form>
        <div className="mt-6 w-full flex justify-between">
          <Button
            variant="outlined"
            size="md"
            color="red"
            onClick={() => navigate("/skkm/user")}
          >
            Back
          </Button>
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
                subtitle: "Connect Wallet to Add a New User",
              },
              termsOfServiceUrl:
                "https://www.termsandconditionsgenerator.com/live.php?token=TGU5uyKI2cdxnuXxopcVtvwPcM7yOeXm",
              privacyPolicyUrl:
                "https://www.privacypolicyonline.com/live.php?token=Fp50YxH1Ifr2groguH3TZT5Rct78Szrf",
              hideSwitchToPersonalWallet: true,
              showThirdwebBranding: false,
            }}
            contractAddress={contractAddress}
            contractAbi={abi}
            action={async (contract) => {
              await handleSubmit(contract);
            }}
            style={{
              width: "auto",
              background: "transparent",
              color: "#b761bd",
              border: "2px solid #b761bd",
              fontWeight: "bold",
              zIndex: 1,
              transition: "color 0.3s ease-in-out, background 0.3s ease-in-out",
            }}
          >
            Add User
          </Web3Button>
        </div>
      </CardBody>
      <ToastContainer />
    </Card>
  );
};

export default AddUser;
