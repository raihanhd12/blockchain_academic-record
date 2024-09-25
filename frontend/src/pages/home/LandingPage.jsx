import React, { useState, useEffect, useCallback } from "react";
import { FaHome, FaUsers, FaStar } from "react-icons/fa";
import Slide1 from "./Slide1";
import Slide2 from "./Slide2";
import Slide3 from "./Slide3";
import Header from "@components/home/Header";
import Footer from "@components/home/Footer";

const slides = [
  {
    name: "Home",
    content: <Slide1 />,
    bgImage: "/path-to-your-background-1.jpg",
    indicator: <FaHome className="text-1xl text-gray-200" />,
    activeIndicator: <FaHome className="text-1xl text-red-500" />,
    hoverBgColor: "hover:bg-red-500",
    hash: "#home",
  },
  {
    name: "Benefits",
    content: <Slide2 />,
    bgImage: "/path-to-your-background-2.jpg",
    indicator: <FaStar className="text-1xl text-gray-200" />,
    activeIndicator: <FaStar className="text-1xl text-blue-500" />,
    hoverBgColor: "hover:bg-blue-500",
    hash: "#benefits",
  },
  {
    name: "Collaboration",
    content: <Slide3 />,
    bgImage: "/path-to-your-background-3.jpg",
    indicator: <FaUsers className="text-1xl text-gray-200" />,
    activeIndicator: <FaUsers className="text-1xl text-green-500" />,
    hoverBgColor: "hover:bg-green-500",
    hash: "#Collaboration",
  },
  // {
  //   name: "Contact",
  //   content: "Slide 4",
  //   bgImage: "/path-to-your-background-4.jpg",
  //   indicator: <FaCircle className="text-1xl text-gray-800" />,
  //   activeIndicator: <FaDotCircle className="text-1xl text-blue-300" />,
  //   hoverBgColor: "hover:bg-blue-300",
  //   hash: "#contact",
  // },
];

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 200); // Adjust delay to match the debounce delay
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 200); // Adjust delay to match the debounce delay
  }, []);

  const debouncedNextSlide = useCallback(debounce(nextSlide, 200), [nextSlide]);
  const debouncedPrevSlide = useCallback(debounce(prevSlide, 200), [prevSlide]);

  useEffect(() => {
    const handleScroll = (event) => {
      if (isScrolling) return; // Ignore if a scroll is already in progress
      if (event.deltaY > 0 && currentSlide < slides.length - 1) {
        debouncedNextSlide();
      } else if (event.deltaY < 0 && currentSlide > 0) {
        debouncedPrevSlide();
      }
    };

    const handleTouchStart = (event) => {
      setTouchStartY(event.touches[0].clientY);
    };

    const handleTouchMove = (event) => {
      if (!touchStartY || isScrolling) return; // Ignore if a scroll is already in progress
      const touchEndY = event.touches[0].clientY;
      const touchDiff = touchStartY - touchEndY;

      if (touchDiff > 50 && currentSlide < slides.length - 1) {
        debouncedNextSlide();
      } else if (touchDiff < -50 && currentSlide > 0) {
        debouncedPrevSlide();
      }
      setTouchStartY(null);
    };

    window.addEventListener("wheel", handleScroll);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [
    currentSlide,
    debouncedNextSlide,
    debouncedPrevSlide,
    touchStartY,
    isScrolling,
  ]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const slideIndex = slides.findIndex((slide) => slide.hash === hash);
      if (slideIndex !== -1) {
        setCurrentSlide(slideIndex);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Call once on mount to set the initial slide

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    window.location.hash = slides[currentSlide].hash;
  }, [currentSlide]);

  const handleIndicatorClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Header />
      <div
        className="absolute inset-0 pt-[4.75rem] lg:pt-[5.25rem] flex flex-col transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateY(-${currentSlide * 100}vh)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          >
            {slide.content}
          </div>
        ))}
      </div>
      <div
        className={`absolute bottom-0 w-full footer-transition ${
          currentSlide === slides.length - 1 ? "footer-transition-active" : ""
        }`}
      >
        <Footer />
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 items-end indicator-container group">
        {slides.map((slide, index) => (
          <div
            key={index}
            onClick={() => handleIndicatorClick(index)}
            className={`relative cursor-pointer transform transition-transform duration-300 hover:scale-125 flex items-center ${
              currentSlide === index ? "block" : "hidden group-hover:flex"
            }`}
          >
            <span className="mr-5">{slide.name}</span>
            {currentSlide === index ? (
              slide.activeIndicator
            ) : (
              <div
                className={`relative transform duration-400 flex items-center p-2 rounded-full transition-all ${slide.hoverBgColor}`}
              >
                {slide.indicator}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
