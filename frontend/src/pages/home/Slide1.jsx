import React from "react";
import Hero from "@components/home/Hero";
import ButtonGradient from "@assets/home/svg/ButtonGradient";

const Slide1 = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow">
        <Hero />
      </div>
      <ButtonGradient />
    </div>
  );
};

export default Slide1;
