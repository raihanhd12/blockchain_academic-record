import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useAddress, useContract } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";

const BEMHome = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [validatedCount, setValidatedCount] = useState(0);
  const [department, setDepartment] = useState("");

  const address = useAddress();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);

  useEffect(() => {
    const fetchBEMDepartment = async () => {
      if (contract && address) {
        try {
          const user = await contract.call("users", [address]);
          setDepartment(user.department);
        } catch (error) {
          console.error("Error fetching BEM department:", error);
        }
      }
    };

    fetchBEMDepartment();
  }, [contract, address]);

  useEffect(() => {
    const fetchQRCodeCounts = async () => {
      if (contract && department) {
        try {
          const qrCodes = await contract.call("getAllQRCodes");

          const departmentQRCodes = qrCodes.filter(
            (qrCode) => qrCode.status === 6 || qrCode.status === 7
          );

          setPendingCount(
            departmentQRCodes.filter((qrCode) => qrCode.status === 6).length
          );

          setValidatedCount(
            departmentQRCodes.filter((qrCode) => qrCode.status === 7).length
          );
        } catch (error) {
          console.error("Error fetching QR Codes:", error);
        }
      }
    };

    fetchQRCodeCounts();
  }, [contract, department]);

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      <Card className="w-72">
        <CardBody className="text-center">
          <Typography variant="h4" color="blue-gray" className="mb-2">
            Pending QR Codes
          </Typography>
          <Typography color="blue-gray" className="font-medium" textGradient>
            {pendingCount}
          </Typography>
        </CardBody>
      </Card>
      <Card className="w-72">
        <CardBody className="text-center">
          <Typography variant="h4" color="blue-gray" className="mb-2">
            Validated QR Codes
          </Typography>
          <Typography color="blue-gray" className="font-medium" textGradient>
            {validatedCount}
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
};

export default BEMHome;
