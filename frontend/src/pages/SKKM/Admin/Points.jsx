import React, { useState, useEffect } from "react";
import { useContract, useAddress } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";
import {
  Button,
  Input,
  Typography,
  Card,
  CardHeader,
  CardBody,
  Chip,
} from "@material-tailwind/react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Points = () => {
  const [minimalPoin, setMinimalPoin] = useState(0);
  const [newMinimalPoin, setNewMinimalPoin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);
  const address = useAddress();

  useEffect(() => {
    const fetchMinimalPoin = async () => {
      try {
        const fetchedMinimalPoin = await contract.call("minimalPoin");
        setMinimalPoin(ethers.utils.formatEther(fetchedMinimalPoin));
      } catch (error) {
        console.error("Error fetching minimalPoin:", error);
      }
    };

    const checkAdminRole = async () => {
      try {
        const user = await contract.call("users", [address]);
        setIsAdmin(user.role === 3); // Assuming role 3 is admin
      } catch (error) {
        console.error("Error checking admin role:", error);
      }
    };

    fetchMinimalPoin();
    checkAdminRole();
  }, [contract, address]);

  const handleSetMinimalPoin = async () => {
    if (!newMinimalPoin || isNaN(newMinimalPoin)) {
      toast.error("Please enter a valid number.");
      return;
    }

    setLoading(true);
    const startTime = Date.now(); // Start timer

    try {
      const newMinimalPoinWei = ethers.utils.parseEther(
        newMinimalPoin.toString()
      );
      await contract.call("setMinimalPoin", [newMinimalPoinWei]);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Stop timer and calculate duration
      toast.success(
        `Minimal poin updated successfully in ${duration} seconds!`
      );
      setMinimalPoin(newMinimalPoin);
      setNewMinimalPoin("");
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Reload the browser after 3 seconds
    } catch (error) {
      console.error("Error setting minimalPoin:", error);
      toast.error("Error setting minimal poin.");
    } finally {
      setLoading(false);
    }
  };

  const getColorForPoin = (poin) => {
    if (poin >= 1 && poin <= 10) return "blue";
    if (poin >= 11 && poin <= 20) return "red";
    if (poin >= 21 && poin <= 30) return "green";
    if (poin >= 31 && poin <= 40) return "amber";
    if (poin >= 41 && poin <= 50) return "pink";
    if (poin >= 51 && poin <= 60) return "indigo";
    if (poin >= 61 && poin <= 70) return "purple";
    if (poin >= 71 && poin <= 80) return "teal";
    if (poin >= 81 && poin <= 90) return "cyan";
    return "gray"; // Default color for values out of range
  };

  return (
    <Card className="h-full w-full bg-white shadow-lg rounded-lg">
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          Minimal Poin
        </Typography>
        <div className="flex justify-center p-2 pb-3">
          <Typography color="white">Current Minimal Poin :</Typography>
          <Chip
            className="ml-3"
            color={getColorForPoin(parseFloat(minimalPoin))}
            value={minimalPoin}
          />
        </div>
      </CardHeader>
      <CardBody className="overflow-auto px-4 py-6 bg-white max-h-[630px]">
        <form className="space-y-6">
          <div className="flex flex-col gap-2">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold leading-none"
            >
              New Minimal Poin
            </Typography>
            <Input
              color="purple"
              type="number"
              name="newMinimalPoin"
              value={newMinimalPoin}
              onChange={(e) => setNewMinimalPoin(e.target.value)}
              placeholder="Enter new minimal poin"
              className="bg-gray-50 px-3 py-2 rounded border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div className="mt-6 w-full flex justify-end">
            <Button
              onClick={handleSetMinimalPoin}
              color="purple"
              disabled={loading}
            >
              {loading ? "Loading..." : "Set Minimal Poin"}
            </Button>
          </div>
        </form>
      </CardBody>
      <ToastContainer />
    </Card>
  );
};

export default Points;
