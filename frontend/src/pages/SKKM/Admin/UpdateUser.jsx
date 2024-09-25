import React, { useEffect, useState } from "react";
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
import { Web3Button, darkTheme, useContract } from "@thirdweb-dev/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";
import { useParams, useNavigate } from "react-router-dom";
import abi from "@abis/SKKM.json";
import { departments } from "@constants";

const UpdateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    department: "",
    role: "1",
  });
  const [addressInput, setAddressInput] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("1");

  const { userId } = useParams();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await contract.call("allUsers", userId);
        setFormData({
          name: user.name,
          identifier: user.identifier,
          department: user.department,
          role: user.role.toString(),
        });
        setAddressInput(user.userAddress);
        setSelectedDepartment(user.department);
        setSelectedRole(user.role.toString());
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (contract) {
      fetchUser();
    }
  }, [contract, userId]);

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
    if (name === "department") {
      setSelectedDepartment(value);
    }
    if (name === "role") {
      setSelectedRole(value);
    }
  };

  const handleRoleChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      role: value,
    }));
    setSelectedRole(value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      role: "",
    }));
  };

  const handleSuccess = (duration) => {
    toast.success(`User updated successfully in ${duration} seconds!`);
    setTimeout(() => {
      navigate("/skkm/user");
      window.location.reload();
    }, 3000);
  };

  const handleError = (error) => {
    console.error("Error updating user:", error);
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
      await contract.call("updateUser", [
        addressInput,
        roleNumber,
        formData.name,
        formData.identifier,
        formData.department,
      ]);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Stop timer and calculate duration
      handleSuccess(duration);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Card className="h-full w-full bg-white shadow-lg rounded-lg">
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          Update User
        </Typography>
        <Typography color="white" className="mt-1 text-sm text-center p-2">
          Fill out the form below to update the user.
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
              disabled
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
              value={selectedDepartment}
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
              value={selectedRole}
              onChange={(value) => handleRoleChange(value)}
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <Option value="1">Student</Option>
              <Option value="2">HMJ</Option>
              <Option value="3">Admin</Option>
            </Select>
            {errors.role && (
              <Typography color="red" variant="small">
                {errors.role}
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
                subtitle: "Connect Wallet to Update the User",
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
            Update User
          </Web3Button>
        </div>
      </CardBody>
      <ToastContainer />
    </Card>
  );
};

export default UpdateUser;
