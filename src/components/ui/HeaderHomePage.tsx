import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';

import logo2 from '../../../public/logo2.png';
import beeseeGoldLogo from '../../../public/beeseeGoldLogo.png';

const HeaderHomePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isInitialMount = useRef(true);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isShrunk, setIsShrunk] = useState(false);

    /* Optimized Header Shrink - Debounced */
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            setIsShrunk(lastScrollY > 20);
            ticking = false;
        };

        const handleScroll = () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* Smooth Scroll Helper - Fixed */
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

    /* Improved Navigation - Fixed timing */
    const handleNavClick = useCallback(
        (target: string) => {
            setDrawerOpen(false);

            setTimeout(() => {
                if (target.startsWith('#')) {
                    const sectionId = target.substring(1);
                    
                    if (location.pathname === '/') {
                        // Small delay to ensure drawer is closed
                        setTimeout(() => {
                            smoothScrollToElement(sectionId, 50);
                        }, 100);
                    } else {
                        sessionStorage.setItem('scrollAfterLoad', target);
                        navigate('/');
                    }
                } else if (target.startsWith('http')) {
                    // External links
                    window.open(target, '_blank');
                } else {
                    navigate(target);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 300); // Wait for drawer close animation
        },
        [location.pathname, navigate, smoothScrollToElement]
    );

    /* Handle scroll after page load - Improved */
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
                
                // Delay to ensure page is fully loaded
                setTimeout(() => {
                    smoothScrollToElement(sectionId, 500);
                }, 300);
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

    /* Prevent body scroll when drawer is open */
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [drawerOpen]);

    /* Navigation Items */
    const navLeft = [
        { label: 'ABOUT', to: '/about-beesee' },
        { label: 'SERVICES', to: '/solution' },
        { label: 'PRODUCTS', to: '/products' },
    ];

    const navRight = [
        { label: 'INQUIRIES', to: '#contact-section' },
        { label: 'FAQS', to: '/faqs' },
        { label: 'SUPPORT', to: 'http://192.168.1.104:5173/customer-support', external: true },
    ];

    const mobileNavItems = [{ label: 'HOME', to: '/' }, ...navLeft, ...navRight];

    const handleCloseDrawer = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setDrawerOpen(false);
    }, []);

    const handleOpenDrawer = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setDrawerOpen(true);
    }, []);

    /* Handle click outside of drawer */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && 
                !drawerRef.current.contains(event.target as Node) && 
                drawerOpen) {
                setDrawerOpen(false);
            }
        };

        if (drawerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [drawerOpen]);

    return (
        <>
            {/* HEADER - Always visible */}
            <header id="main-header" className="fixed top-0 left-0 right-0 z-50 bg-transparent sm:backdrop-blur-2xl transition-all duration-700 ease-in-out" role="banner">
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

                    {/* MOBILE MENU BUTTON - Fixed positioning and z-index */}
                    <IconButton
                        edge="start"
                        onClick={handleOpenDrawer}
                        className="md:!hidden !text-white !ml-0 !z-50"
                        aria-label="Open navigation menu"
                        sx={{
                            opacity: drawerOpen ? 0 : 1,
                            transition: 'opacity 0.2s ease',
                            pointerEvents: drawerOpen ? 'none' : 'auto',
                            position: 'relative',
                            zIndex: 9999,
                            backgroundColor: drawerOpen ? 'transparent' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }
                        }}
                    >
                        <MenuIcon fontSize="large" />
                    </IconButton>
                </Toolbar>
            </header>

            {/* MOBILE DRAWER - Fixed with proper layering */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleCloseDrawer}
                ref={drawerRef}
                PaperProps={{
                    sx: {
                        backgroundColor: '#181717',
                        width: '280px',
                        maxWidth: '85vw',
                        overflowX: 'hidden',
                        boxShadow: '0 0 25px rgba(255,215,0,0.25), 0 0 40px rgba(255,215,0,0.15)',
                        borderRight: '1px solid rgba(255,215,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 9999,
                        position: 'relative',
                    },
                }}
                transitionDuration={300}
                ModalProps={{
                    keepMounted: false,
                    disableScrollLock: true,
                    style: {
                        zIndex: 9998,
                    }
                }}
                sx={{
                    zIndex: 9999,
                    '& .MuiDrawer-paper': {
                        zIndex: 9999,
                    },
                    '& .MuiBackdrop-root': {
                        zIndex: 9998,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(3px)',
                    }
                }}
            >
                {/* LOGO + CLOSE - Fixed with proper spacing and click area */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-700 bg-[#181717] sticky top-0 z-50 min-h-[80px]">
                    <img 
                        src={beeseeGoldLogo} 
                        className="w-[150px] h-auto cursor-pointer" 
                        alt="BeeSee Gold Logo" 
                        onClick={() => handleNavClick('/')}
                        style={{ 
                            pointerEvents: 'auto',
                            maxWidth: '150px',
                        }}
                    />

                    <div 
                        className="relative"
                        style={{ 
                            width: '40px', 
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <motion.div 
                            whileHover={{ rotate: 90, scale: 1.15 }} 
                            whileTap={{ scale: 0.85 }} 
                            transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <IconButton 
                                onClick={handleCloseDrawer} 
                                className="!text-white" 
                                sx={{ 
                                    p: 1,
                                    width: '40px',
                                    height: '40px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 215, 0, 0.15)',
                                    },
                                    '&:active': {
                                        backgroundColor: 'rgba(255, 215, 0, 0.25)',
                                    },
                                    position: 'relative',
                                    zIndex: 10000,
                                }} 
                                aria-label="Close navigation menu"
                            >
                                <CloseIcon fontSize="medium" />
                            </IconButton>
                        </motion.div>
                    </div>
                </div>

                {/* NAV ITEMS - With proper spacing */}
                <div className="flex-1 overflow-y-auto pt-2">
                    <nav>
                        <List className="py-2">
                            <AnimatePresence>
                                {drawerOpen && mobileNavItems.map((item, index) => {
                                    const isActive = item.to.startsWith('#') 
                                        ? false 
                                        : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

                                    return (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.3,
                                                ease: 'easeOut',
                                            }}
                                        >
                                            <ListItem
                                                onClick={() => {
                                                    if (!item.external) {
                                                        handleNavClick(item.to);
                                                    } else {
                                                        window.open(item.to, '_blank');
                                                        handleCloseDrawer();
                                                    }
                                                }}
                                                className={`
                                                    hover:!bg-[#2A2A2A] transition-all duration-300 
                                                    py-4 pl-6 cursor-pointer relative select-none
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
                                                    '&:active': {
                                                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                                        transform: 'scale(0.98)',
                                                    },
                                                    minHeight: '56px',
                                                    display: 'flex',
                                                    alignItems: 'center',
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
                                                            background: isActive 
                                                                ? 'linear-gradient(to right, #FFD700, #FFA500)' 
                                                                : 'linear-gradient(to right, #fbbf24, #d97706)',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                            backgroundClip: 'text',
                                                            transition: 'all 0.3s ease',
                                                        },
                                                    }}
                                                />
                                                {item.external && (
                                                    <span className="ml-2 text-xs text-gray-400">↗</span>
                                                )}
                                            </ListItem>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </List>
                    </nav>
                </div>

                {/* Optional: Add a footer or extra info */}
                <div className="p-4 border-t border-gray-700 text-center text-gray-400 text-sm">
                    BeeSee Global Technologies
                </div>
            </Drawer>
        </>
    );
};

export default HeaderHomePage;