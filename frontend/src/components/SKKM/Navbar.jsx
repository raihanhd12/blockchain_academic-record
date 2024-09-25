import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logo, menu, search } from "@assets";
import { navlinks } from "@constants";
import {
  ConnectWallet,
  useAddress,
  useConnectionStatus,
  darkTheme,
} from "@thirdweb-dev/react";
import { FaEnvelopeOpenText } from "react-icons/fa";
import {
  Menu,
  MenuHandler,
  Button,
  MenuList,
  Badge,
  MenuItem,
  IconButton,
  Typography,
  Dialog,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@material-tailwind/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function NotificationsMenu({ notifications }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");

  const handleOpenDialog = (message) => {
    setSelectedMessage(message);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMessage("");
  };

  return (
    <>
      <Menu
        animate={{
          mount: { y: 0 },
          unmount: { y: 25 },
        }}
        placement="bottom-end"
      >
        <MenuHandler>
          <IconButton variant="text" className="p-7">
            <Badge content={notifications.length} color="purple" withBorder>
              <FaEnvelopeOpenText color="white" className="text-2xl" />
            </Badge>
          </IconButton>
        </MenuHandler>
        <MenuList className="max-h-72 overflow-y-auto ">
          {notifications.map((notification, index) => (
            <MenuItem
              key={index}
              className="bg-deep-purple-100 flex items-center gap-4 py-2 pl-2 pr-8 my-1 "
              onClick={() => handleOpenDialog(notification.message)}
            >
              <Typography
                variant="small"
                color="black"
                className="font-semibold"
              >
                {notification.certificateNumber || "No Certificate Number"}
              </Typography>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Dialog
        size="xs"
        open={openDialog}
        handler={handleCloseDialog}
        dismiss={{ enabled: false }}
      >
        <Card className="mx-auto w-full max-w-[40rem]">
          <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
            <Typography
              variant="h4"
              color="white"
              className="font-bold text-center py-4"
            >
              Unverified Message
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 p-4 ">
            <Typography
              className="font-normal text-black bg-blue-gray-50 p-4 rounded-lg "
              dangerouslySetInnerHTML={{ __html: selectedMessage }}
            />
          </CardBody>
          <CardFooter className="pt-0 justify-end flex">
            <Button color="red" variant="gradient" onClick={handleCloseDialog}>
              Close
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
    </>
  );
}

const Navbar = ({ searchQuery, setSearchQuery, notifications, role }) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState("dashboard");
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const prevConnectionStatus = useRef(connectionStatus);

  useEffect(() => {
    if (
      prevConnectionStatus.current === "connected" &&
      connectionStatus === "disconnected"
    ) {
      console.log("Connection Status: disconnected");
      window.location.reload();
    } else if (connectionStatus === "disconnected") {
      console.log("Connection Status: waiting");
    } else {
      console.log("Connection Status:", connectionStatus);
    }

    prevConnectionStatus.current = connectionStatus;
  }, [connectionStatus]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    navigate("/skkm"); // Navigate to the home page
  };

  const handleKeyDown = (e) => {
    if ((!address || role === 1) && e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <div className="flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6">
      <div className="lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px]">
        {(!address || role === 1) && (
          <>
            <div className="lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px] bg-[#1c1c24] rounded-[100px]">
              <input
                type="text"
                placeholder="Search here ..."
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                className="flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#4b5264] text-white bg-transparent outline-none"
              />
              <div
                className="w-[72px] h-full rounded-[20px] bg-[#B761BD] flex justify-center items-center cursor-pointer"
                onClick={handleSearchClick}
              >
                <img
                  src={search}
                  alt="search"
                  className="w-[15px] h-[15px] object-contain"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sm:flex hidden flex-row justify-end gap-4">
        <div className="flex justify-center items-center">
          {role === 1 && <NotificationsMenu notifications={notifications} />}
        </div>
        <ConnectWallet
          className="button-wallet-parallelogram border-none"
          modalSize="wide"
          theme={darkTheme({
            colors: {
              accentText: "#AC6AFF",
              accentButtonBg: "#AC6AFF",
              separatorLine: "#AC6AFF",
              borderColor: "#604483",
              secondaryText: "#949494",
            },
          })}
          btnTitle="Login"
          welcomeScreen={{
            title: "Welcome to Ledger Kuliah",
            subtitle: "Connect Wallet to See Your Student Activity Credit Unit",
          }}
          termsOfServiceUrl="https://www.termsandconditionsgenerator.com/live.php?token=TGU5uyKI2cdxnuXxopcVtvwPcM7yOeXm"
          privacyPolicyUrl="https://www.privacypolicyonline.com/live.php?token=Fp50YxH1Ifr2groguH3TZT5Rct78Szrf"
          hideSwitchToPersonalWallet={true}
          showThirdwebBranding={false}
          switchToActiveChain={true}
        />
      </div>
      {/* Small screen navigation */}
      <div className="sm:hidden flex justify-between items-center relative">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#2c2f32] flex justify-center items-center cursor-pointer">
          <img
            src={logo}
            alt="user"
            className="w-[60%] h-[60%] object-contain"
          />
        </div>

        <img
          src={menu}
          alt="menu"
          className="w-[34px] h-[34px] object-contain cursor-pointer"
          onClick={() => setToggleDrawer((prev) => !prev)}
        />

        <div
          className={`absolute top-[60px] right-0 left-0 bg-[#1c1c24] z-10 shadow-secondary py-4 ${
            !toggleDrawer ? "-translate-y-[100vh]" : "translate-y-0"
          } transition-all duration-700`}
        >
          <ul className="mb-4">
            {navlinks.map((link) => (
              <li
                key={link.name}
                className={`flex p-4 ${
                  isActive === link.name && "bg-[#3a3a43]"
                }`}
                onClick={() => {
                  setIsActive(link.name);
                  setToggleDrawer(false);
                  navigate(link.link);
                }}
              >
                <img
                  src={link.imgUrl}
                  alt={link.name}
                  className={`w-[24px] h-[24px] object-contain ${
                    isActive === link.name ? "grayscale-0" : "grayscale"
                  }`}
                />
                <Typography
                  variant="small"
                  className={`ml-[20px] font-epilogue font-semibold text-[14px] ${
                    isActive === link.name ? "text-[#1dc071]" : "text-[#808191]"
                  }`}
                >
                  {link.name}
                </Typography>
              </li>
            ))}
          </ul>

          <div className="flex mx-4">
            <ConnectWallet
              className="button-wallet-parallelogram"
              modalSize="wide"
              theme={darkTheme({
                colors: {
                  accentText: "#AC6AFF",
                  accentButtonBg: "#AC6AFF",
                  separatorLine: "#AC6AFF",
                  borderColor: "#604483",
                  secondaryText: "#949494",
                },
              })}
              btnTitle="Login"
              welcomeScreen={{
                title: "Welcome to Ledger Kuliah",
                subtitle:
                  "Connect Wallet to See Your Student Activity Credit Unit",
              }}
              termsOfServiceUrl="https://www.termsandconditionsgenerator.com/live.php?token=TGU5uyKI2cdxnuXxopcVtvwPcM7yOeXm"
              privacyPolicyUrl="https://www.privacypolicyonline.com/live.php?token=Fp50YxH1Ifr2groguH3TZT5Rct78Szrf"
              hideSwitchToPersonalWallet={true}
              showThirdwebBranding={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
