"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";

const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
  });

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();

  return (
    <>
      <header
        className={`header top-0 left-0 z-40 flex w-full items-center ${
          sticky
            ? "dark:bg-gray-dark dark:shadow-sticky-dark shadow-sticky fixed z-9999 bg-white/80 backdrop-blur-xs transition"
            : "absolute bg-transparent"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4 xl:mr-12">
              <Link
                href="/"
                className={`header-logo block w-full ${
                  sticky ? "py-5 lg:py-2" : "py-8"
                } `}
              >
                {/* DeveloperShield Logo */}
                <div className="flex items-center space-x-2">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    {/* Shield with house and security elements */}
                    <g filter="url(#filter0_d)">
                      {/* Shield background */}
                      <path
                        d="M30 5L50 15V25C50 35 40 45 30 50C20 45 10 35 10 25V15L30 5Z"
                        fill="url(#shieldGradient)"
                        stroke="#4A6CF7"
                        strokeWidth="1.5"
                      />

                      {/* House inside shield */}
                      <g transform="translate(20, 20)">
                        {/* House structure */}
                        <path
                          d="M5 15L15 8L25 15V22H5V15Z"
                          fill="url(#houseGradient)"
                          stroke="#FFFFFF"
                          strokeWidth="0.8"
                        />
                        {/* Roof */}
                        <path
                          d="M5 15L15 8L25 15"
                          stroke="#FFFFFF"
                          strokeWidth="1.2"
                          fill="none"
                        />
                        {/* Windows */}
                        <rect
                          x="8"
                          y="12"
                          width="3"
                          height="3"
                          fill="url(#windowGradient)"
                          stroke="#FFFFFF"
                          strokeWidth="0.3"
                        />
                        <rect
                          x="19"
                          y="12"
                          width="3"
                          height="3"
                          fill="url(#windowGradient)"
                          stroke="#FFFFFF"
                          strokeWidth="0.3"
                        />
                        {/* Door */}
                        <rect
                          x="13"
                          y="15"
                          width="4"
                          height="7"
                          fill="url(#doorGradient)"
                          stroke="#FFFFFF"
                          strokeWidth="0.3"
                        />
                      </g>

                      {/* Security lock icon */}
                      <g transform="translate(25, 8)">
                        <circle
                          cx="5"
                          cy="5"
                          r="3"
                          fill="url(#lockGradient)"
                          stroke="#FFFFFF"
                          strokeWidth="0.5"
                        />
                        <rect
                          x="3"
                          y="5"
                          width="4"
                          height="3"
                          fill="url(#lockGradient)"
                          stroke="#FFFFFF"
                          strokeWidth="0.3"
                        />
                      </g>

                      {/* Transparency overlay */}
                      <path
                        d="M30 5L50 15V25C50 35 40 45 30 50C20 45 10 35 10 25V15L30 5Z"
                        fill="url(#transparencyGradient)"
                        opacity="0.2"
                      />
                    </g>

                    {/* Advanced Gradients */}
                    <defs>
                      <linearGradient
                        id="shieldGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#4A6CF7"
                          stopOpacity="0.95"
                        />
                        <stop
                          offset="50%"
                          stopColor="#3B82F6"
                          stopOpacity="0.9"
                        />
                        <stop
                          offset="100%"
                          stopColor="#1E40AF"
                          stopOpacity="0.85"
                        />
                      </linearGradient>
                      <linearGradient
                        id="houseGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#FFFFFF"
                          stopOpacity="0.9"
                        />
                        <stop
                          offset="100%"
                          stopColor="#E5E7EB"
                          stopOpacity="0.8"
                        />
                      </linearGradient>
                      <linearGradient
                        id="windowGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#FFFFFF"
                          stopOpacity="0.9"
                        />
                        <stop
                          offset="100%"
                          stopColor="#F3F4F6"
                          stopOpacity="0.7"
                        />
                      </linearGradient>
                      <linearGradient
                        id="doorGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#4A6CF7"
                          stopOpacity="0.8"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
                          stopOpacity="0.6"
                        />
                      </linearGradient>
                      <linearGradient
                        id="lockGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity="0.9"
                        />
                        <stop
                          offset="100%"
                          stopColor="#059669"
                          stopOpacity="0.8"
                        />
                      </linearGradient>
                      <linearGradient
                        id="transparencyGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#FFFFFF"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#4A6CF7"
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                      <filter
                        id="filter0_d"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        filterUnits="userSpaceOnUse"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        />
                        <feOffset dy="3" />
                        <feGaussianBlur stdDeviation="3" />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_dropShadow"
                          result="shape"
                        />
                      </filter>
                    </defs>
                  </svg>

                  {/* Logo Text */}
                  <span className="text-xl font-bold tracking-wide text-black dark:text-white">
                    DeveloperShield
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="ring-primary absolute top-1/2 right-4 block translate-y-[-50%] rounded-lg px-3 py-[6px] focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "top-[7px] rotate-45" : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "opacity-0" : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "top-[-8px] -rotate-45" : " "
                    }`}
                  />
                </button>
                <nav
                  id="navbarCollapse"
                  className={`navbar border-body-color/50 dark:border-body-color/20 dark:bg-dark absolute right-0 z-30 w-[250px] rounded border-[.5px] bg-white px-6 py-4 duration-300 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:flex lg:space-x-12">
                    {menuData.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            className={`flex py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ${
                              usePathName === menuItem.path
                                ? "text-primary dark:text-white"
                                : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                            }`}
                          >
                            {menuItem.title}
                          </Link>
                        ) : (
                          <>
                            <p
                              onClick={() => handleSubmenu(index)}
                              className="text-dark group-hover:text-primary flex cursor-pointer items-center justify-between py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 dark:text-white/70 dark:group-hover:text-white"
                            >
                              {menuItem.title}
                              <span className="pl-3">
                                <svg width="25" height="24" viewBox="0 0 25 24">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </p>
                            <div
                              className={`submenu dark:bg-dark relative top-full left-0 rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                                openIndex === index ? "block" : "hidden"
                              }`}
                            >
                              {menuItem.submenu.map((submenuItem, index) => (
                                <Link
                                  href={submenuItem.path}
                                  key={index}
                                  className="text-dark hover:text-primary block rounded-sm py-2.5 text-sm lg:px-3 dark:text-white/70 dark:hover:text-white"
                                >
                                  {submenuItem.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="flex items-center justify-end pr-16 lg:pr-0">
                <Link
                  href="/signin"
                  className="text-dark hidden px-7 py-3 text-base font-medium hover:opacity-70 md:block dark:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="ease-in-up shadow-btn hover:shadow-btn-hover bg-primary hover:bg-primary/90 hidden rounded-xs px-8 py-3 text-base font-medium text-white transition duration-300 md:block md:px-9 lg:px-6 xl:px-9"
                >
                  Sign Up
                </Link>
                <div>
                  <ThemeToggler />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
