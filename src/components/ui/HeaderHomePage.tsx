import React, { useState, useEffect, useRef } from "react";
import {
    Toolbar,
    Button,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";

import { motion } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { useLocation, useNavigate } from "react-router-dom";

import logo2 from "../../../public/logo2.png";
import beeseeGoldLogo from "../../../public/beeseeGoldLogo.png";

const HeaderHomePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isInitialMount = useRef(true);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isShrunk, setIsShrunk] = useState(false);
    const [menuHover, setMenuHover] = useState(false);

    /* Header Shrink */
    useEffect(() => {
        const handleScroll = () => setIsShrunk(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* Improved Navigation Logic */
    const handleNavClick = (target: string) => {
        setDrawerOpen(false); // Close drawer first

        // If it's an anchor link (#section)
        if (target.startsWith("#")) {
            const sectionId = target.substring(1); // Remove the #
            
            if (location.pathname === "/") {
                // We're already on homepage, scroll smoothly to section
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        // Smooth scroll with offset for header
                        const headerOffset = isShrunk ? 60 : 100;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                }, 100);
            } else {
                // We're on another page, navigate to homepage first
                sessionStorage.setItem("scrollAfterLoad", target);
                navigate("/");
            }
        } else {
            // Regular page navigation
            navigate(target);
        }
    };

    /* After page load, scroll if needed */
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (location.pathname === "/") {
            const target = sessionStorage.getItem("scrollAfterLoad");
            if (target) {
                setTimeout(() => {
                    const sectionId = target.substring(1);
                    const element = document.getElementById(sectionId);
                    if (element) {
                        // Smooth scroll with offset
                        const headerOffset = isShrunk ? 60 : 100;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                        
                        sessionStorage.removeItem("scrollAfterLoad");
                    }
                }, 300); // Increased delay to ensure page is fully rendered
            }
        }
    }, [location.pathname, isShrunk]);

    /* Navigation Items */
    const navLeft = [
        { label: "ABOUT", to: "/about-beesee" },
        { label: "SERVICES", to: "/solution" },
        { label: "PRODUCTS", to: "/products" },
    ];

    const navRight = [
        { label: "INQUIRIES", to: "#contact-section" },
        { label: "FAQS", to: "/faqs" },
        { label: "SUPPORT", to: "/customer-support" },
    ];

    const mobileNavItems = [{ label: "HOME", to: "/" }, ...navLeft, ...navRight];

    return (
        <>
            {/* HEADER */}
            <div
                id="main-header"
                className={`
                    fixed top-0 left-0 right-0 z-50
                    bg-transparent sm:backdrop-blur-2xl
                    transition-all duration-700
                `}
            >
                <Toolbar
                    className={`
                        flex justify-between items-center w-full
                        transition-all duration-700
                        ${isShrunk ? "h-[60px] px-4" : "h-[100px] px-6"}
                    `}
                >
                    {/* LEFT NAV */}
                    <Box className="flex flex-1 justify-end">
                        <div className="hidden md:flex items-center gap-16 mr-20">
                            {navLeft.map((item) => {
                                const active = location.pathname.startsWith(item.to);
                                return (
                                    <Button
                                        key={item.label}
                                        disableRipple
                                        onClick={() => handleNavClick(item.to)}
                                        className={`
                                            !font-bold font-segoe !normal-case relative group
                                            ${active ? "!text-[#FFD700]" : "!text-white"}
                                            ${isShrunk ? "!text-[0.8rem]" : "!text-[1rem]"}
                                        `}
                                    >
                                        {item.label}
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#FFD700] rounded-full group-hover:w-full transition-all"></span>
                                    </Button>
                                );
                            })}
                        </div>
                    </Box>

                    {/* CENTER LOGO */}
                    <Box
                        className={`
                            hidden sm:flex flex-shrink-0 justify-center
                            ${isShrunk ? "py-1" : "py-4"}
                        `}
                    >
                        <img
                            src={logo2}
                            onClick={() => navigate("/")}
                            className={`
                                cursor-pointer transition-all
                                hover:brightness-125 hover:scale-105
                                ${isShrunk ? "w-[40px]" : "w-[78px]"}
                            `}
                            alt="BeeSee Logo"
                        />
                    </Box>

                    {/* RIGHT NAV */}
                    <Box className="flex flex-1 justify-start">
                        <div className="hidden md:flex items-center gap-20 ml-20">
                            {navRight.map((item) => (
                                <Button
                                    key={item.label}
                                    disableRipple
                                    onClick={() => handleNavClick(item.to)}
                                    className={`
                                        !flex !items-center !font-bold font-segoe tracking-wide !normal-case
                                        group relative transition-all duration-500
                                        !text-white
                                        ${isShrunk ? "!text-[0.8rem]" : "!text-[1rem]"}
                                    `}
                                >
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-300 bg-[#FFD700] blur-xl rounded-full"></span>
                                    {item.label}
                                    <span
                                        className={`
                                            absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px]
                                            bg-[#FFD700] rounded-full transition-all duration-300
                                            w-0 group-hover:w-full
                                        `}
                                    />
                                </Button>
                            ))}
                        </div>
                    </Box>

                    {/* ANIMATED BURGER */}
                    <IconButton
                        edge="end"
                        onClick={() => setDrawerOpen(true)}
                        className="sm:!hidden !text-white"
                        onMouseEnter={() => setMenuHover(true)}
                        onMouseLeave={() => setMenuHover(false)}
                    >
                        <motion.div
                            animate={menuHover ? { rotate: 10, scale: 1.15 } : { rotate: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 240, damping: 16 }}
                        >
                            <MenuIcon fontSize="large" />
                        </motion.div>
                    </IconButton>
                </Toolbar>
            </div>

            {/* MOBILE DRAWER */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: "#181717",
                        width: "260px",
                        maxWidth: "260px",
                        overflowX: "hidden",
                        boxShadow:
                            "0 0 25px rgba(255,215,0,0.25), 0 0 40px rgba(255,215,0,0.15)",
                        borderLeft: "1px solid rgba(255,215,0,0.2)",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
                transitionDuration={{ enter: 350, exit: 250 }}
            >
                {/* LOGO + CLOSE */}
                <div className="flex justify-between items-center px-6 py-6 border-b border-gray-700">
                    <img 
                        src={beeseeGoldLogo} 
                        className="w-[170px]" 
                        alt="BeeSee Gold Logo" 
                    />

                    <motion.div
                        whileHover={{ rotate: 90, scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 250, damping: 18 }}
                    >
                        <IconButton
                            onClick={() => setDrawerOpen(false)}
                            className="!text-white"
                            sx={{ p: "6px" }}
                        >
                            <CloseIcon fontSize="medium" />
                        </IconButton>
                    </motion.div>
                </div>

                {/* NAV ITEMS */}
                <List className="py-2">
                    {mobileNavItems.map((item) => (
                        <ListItem
                            key={item.label}
                            onClick={() => handleNavClick(item.to)}
                            className="hover:!bg-[#2A2A2A] transition-all duration-300 py-4 pl-6 cursor-pointer"
                        >
                            <ListItemText
                                primary={item.label}
                                className="
                                    text-white text-[1.05rem] tracking-wide font-bebas
                                    bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent
                                "
                            />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
};

export default HeaderHomePage;