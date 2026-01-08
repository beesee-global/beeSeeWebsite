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
    const drawerAnimationRef = useRef<NodeJS.Timeout | null>(null);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isShrunk, setIsShrunk] = useState(false);
    const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);

    /* Cleanup all refs and timeouts */
    useEffect(() => {
        return () => {
            [scrollTimeoutRef, drawerAnimationRef].forEach(ref => {
                if (ref.current) {
                    clearTimeout(ref.current);
                }
            });
        };
    }, []);

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

    /* Improved Drawer State Management */
    const handleOpenDrawer = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (isDrawerAnimating) return;
        
        setIsDrawerAnimating(true);
        setDrawerOpen(true);
        
        if (drawerAnimationRef.current) {
            clearTimeout(drawerAnimationRef.current);
        }
        
        drawerAnimationRef.current = setTimeout(() => {
            setIsDrawerAnimating(false);
        }, 350);
    }, [isDrawerAnimating]);

    const handleCloseDrawer = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        
        if (isDrawerAnimating) return;
        
        setIsDrawerAnimating(true);
        setDrawerOpen(false);
        
        if (drawerAnimationRef.current) {
            clearTimeout(drawerAnimationRef.current);
        }
        
        drawerAnimationRef.current = setTimeout(() => {
            setIsDrawerAnimating(false);
        }, 350);
    }, [isDrawerAnimating]);

    /* Improved Navigation - Fixed timing */
    const handleNavClick = useCallback(
        (target: string) => {
            if (isDrawerAnimating) return;
            
            handleCloseDrawer();

            setTimeout(() => {
                if (target.startsWith('#')) {
                    const sectionId = target.substring(1);
                    
                    if (location.pathname === '/') {
                        // Small delay to ensure drawer is fully closed
                        setTimeout(() => {
                            smoothScrollToElement(sectionId, 50);
                        }, 200);
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
            }, 350); // Wait for drawer close animation to complete
        },
        [location.pathname, navigate, smoothScrollToElement, isDrawerAnimating, handleCloseDrawer]
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

    /* Prevent body scroll when drawer is open - Optimized */
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [drawerOpen]);

    /* Handle click outside of drawer - Improved */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (isDrawerAnimating) return;
            
            if (drawerRef.current && 
                !drawerRef.current.contains(event.target as Node) && 
                drawerOpen) {
                handleCloseDrawer();
            }
        };

        if (drawerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [drawerOpen, isDrawerAnimating, handleCloseDrawer]);

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
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleNavClick('/')}
                        />
                    </Box>

                    {/* RIGHT NAV - Desktop */}
                    <Box className="hidden md:flex flex-1 justify-start">
                        <nav className="flex items-center gap-8 lg:gap-20 ml-8 lg:ml-20">
                            {navRight.map((item) => {
                                const active = location.pathname === item.to;
                                return (
                                    <Button
                                        key={item.label}
                                        disableRipple
                                        onClick={() => handleNavClick(item.to)}
                                        aria-label={`Navigate to ${item.label}`}
                                        className={`!flex !items-center !font-bold font-segoe tracking-wide !normal-case group relative !transition-all !duration-300 ${active ? '!text-[#FFD700]' : '!text-white'} ${
                                            isShrunk ? '!text-[0.75rem] lg:!text-[0.8rem]' : '!text-[0.9rem] lg:!text-[1rem]'
                                        }`}
                                    >
                                        <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-300 bg-[#FFD700] blur-xl rounded-full" />
                                        {item.label}
                                        <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-[#FFD700] rounded-full transition-all duration-300 ${
                                            active ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`} />
                                    </Button>
                                );
                            })}
                        </nav>
                    </Box>

                    {/* MOBILE MENU BUTTON - Fixed with better state management */}
                    <IconButton
                        edge="start"
                        onClick={handleOpenDrawer}
                        className="md:!hidden !text-white !ml-0"
                        aria-label="Open navigation menu"
                        disabled={isDrawerAnimating}
                        sx={{
                            opacity: drawerOpen ? 0 : 1,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: drawerOpen ? 'none' : 'auto',
                            position: 'relative',
                            zIndex: 50,
                            backgroundColor: 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&.Mui-disabled': {
                                opacity: 0.5,
                            }
                        }}
                    >
                        <MenuIcon fontSize="large" />
                    </IconButton>
                </Toolbar>
            </header>

            {/* MOBILE DRAWER - Fixed with proper layering and animations */}
            <AnimatePresence mode="wait">
                {drawerOpen && (
                    <>
                        {/* Backdrop - Fixed z-index */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] md:hidden"
                            onClick={handleCloseDrawer}
                            style={{ touchAction: 'none' }}
                        />
                        
                        {/* Drawer Container */}
                        <Drawer
                            anchor="left"
                            open={drawerOpen}
                            onClose={handleCloseDrawer}
                            ref={drawerRef}
                            variant="temporary"
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
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    zIndex: 9999,
                                    overflowY: 'auto',
                                    WebkitOverflowScrolling: 'touch',
                                },
                            }}
                            transitionDuration={300}
                            ModalProps={{
                                keepMounted: false,
                                disableScrollLock: true,
                                hideBackdrop: true,
                                closeAfterTransition: true,
                            }}
                            sx={{
                                position: 'fixed',
                                zIndex: 9999,
                                '& .MuiDrawer-paper': {
                                    zIndex: 9999,
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                },
                            }}
                            SlideProps={{
                                timeout: 300,
                            }}
                        >
                            {/* LOGO + CLOSE - Fixed with proper event handling */}
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-700 bg-[#181717] sticky top-0 z-10 min-h-[80px] flex-shrink-0">
                                <button
                                    onClick={() => handleNavClick('/')}
                                    className="focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50 rounded"
                                    aria-label="Navigate to home"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <img 
                                        src={beeseeGoldLogo} 
                                        className="w-[150px] h-auto" 
                                        alt="BeeSee Gold Logo"
                                        draggable="false"
                                    />
                                </button>

                                <div className="relative">
                                    <motion.div 
                                        whileHover={{ rotate: 90, scale: 1.15 }} 
                                        whileTap={{ scale: 0.85 }} 
                                        transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                                    >
                                        <IconButton 
                                            onClick={handleCloseDrawer} 
                                            className="!text-white" 
                                           
                                            aria-label="Close navigation menu"
                                            disabled={isDrawerAnimating}
                                        >
                                            <CloseIcon fontSize="medium" />
                                        </IconButton>
                                    </motion.div>
                                </div>
                            </div>

                            {/* NAV ITEMS - With optimized performance */}
                            <div className="flex-1 overflow-y-auto pt-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                                <nav>
                                    <List className="py-2">
                                        <AnimatePresence>
                                            {mobileNavItems.map((item, index) => {
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
                                                        style={{ willChange: 'transform, opacity' }}
                                                    >
                                                        <ListItem
                                                            onClick={() => handleNavClick(item.to)}
                                                            className={`
                                                                hover:!bg-[#2A2A2A] transition-all duration-300 
                                                                py-4 pl-6 cursor-pointer relative select-none
                                                                ${isActive ? '!bg-[#2A2A2A]' : ''}
                                                                active:!bg-[#3A3A3A]
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
                                                                minHeight: '56px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                userSelect: 'none',
                                                                WebkitTapHighlightColor: 'transparent',
                                                            }}
                                                            button
                                                            disabled={isDrawerAnimating}
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
                                                        </ListItem>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </List>
                                </nav>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-700 text-center text-gray-400 text-sm bg-[#181717] flex-shrink-0">
                                BeeSee Global Technologies
                            </div>
                        </Drawer>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default HeaderHomePage;