import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';

import logo2 from '../../../public/logo2.png';
import beeseeGoldLogo from '../../../public/beeseeGoldLogo.png';
import { X } from 'lucide-react';

const HeaderHomePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isInitialMount = useRef(true);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isShrunk, setIsShrunk] = useState(false);
    const [menuHover, setMenuHover] = useState(false);

    /* Reset menu hover state when drawer closes */
    useEffect(() => {
        if (!drawerOpen) {
            setMenuHover(false);
        }
    }, [drawerOpen]);

    /* Optimized Header Shrink */
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsShrunk(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* Smooth Scroll Helper */
    const smoothScrollToElement = useCallback(
        (sectionId: string, delay = 100) => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    const headerOffset = isShrunk ? 70 : 110;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth',
                    });
                }
                scrollTimeoutRef.current = null;
            }, delay);
        },
        [isShrunk]
    );

    /* Improved Navigation - Closes drawer immediately */
    const handleNavClick = useCallback(
        (target: string) => {
            setDrawerOpen(false);

            setTimeout(() => {
                if (target.startsWith('#')) {
                    const sectionId = target.substring(1);

                    if (location.pathname === '/') {
                        smoothScrollToElement(sectionId, 150);
                    } else {
                        sessionStorage.setItem('scrollAfterLoad', target);
                        navigate('/');
                    }
                } else {
                    navigate(target);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 50);
        },
        [location.pathname, navigate, smoothScrollToElement]
    );

    /* Handle scroll after page load */
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (location.pathname === '/') {
            const target = sessionStorage.getItem('scrollAfterLoad');
            if (target && target.startsWith('#')) {
                const sectionId = target.substring(1);
                sessionStorage.removeItem('scrollAfterLoad');
                smoothScrollToElement(sectionId, 400);
            }
        }
    }, [location.pathname, smoothScrollToElement]);

    /* Cleanup timeouts */
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    /* Navigation Items */
    const navLeft = [
        { label: 'ABOUT', to: '/about-beesee' },
        { label: 'SERVICES', to: '/solution' },
        { label: 'PRODUCTS', to: '/products' },
    ];

    const navRight = [
        { label: 'INQUIRIES', to: '#contact-section' },
        { label: 'FAQS', to: '/faqs' },
        { label: 'SUPPORT', to: '/customer-support' },
    ];

    const mobileNavItems = [{ label: 'HOME', to: '/' }, ...navLeft, ...navRight];

    return (
        <>
            {/* HEADER */}
            <header id="main-header" className="fixed top-0 left-0 right-0 z-50 bg-transparent sm:backdrop-blur-2xl transition-all duration-700 ease-in-out" role="banner">
                {!drawerOpen && (
                    <Toolbar className={`flex justify-between items-center w-full transition-all duration-700 ease-in-out ${isShrunk ? 'h-[60px] px-4 sm:px-6' : 'h-[100px] px-4 sm:px-6'}`}>
                        {/* LEFT NAV - Desktop */}
                        <Box className="hidden md:flex flex-1 justify-end">
                            <nav className="flex items-center gap-8 lg:gap-16 mr-8 lg:mr-20">
                                {navLeft.map((item) => {
                                    const active = location.pathname.startsWith(item.to);
                                    return (
                                        <Button
                                            key={item.label}
                                            disableRipple
                                            onClick={() => handleNavClick(item.to)}
                                            aria-label={`Navigate to ${item.label}`}
                                            className={`!font-bold font-segoe !normal-case relative group !transition-all !duration-300 ${active ? '!text-[#FFD700]' : '!text-white'} ${
                                                isShrunk ? '!text-[0.75rem] lg:!text-[0.8rem]' : '!text-[0.9rem] lg:!text-[1rem]'
                                            }`}
                                        >
                                            {item.label}
                                            <span
                                                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-[#FFD700] rounded-full transition-all duration-300 ${
                                                    active ? 'w-full' : 'w-0 group-hover:w-full'
                                                }`}
                                            />
                                        </Button>
                                    );
                                })}
                            </nav>
                        </Box>

                        {/* CENTER LOGO - Desktop Only */}
                        <Box className={`hidden md:flex flex-shrink-0 justify-center ${isShrunk ? 'py-1' : 'py-2 sm:py-4'}`}>
                            <img
                                src={logo2}
                                onClick={() => handleNavClick('/')}
                                className={`cursor-pointer transition-all duration-300 hover:brightness-125 hover:scale-105 ${isShrunk ? 'w-[40px]' : 'w-[78px]'}`}
                                alt="BeeSee Logo"
                                role="button"
                                aria-label="Navigate to home"
                            />
                        </Box>

                        {/* RIGHT NAV - Desktop */}
                        <Box className="hidden md:flex flex-1 justify-start">
                            <nav className="flex items-center gap-8 lg:gap-20 ml-8 lg:ml-20">
                                {navRight.map((item) => (
                                    <Button
                                        key={item.label}
                                        disableRipple
                                        onClick={() => handleNavClick(item.to)}
                                        aria-label={`Navigate to ${item.label}`}
                                        className={`!flex !items-center !font-bold font-segoe tracking-wide !normal-case group relative !transition-all !duration-300 !text-white ${
                                            isShrunk ? '!text-[0.75rem] lg:!text-[0.8rem]' : '!text-[0.9rem] lg:!text-[1rem]'
                                        }`}
                                    >
                                        <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-300 bg-[#FFD700] blur-xl rounded-full" />
                                        {item.label}
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-[#FFD700] rounded-full transition-all duration-300 w-0 group-hover:w-full" />
                                    </Button>
                                ))}
                            </nav>
                        </Box>

                        {/* MOBILE MENU BUTTON - Left Side - NO ANIMATION */}
                        <IconButton
                            edge="start"
                            onClick={() => setDrawerOpen(true)}
                            className="md:!hidden !text-white"
                            aria-label="Open navigation menu"
                        >
                            <MenuIcon fontSize="large" />
                        </IconButton>
                    </Toolbar>
                )}
            </header>

            {/* MOBILE DRAWER - Left Side */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: '#181717',
                        width: '280px',
                        maxWidth: '85vw',
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        boxShadow: '0 0 25px rgba(255,215,0,0.25), 0 0 40px rgba(255,215,0,0.15)',
                        borderRight: '1px solid rgba(255,215,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
                transitionDuration={{ enter: 350, exit: 250 }}
                ModalProps={{
                    keepMounted: false,
                }}
            >
                {/* LOGO + CLOSE */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-700   bg-[#181717] ">
                    <img src={beeseeGoldLogo} className="w-[170px] h-auto" alt="BeeSee Gold Logo" onClick={() => alert('hehe')} />

                    <motion.div whileHover={{ rotate: 90, scale: 1.15 }} whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 250, damping: 18 }}>
                        <IconButton onClick={() => setDrawerOpen(false)} className="!text-white !border" sx={{ p: '6px' }} aria-label="Close navigation menu">
                            <CloseIcon fontSize="medium" />
                        </IconButton>
                    </motion.div>
                </div>

                {/* NAV ITEMS */}

                <nav>
                    <List className="py-2">
                        {mobileNavItems.map((item, index) => {
                            const isActive = item.to.startsWith('#') ? false : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

                            return (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: drawerOpen ? index * 0.05 : 0,
                                        duration: 0.3,
                                        ease: 'easeOut',
                                    }}
                                >
                                    <ListItem
                                        onClick={() => handleNavClick(item.to)}
                                        className={`
                                            hover:!bg-[#2A2A2A] transition-all duration-300 
                                            py-4 pl-6 cursor-pointer relative
                                            ${isActive ? '!bg-[#2A2A2A]' : ''}
                                        `}
                                        sx={{
                                            '&::before': isActive
                                                ? {
                                                      content: '""',
                                                      position: 'absolute',
                                                      left: 0,
                                                      top: '50%',
                                                      transform: 'translateY(-50%)',
                                                      width: '4px',
                                                      height: '60%',
                                                      backgroundColor: '#FFD700',
                                                      borderRadius: '0 4px 4px 0',
                                                  }
                                                : {},
                                        }}
                                    >
                                        <ListItemText
                                            primary={item.label}
                                            sx={{
                                                '& .MuiListItemText-primary': {
                                                    fontSize: '1.05rem',
                                                    fontFamily: 'bebas, sans-serif',
                                                    letterSpacing: '0.05em',
                                                    fontWeight: isActive ? 600 : 400,
                                                    background: 'linear-gradient(to right, #fbbf24, #d97706)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                },
                                            }}
                                        />
                                    </ListItem>
                                </motion.div>
                            );
                        })}
                    </List>
                </nav>
            </Drawer>
        </>
    );
};

export default HeaderHomePage;