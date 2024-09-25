import React from "react";
import { logoloading } from "@assets";

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loading-icon">
        <img src={logoloading} alt="Loading" className="logo" />
        <div className="rotating-circle red"></div>
        <div className="rotating-circle green"></div>
        <div className="rotating-circle blue"></div>
        <div className="rotating-circle yellow"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
