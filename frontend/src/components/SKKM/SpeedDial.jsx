import React from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  SpeedDial as MuiSpeedDial,
  SpeedDialHandler,
  SpeedDialContent,
  SpeedDialAction,
  Tooltip,
} from "@material-tailwind/react";
import {
  FaRegComment,
  FaRegStar,
  FaRegBell,
  FaSortAmountDownAlt,
  FaRegClock,
  FaCheckDouble,
  FaArrowsAlt,
} from "react-icons/fa";
import { useAddress, useContract } from "@thirdweb-dev/react";
import abi from "@abis/SKKM.json";

const SpeedDial = ({ role }) => {
  const navigate = useNavigate();
  const address = useAddress();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const { contract } = useContract(contractAddress, abi);

  return (
    <div className="fixed bottom-6 right-5">
      <div className="absolute bottom-0 right-0">
        <MuiSpeedDial>
          <SpeedDialHandler>
            <IconButton
              size="lg"
              className="rounded-full border-2 border-purple-500 shadow-xl"
            >
              <FaArrowsAlt className="h-5 w-5 transition-transform group-hover:rotate-45" />
            </IconButton>
          </SpeedDialHandler>
          <SpeedDialContent>
            <Tooltip
              className="border border-purple-500 rounded-full"
              animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0, y: 25 },
              }}
              placement="left"
              content="Aspiration"
            >
              <SpeedDialAction
                className="h-10 w-10 bg-black border border-purple-500 shadow-xl"
                onClick={() => navigate("/skkm/aspiration")}
              >
                <FaRegComment className="h-4 w-4" />
              </SpeedDialAction>
            </Tooltip>
            <Tooltip
              className="border border-purple-500 rounded-full"
              animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0, y: 25 },
              }}
              placement="left"
              content="Info Poin"
            >
              <SpeedDialAction
                className="h-10 w-10 bg-black border border-purple-500 shadow-xl"
                onClick={() => navigate("/skkm/info-poin")}
              >
                <FaRegStar className="h-4 w-4" />
              </SpeedDialAction>
            </Tooltip>
            <Tooltip
              className="border border-purple-500 rounded-full"
              animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0, y: 25 },
              }}
              placement="left"
              content="Notice"
            >
              <SpeedDialAction
                className="h-10 w-10 bg-black border border-purple-500 shadow-xl"
                onClick={() => navigate("/skkm/notice")}
              >
                <FaRegBell className="h-4 w-4" />
              </SpeedDialAction>
            </Tooltip>
            <Tooltip
              className="border border-purple-500 rounded-full"
              animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0, y: 25 },
              }}
              placement="left"
              content="Procedure"
            >
              <SpeedDialAction
                className="h-10 w-10 bg-black border border-purple-500 shadow-xl"
                onClick={() => navigate("/skkm/procedure")}
              >
                <FaSortAmountDownAlt className="h-4 w-4" />
              </SpeedDialAction>
            </Tooltip>
            <Tooltip
              className="border border-purple-500 rounded-full"
              animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0, y: 25 },
              }}
              placement="left"
              content="Timeline"
            >
              <SpeedDialAction
                className="h-10 w-10 bg-black border border-purple-500 shadow-xl"
                onClick={() => navigate("/skkm/timeline")}
              >
                <FaRegClock className="h-4 w-4" />
              </SpeedDialAction>
            </Tooltip>

            <Tooltip
              className="border border-purple-500 rounded-full"
              animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0, y: 25 },
              }}
              placement="left"
              content="Validation"
            >
              <SpeedDialAction
                className="h-10 w-10 bg-black border border-purple-500 shadow-xl"
                onClick={() => navigate("/skkm/validation")}
              >
                <FaCheckDouble className="h-4 w-4" />
              </SpeedDialAction>
            </Tooltip>
          </SpeedDialContent>
        </MuiSpeedDial>
      </div>
    </div>
  );
};

export default SpeedDial;
