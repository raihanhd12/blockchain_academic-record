import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useAddress, useContract } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";

const HMJHome = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [revisedCount, setRevisedCount] = useState(0);
  const [validatedCount, setValidatedCount] = useState(0);
  const [department, setDepartment] = useState("");

  const address = useAddress();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);

  useEffect(() => {
    const fetchHMJDepartment = async () => {
      if (contract && address) {
        try {
          const user = await contract.call("users", [address]);
          setDepartment(user.department);
        } catch (error) {
          console.error("Error fetching HMJ department:", error);
        }
      }
    };

    fetchHMJDepartment();
  }, [contract, address]);

  useEffect(() => {
    const fetchRequestCounts = async () => {
      if (contract && department) {
        try {
          const requests = await contract.call("getAllSKKM");

          // Fetch student data for each request
          const requestsWithStudentData = await Promise.all(
            requests.map(async (request) => {
              const studentData = await contract.call("users", [
                request.student,
              ]);
              return { ...request, studentData };
            })
          );

          const departmentRequests = requestsWithStudentData.filter(
            (request) => request.studentData.department === department
          );

          setPendingCount(
            departmentRequests.filter((request) => request.status === 0).length
          );
          setUnverifiedCount(
            departmentRequests.filter((request) => request.status === 2).length
          );
          setVerifiedCount(
            departmentRequests.filter((request) => request.status === 1).length
          );
          setRevisedCount(
            departmentRequests.filter((request) => request.status === 4).length
          );
          setValidatedCount(
            departmentRequests.filter((request) => request.status === 3).length
          );
        } catch (error) {
          console.error("Error fetching SKKM requests:", error);
        }
      }
    };

    fetchRequestCounts();
  }, [contract, department]);

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      <Card className="w-72">
        <CardBody className="text-center">
          <Typography variant="h4" color="blue-gray" className="mb-2">
            Pending
          </Typography>
          <Typography color="blue-gray" className="font-medium" textGradient>
            {pendingCount}
          </Typography>
        </CardBody>
      </Card>
      <Card className="w-72">
        <CardBody className="text-center">
          <Typography variant="h4" color="blue-gray" className="mb-2">
            Unverified
          </Typography>
          <Typography color="blue-gray" className="font-medium" textGradient>
            {unverifiedCount}
          </Typography>
        </CardBody>
      </Card>
      <Card className="w-72">
        <CardBody className="text-center">
          <Typography variant="h4" color="blue-gray" className="mb-2">
            Verified
          </Typography>
          <Typography color="blue-gray" className="font-medium" textGradient>
            {verifiedCount}
          </Typography>
        </CardBody>
      </Card>
      <Card className="w-72">
        <CardBody className="text-center">
          <Typography variant="h4" color="blue-gray" className="mb-2">
            Revised
          </Typography>
          <Typography color="blue-gray" className="font-medium" textGradient>
            {revisedCount}
          </Typography>
        </CardBody>
      </Card>
      <Card className="w-72">
        <CardBody className="text-center">
          <Typography variant="h4" color="blue-gray" className="mb-2">
            Validated
          </Typography>
          <Typography color="blue-gray" className="font-medium" textGradient>
            {validatedCount}
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
};

export default HMJHome;
