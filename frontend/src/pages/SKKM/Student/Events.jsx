import React, { useState, useEffect } from "react";
import { useContract, useContractEvents } from "@thirdweb-dev/react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  CardFooter,
  Input,
} from "@material-tailwind/react";
import abi from "@abis/SKKM.json";
import { FaCopy } from "react-icons/fa";

const Events = () => {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);

  const {
    data: events,
    isLoading,
    error,
  } = useContractEvents(contract, undefined, {
    subscribe: true,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [userDetails, setUserDetails] = useState({});
  const [superAdmin, setSuperAdmin] = useState("");

  useEffect(() => {
    const fetchSuperAdminAndUserDetails = async () => {
      const superAdminAddress = await contract.call("superAdmin");
      setSuperAdmin(superAdminAddress);

      if (events) {
        const userDetailsMap = {};
        for (const event of events) {
          const userAddress = event.data.triggeredBy; // Address of the user who triggered the event
          if (userAddress && !userDetailsMap[userAddress]) {
            if (userAddress === superAdminAddress) {
              userDetailsMap[userAddress] = {
                identifier: "SuperAdmin",
                name: "Super Admin",
              };
            } else {
              const userDetail = await contract.call("users", [userAddress]);
              userDetailsMap[userAddress] = userDetail;
            }
          }
        }
        setUserDetails(userDetailsMap);
      }
    };

    fetchSuperAdminAndUserDetails();
  }, [events, contract]);

  const handleOpenDialog = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const totalPages = Math.ceil((events?.length || 0) / itemsPerPage);
  const paginatedEvents = events?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const eventColors = {
    QRCodeSubmitted: "gray",
    QRCodeGenerated: "blue",
    MinimalPoinUpdated: "green",
    QRCodeValidatedByBEM: "amber",
    SKKMDeleted: "red",
    SKKMEdited: "purple",
    SKKMSubmitted: "teal",
    SKKMValidated: "cyan",
    SKKMVerified: "orange",
    UserAdded: "pink",
    UserDeleted: "brown",
  };

  if (isLoading) {
    return <Typography>Loading events...</Typography>;
  }

  if (error) {
    console.error(error);
    return <Typography>Error loading events</Typography>;
  }

  return (
    <Card className="h-full w-full bg-white shadow-lg rounded-lg">
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          Events
        </Typography>
        <Typography color="white" className="mt-1 text-sm text-center p-2">
          These are all Events in SKKM.
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
                  Transaction Hash
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
                  Identifier
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
                  Name
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
                  Events
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
                  Block Number
                </Typography>
              </th>
            </tr>
          </thead>
          <tbody style={{ minHeight: "200px" }}>
            {paginatedEvents?.length > 0 ? (
              paginatedEvents.map((event, index) => {
                const isLast = index === paginatedEvents.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-neutral-700";

                const userAddress = event.data.triggeredBy; // Address of the user who triggered the event
                const userDetail = userDetails[userAddress] || {};
                const identifier = userDetail.identifier || "N/A";
                const name = userDetail.name || "N/A";

                return (
                  <tr
                    key={index}
                    className="cursor-pointer"
                    onClick={() => handleOpenDialog(event)}
                  >
                    <td
                      className={`${classes} border-r border-blue-gray-100 bg-blue-gray-50`}
                    >
                      {event.transaction.transactionHash ? (
                        <div className="flex items-center">
                          <Tooltip content="Copy Transaction Hash">
                            <FaCopy
                              className="mr-2 cursor-pointer"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  event.transaction.transactionHash
                                )
                              }
                            />
                          </Tooltip>
                          {event.transaction.transactionHash.slice(0, 6)}...
                          {event.transaction.transactionHash.slice(-4)}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className={`${classes} border-r`}>
                      <Typography variant="small">{identifier}</Typography>
                    </td>
                    <td className={`${classes} border-r`}>
                      <Typography variant="small">{name}</Typography>
                    </td>
                    <td className={`${classes} border-r-1`}>
                      <Chip
                        color={eventColors[event.eventName] || "gray"}
                        size="sm"
                        value={event.eventName}
                        className="w-48"
                      />
                    </td>
                    <td
                      className={`${classes} border-l border-blue-gray-100 bg-blue-gray-50`}
                    >
                      {event.transaction.blockNumber ?? "N/A"}
                    </td>
                  </tr>
                );
              })
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

      <CardFooter className="flex items-center justify-between p-4">
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

      {selectedEvent && (
        <Dialog open={openDialog} handler={handleCloseDialog} size="lg">
          <DialogHeader className="justify-center text-deep-purple-900">
            <CardHeader className="rounded-3 bg-dark-sidebar mb-2 border-deep-purple-400 border-4">
              <Typography
                variant="h4"
                color="white"
                className="font-bold text-center p-5"
              >
                Event Details
              </Typography>
            </CardHeader>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Transaction Hash
                </Typography>
                <Input
                  label="Transaction Hash"
                  value={selectedEvent.transaction.transactionHash || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Block Number
                </Typography>
                <Input
                  label="Block Number"
                  value={selectedEvent.transaction.blockNumber || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              <div>
                <Typography className="mb-2" color="deep-purple" variant="h6">
                  Event Name
                </Typography>
                <Input
                  label="Event Name"
                  value={selectedEvent.eventName || "N/A"}
                  disabled
                  size="lg"
                />
              </div>
              {selectedEvent.data &&
                Object.keys(selectedEvent.data).map((key) => (
                  <div key={key}>
                    <Typography
                      className="mb-2"
                      color="deep-purple"
                      variant="h6"
                    >
                      {key}
                    </Typography>
                    <Input
                      label={key}
                      value={selectedEvent.data[key].toString() || "N/A"}
                      disabled
                      size="lg"
                    />
                  </div>
                ))}
            </div>
          </DialogBody>
          <DialogFooter className="flex justify-end">
            <Button variant="gradient" color="red" onClick={handleCloseDialog}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </Card>
  );
};

export default Events;
