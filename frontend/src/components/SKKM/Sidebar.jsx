import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";
import { sun, logoloading } from "@assets";
import { navlinks } from "@constants";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";

const Sidebar = ({ role, isSuperAdmin, isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleThemeToggle = () => {
    const html = document.documentElement;
    const theme = localStorage.getItem("theme");

    if (theme === "dark" || !theme) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const filteredNavlinks = navlinks.filter(
    (link) =>
      link.role === null ||
      (Array.isArray(link.role) && link.role.includes(role)) ||
      (isSuperAdmin && link.role.includes(3))
  );

  const isActiveLink = (link) => {
    if (link.link.includes("*")) {
      return location.pathname.startsWith(link.link.replace("*", ""));
    }
    return location.pathname === link.link;
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full ${
        isCollapsed ? "w-28" : "w-[16rem]"
      } bg-dark-sidebar dark:bg-light-sidebar shadow-xl shadow-blue-gray-900/5 transition-all duration-300`}
    >
      <Card className="h-full p-4 bg-dark-sidebar dark:bg-light-sidebar">
        <div className="mb-2 p-4 flex items-center justify-between">
          <Link to="/skkm">
            <img src={logoloading} alt="logo" className="w-12 h-12" />
          </Link>
          {!isCollapsed && (
            <Typography className="mr-10" variant="h5" color="white">
              SKKM
            </Typography>
          )}
          <button
            onClick={toggleCollapse}
            className={`absolute rounded-l-none rounded-r-full p-5 pl-0 bg-dark-sidebar dark:bg-light-sidebar focus:outline-none ${
              isCollapsed && "top-2"
            }`}
            style={{ right: "-20px" }}
          >
            {isCollapsed ? (
              <ChevronDoubleRightIcon className="w-5 h-5 text-white dark:text-gray-800" />
            ) : (
              <ChevronDoubleLeftIcon className="w-5 h-5 text-white dark:text-gray-800" />
            )}
          </button>
        </div>
        <hr className="my-2 border-purple-400" />
        <List className="flex-1">
          {filteredNavlinks.map((link) => (
            <ListItem
              key={link.name}
              onClick={() => {
                if (!link.disabled) {
                  navigate(link.link.replace("*", ""));
                }
              }}
              className={`${
                isActiveLink(link)
                  ? "bg-dark-primary dark:bg-dark-primary hover:text-black hover:bg-white"
                  : "hover:bg-white hover:text-black"
              } cursor-pointer items-center text-white ${
                isCollapsed ? "justify-center w-1/3 pr-0" : "w-52"
              }`}
            >
              <ListItemPrefix>
                <img src={link.imgUrl} alt={link.name} className="h-6 w-6" />
              </ListItemPrefix>
              <span
                className={`flex-grow ${isCollapsed ? "hidden" : "block"} ml-2`}
              >
                {link.name}
              </span>
            </ListItem>
          ))}
        </List>
        <hr className="my-2 border-purple-400" />
        <List className="flex-2">
          <ListItem
            onClick={handleThemeToggle}
            className={`cursor-pointer flex items-center shadow-secondary text-white hover:text-black hover:bg-white ${
              isCollapsed ? "justify-center w-1/3 pr-0" : "w-52"
            }`}
          >
            <ListItemPrefix>
              <img src={sun} alt="theme-toggle" className="h-6 w-6" />
            </ListItemPrefix>
            <span
              className={`flex-grow ${isCollapsed ? "hidden" : "block"} ml-2 `}
            >
              Theme Toggle
            </span>
          </ListItem>
        </List>
      </Card>
    </div>
  );
};

export default Sidebar;
