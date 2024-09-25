import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useAddress, useContract } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";

const Home = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const address = useAddress();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      if (contract) {
        try {
          const users = await contract.call("getAllUsers");
          setTotalUsers(users.length);
        } catch (error) {
          console.error("Error fetching total users:", error);
        }
      }
    };

    fetchTotalUsers();
  }, [contract]);

  return (
    <div className="flex justify-center p-4">
      <Card className="w-72">
        <CardBody className="text-center">
          <Typography variant="h4" color="blue-gray" className="mb-2">
            Total Users
          </Typography>
          <Typography color="blue-gray" className="font-medium" textGradient>
            {totalUsers}
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
};

export default Home;
