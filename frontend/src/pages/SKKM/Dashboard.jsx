import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Sidebar from "@components/SKKM/Sidebar";
import Navbar from "@components/SKKM/Navbar";
import SpeedDial from "@components/SKKM/SpeedDial";
import {
  StudentHome,
  SubmitSKKM,
  DetailSKKM,
  EditSKKM,
  Events,
} from "./Student";
import { HMJHome, VerifySKKM, ValidateSKKM } from "./HMJ";
import { AdminHome, User, AddUser, UpdateUser, Points } from "./Admin";
import { BEMHome, ValidateBEM } from "./BEM";
import {
  Aspiration,
  InfoPoin,
  Notice,
  Procedure,
  Timeline,
  Validation,
} from "./Others";
import { useAddress, useContract } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const address = useAddress();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (contract && address) {
        try {
          const user = await contract.call("users", [address]);
          setRole(user.role);
          const superAdmin = await contract.call("superAdmin");
          if (address === superAdmin) {
            setIsSuperAdmin(true);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, [contract, address]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (contract && address) {
        try {
          const requests = await contract.call("getSKKMByStudent", [address]);
          const formattedNotifications = requests
            .filter((request) => request.status === 2) // Status.Unverified
            .map((request) => ({
              message: request.unverifiedMessage,
              certificateNumber: request.certificateNumber,
            }));
          setNotifications(formattedNotifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [contract, address]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="relative sm:p-8 p-4 bg-dark-bg dark:bg-light-bg min-h-screen flex flex-col text-dark-text dark:text-light-text">
      <div className="flex flex-row flex-1">
        <Sidebar
          role={role}
          isSuperAdmin={isSuperAdmin}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <div
          className={`flex-1 max-sm:w-full mx-auto ${
            isCollapsed ? "sm:pl-28" : "sm:pl-[16rem]"
          } sm:pr-5 transition-all duration-300 overflow-auto`}
        >
          <Navbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            notifications={notifications}
            role={role}
            isSuperAdmin={isSuperAdmin}
          />
          <div className="bg-dark-sidebar dark:bg-light-sidebar rounded-[20px] p-8 relative">
            <Routes>
              {role === 1 && (
                <>
                  <Route path="*" element={<Navigate to="/skkm" />} />
                  <Route
                    path="/"
                    element={<StudentHome searchQuery={searchQuery} />}
                  />
                  <Route path="/submit-skkm" element={<SubmitSKKM />} />
                  <Route path="/detail-skkm" element={<DetailSKKM />} />
                  <Route
                    path="/edit-skkm/:uniqueCode/:oneTimeCode"
                    element={<EditSKKM />}
                  />
                </>
              )}
              {role === 2 && (
                <>
                  <Route path="*" element={<Navigate to="/skkm" />} />
                  <Route path="/" element={<HMJHome />} />
                  <Route path="/verify-skkm" element={<VerifySKKM />} />
                  <Route path="/validate-skkm" element={<ValidateSKKM />} />
                </>
              )}
              {(role === 3 || isSuperAdmin) && (
                <>
                  <Route path="*" element={<Navigate to="/skkm" />} />
                  <Route path="/" element={<AdminHome />} />
                  <Route path="/user" element={<User />} />
                  <Route path="/user/add-user" element={<AddUser />} />
                  <Route
                    path="/user/update-user/:userId"
                    element={<UpdateUser />}
                  />
                  <Route path="/points/*" element={<Points />} />
                </>
              )}
              {role === 4 && (
                <>
                  <Route path="*" element={<Navigate to="/skkm" />} />
                  <Route path="/" element={<BEMHome />} />
                  <Route path="/validate-bem" element={<ValidateBEM />} />
                </>
              )}
              <Route path="/aspiration" element={<Aspiration />} />
              <Route path="/info-poin" element={<InfoPoin />} />
              <Route path="/notice" element={<Notice />} />
              <Route path="/procedure" element={<Procedure />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/validation" element={<Validation />} />
            </Routes>
          </div>
          {role === 1 && location.pathname === "/skkm" && (
            <div className="bg-dark-sidebar dark:bg-light-sidebar rounded-[20px] p-8 relative mt-8">
              <Events contract={contract} />
            </div>
          )}
        </div>
        {(role === 1 || !address) && <SpeedDial role={role} />}
      </div>
    </div>
  );
};

export default Dashboard;
