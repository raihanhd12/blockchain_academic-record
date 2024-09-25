import React, { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  TabsHeader,
  Tab,
  CardFooter,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Spinner,
} from "@material-tailwind/react";
import { useContract } from "@thirdweb-dev/react";
import { useNavigate } from "react-router-dom";
import abi from "@abis/SKKM.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TABS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Admin",
    value: "admin",
  },
  {
    label: "BEM",
    value: "bem",
  },
  {
    label: "HMJ",
    value: "hmj",
  },
  {
    label: "Student",
    value: "student",
  },
];

const TABLE_HEAD = [
  { label: "Name", value: "name" },
  { label: "Identifier", value: "identifier" },
  { label: "Department", value: "department" },
  { label: "Role", value: "role" },
  { label: "Action", value: "" },
];

const User = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "descending",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const usersPerPage = 5;

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await contract.call("getAllUsers");
        const reversedUsers = [...allUsers].reverse(); // Reverse the order to show newest first
        setUsers(reversedUsers);
        setFilteredUsers(reversedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (contract) {
      fetchUsers();
    }
  }, [contract]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, activeTab, users]);

  useEffect(() => {
    sortUsers();
  }, [sortConfig]);

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getRoleName(user.role)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab !== "all") {
      const roleMap = {
        bem: 4,
        admin: 3,
        hmj: 2,
        student: 1,
      };
      filtered = filtered.filter((user) => user.role === roleMap[activeTab]);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to the first page on new filter
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const getRoleName = (role) => {
    switch (role) {
      case 1:
        return "Student";
      case 2:
        return "HMJ";
      case 3:
        return "Admin";
      case 4:
        return "BEM";
      default:
        return "None";
    }
  };

  const sortUsers = () => {
    let sortedUsers = [...filteredUsers];
    if (sortConfig.key) {
      sortedUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredUsers(sortedUsers);
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleDeleteUser = async () => {
    setLoading(true);
    const startTime = Date.now(); // Start timer
    try {
      await contract.call("deleteUser", [selectedUser.userAddress]);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2); // Stop timer and calculate duration
      setUsers(
        users.filter((user) => user.userAddress !== selectedUser.userAddress)
      );
      setFilteredUsers(
        filteredUsers.filter(
          (user) => user.userAddress !== selectedUser.userAddress
        )
      );
      setOpenDialog(false);
      toast.success(`User deleted successfully in ${duration} seconds`);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  return (
    <Card className="h-full w-full">
      <ToastContainer />
      <Dialog open={openDialog} handler={setOpenDialog} className="">
        <DialogHeader>Are you sure you want to delete this user?</DialogHeader>
        <DialogBody className="text-black">
          This action cannot be undone. The user{" "}
          <span className="text-purple-500 font-extrabold underline">
            {selectedUser?.name}
          </span>{" "}
          will be permanently removed from the system.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setOpenDialog(false)}
            className="mr-1"
            disabled={loading}
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="purple"
            onClick={handleDeleteUser}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : <span>Confirm</span>}
          </Button>
        </DialogFooter>
      </Dialog>
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          Users
        </Typography>
        <Typography color="white" className="mt-1 text-sm text-center p-2">
          See information about all users
        </Typography>
      </CardHeader>
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex items-center justify-between gap-8">
          <div className="w-full md:w-72">
            <Input
              label="Search"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex flex-col items-center">
            <Tabs
              value={activeTab}
              onChange={(value) => handleTabChange(value)}
              className="w-full md:w-max"
            >
              <TabsHeader
                indicatorProps={{
                  className:
                    "bg-transparent border-b-2 border-purple-500 shadow-none rounded-none",
                }}
              >
                {TABS.map(({ label, value }) => (
                  <Tab
                    key={value}
                    value={value}
                    onClick={() => handleTabChange(value)}
                  >
                    &nbsp;&nbsp;{label}&nbsp;&nbsp;
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              className="flex items-center gap-3"
              size="sm"
              color="purple"
              onClick={() => navigate("/skkm/user/add-user")}
            >
              <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Add user
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody
        className="overflow-auto px-0 p-0"
        style={{ maxHeight: "600px" }}
      >
        <table className="mt-4 w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map(({ label, value }) => (
                <th
                  key={value}
                  onClick={() => requestSort(value)}
                  className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                  >
                    {label}{" "}
                    {value && (
                      <ChevronUpDownIcon
                        strokeWidth={2}
                        className="h-4 w-4"
                        style={{
                          transform:
                            sortConfig.key === value &&
                            sortConfig.direction === "descending"
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                        }}
                      />
                    )}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => {
              const isLast = index === currentUsers.length - 1;
              const classes = isLast
                ? "p-4"
                : "p-4 border-b border-blue-gray-50";

              return (
                <tr key={user.userAddress}>
                  <td className={classes}>
                    <div className="flex items-center gap-3">
                      <Avatar src="" alt={user.name} size="sm" />
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {user.name}
                        </Typography>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal opacity-70"
                        >
                          {user.userAddress}
                        </Typography>
                      </div>
                    </div>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {user.identifier}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {user.department}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {getRoleName(user.role)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Tooltip content="Edit User">
                      <IconButton
                        variant="text"
                        onClick={() =>
                          navigate(`/skkm/user/update-user/${user.userId}`)
                        }
                      >
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Delete User">
                      <IconButton
                        variant="text"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="flex items-center justify-between border-blue-gray-50 p-4">
        <Button
          variant="outlined"
          className="border-purple-500 text-purple-500"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
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
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
};

export default User;
