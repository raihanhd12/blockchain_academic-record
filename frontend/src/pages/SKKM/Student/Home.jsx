import React, { useEffect, useState } from "react";
import { Localhost } from "@thirdweb-dev/chains";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  CardFooter,
  IconButton,
} from "@material-tailwind/react";

const sdk = new ThirdwebSDK(Localhost, {
  clientId: import.meta.env.VITE_CLIENT_ID,
});

const TABLE_HEAD = [
  "Student/Department/Address",
  "Activity Name ID/Certificate Number/Activity Type",
  "Status",
];

const Status = ["Pending", "Verified", "UnVerified", "Valid", "Revised"];

const Home = ({ searchQuery }) => {
  const [skkmRequests, setSkkmRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchSKKMRequests = async () => {
      try {
        const contract = await sdk.getContract(
          import.meta.env.VITE_CONTRACT_ADDRESS
        );
        const requests = await contract.call("getAllSKKM");
        const reversedRequests = [...requests].reverse();
        // Fetch student data for each request
        const requestsWithStudentData = await Promise.all(
          reversedRequests.map(async (request) => {
            const studentData = await contract.call("users", [request.student]);
            return { ...request, studentData };
          })
        );

        setSkkmRequests(requestsWithStudentData);
      } catch (error) {
        console.error("Error fetching SKKM requests:", error);
      }
    };

    fetchSKKMRequests();
  }, []);

  const truncateText = (text, maxWords) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + " ...";
    }
    return text;
  };

  const convertToFloat = (value) => {
    const floatValue = parseFloat(ethers.utils.formatUnits(value, 1));
    return isNaN(floatValue) ? 0 : floatValue;
  };

  const filteredRequests = skkmRequests.filter((request) => {
    const fullText = [
      request.student.toLowerCase(),
      request.studentData.name?.toLowerCase(),
      request.studentData.department?.toLowerCase(),
      request.activityNameID.toLowerCase(),
      request.certificateNumber.toLowerCase(),
      request.activityType.toLowerCase(),
    ].join(" ");

    return fullText.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className="h-full w-full bg-white shadow-lg rounded-lg">
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          SKKM Requests
        </Typography>
        <Typography color="white" className="mt-1 text-sm text-center p-2">
          These are all SKKM requests submitted by students.
        </Typography>
      </CardHeader>
      <CardBody
        className="overflow-auto px-0 p-0"
        style={{ maxHeight: "650px" }}
      >
        <table className="w-full min-w-max table-auto">
          <thead>
            <tr>
              {TABLE_HEAD.map((head, index) => (
                <th
                  key={head}
                  className={`p-4 border-b border-neutral-700 ${
                    index !== TABLE_HEAD.length - 1 ? "border-r" : ""
                  }`}
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
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ minHeight: "100px" }}>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request, index) => {
                const isLast = index === paginatedRequests.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-black";

                return (
                  <tr key={index}>
                    <td className={`${classes} border border-black border-l-0`}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.studentData.name} {/* Student Name */}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.studentData.department}{" "}
                        {/* Student Department */}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {request.student}
                      </Typography>
                    </td>
                    <td
                      className={`${classes} border border-l-0 border-black bg-blue-gray-50`}
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        data-fulltext={request.activityNameID}
                      >
                        {truncateText(request.activityNameID, 10)}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        data-fulltext={request.certificateNumber}
                      >
                        {truncateText(request.certificateNumber, 10)}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                        data-fulltext={request.activityType}
                      >
                        {truncateText(request.activityType, 10)}
                      </Typography>
                    </td>
                    <td
                      className={`${classes} border border-l-0 border-r-0 border-black`}
                    >
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={Status[request.status]}
                          color={
                            request.status === 0
                              ? "amber"
                              : request.status === 1
                              ? "purple"
                              : request.status === 2
                              ? "pink"
                              : request.status === 3
                              ? "green"
                              : "brown"
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="p-4 text-center">
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
      <CardFooter className="flex items-center justify-between p-4 ">
        <Button
          variant="outlined"
          size="sm"
          className="border-purple-500 text-purple-500"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <IconButton
              key={i}
              variant={currentPage === i + 1 ? "outlined" : "text"}
              className="border-purple-500 text-purple-500"
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </IconButton>
          ))}
        </div>
        <Button
          variant="outlined"
          size="sm"
          className="border-purple-500 text-purple-500"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Home;
