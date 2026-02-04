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
  const drawerAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const savedScrollPosition = useRef<number>(0);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* Cleanup all refs and timeouts */
  useEffect(() => {
    return () => {
      [scrollTimeoutRef, drawerAnimationRef].forEach(ref => {
        if (ref.current) {
          clearTimeout(ref.current);
        }
      });
      
      // Ensure body styles are cleaned up
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('width');
      document.body.style.removeProperty('padding-right');
    };
  }, []);

  /* Optimized Header Shrink */
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

  /* Prevent body scroll when drawer is open */
  useEffect(() => {
    if (drawerOpen) {
      savedScrollPosition.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
    } else {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('height');
      document.body.style.removeProperty('touch-action');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('height');
      
      requestAnimationFrame(() => {
        window.scrollTo({
          top: savedScrollPosition.current,
          behavior: 'instant'
        });
      });
    }
    
    return () => {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('height');
      document.body.style.removeProperty('touch-action');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('height');
    };
  }, [drawerOpen]);

  /* Drawer Open Handler */
  const handleOpenDrawer = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isDrawerAnimating || drawerOpen) return;
    
    setIsDrawerAnimating(true);
    setDrawerOpen(true);
    
    if (drawerAnimationRef.current) {
      clearTimeout(drawerAnimationRef.current);
    }
    
    drawerAnimationRef.current = setTimeout(() => {
      setIsDrawerAnimating(false);
    }, 450);
  }, [isDrawerAnimating, drawerOpen]);

  /* Drawer Close Handler */
  const handleCloseDrawer = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (isDrawerAnimating || !drawerOpen) return;
    
    setIsDrawerAnimating(true);
    setDrawerOpen(false);
    
    if (drawerAnimationRef.current) {
      clearTimeout(drawerAnimationRef.current);
    }
    
    drawerAnimationRef.current = setTimeout(() => {
      setIsDrawerAnimating(false);
    }, 450);
  }, [isDrawerAnimating, drawerOpen]);

  /* Navigation Handler */
  const handleNavClick = useCallback(
    (target: string) => {
      if (isDrawerAnimating) return;
      
      if (drawerOpen) {
        setIsDrawerAnimating(true);
        setDrawerOpen(false);
        
        setTimeout(() => {
          setIsDrawerAnimating(false);
          setTimeout(() => {
            performNavigation(target);
          }, 50);
        }, 450);
      } else {
        performNavigation(target);
      }
    },
    [drawerOpen, isDrawerAnimating]
  );

  /* Helper function for navigation */
  const performNavigation = (target: string) => {
    if (target.startsWith('#')) {
      const sectionId = target.substring(1);
      
      if (location.pathname === '/') {
        setTimeout(() => {
          smoothScrollToElement(sectionId, 50);
        }, 100);
      } else {
        sessionStorage.setItem('scrollAfterLoad', target);
        navigate('/');
      }
    } else if (target.startsWith('http')) {
      window.open(target, '_blank');
    } else {
      navigate(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
        
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('height');
        document.body.style.removeProperty('touch-action');
        document.documentElement.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('height');
        
        setTimeout(() => {
          smoothScrollToElement(sectionId, 100);
        }, 600);
      }
    }
  }, [location.pathname, smoothScrollToElement]);

  /* Handle click outside drawer */
  useEffect(() => {
    if (!drawerOpen || isDrawerAnimating) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      const isBackdrop = target.classList.contains('backdrop-click-area');
      const drawerElement = document.querySelector('.MuiDrawer-paper');
      
      if (isBackdrop || (drawerElement && !drawerElement.contains(target))) {
        handleCloseDrawer();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [drawerOpen, isDrawerAnimating, handleCloseDrawer]);

  /* SWIPE GESTURE HANDLING */
  useEffect(() => {
    const minSwipeDistance = 50;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (isDrawerAnimating) return;
      
      const touch = e.touches[0];
      setTouchStart(touch.clientX);
      setTouchStartY(touch.clientY);
      setTouchEnd(null);
      setIsSwiping(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart || !touchStartY || isDrawerAnimating) return;
      
      const touch = e.touches[0];
      setTouchEnd(touch.clientX);
      
      const xDiff = Math.abs(touch.clientX - touchStart);
      const yDiff = Math.abs(touch.clientY - touchStartY);
      
      if (xDiff > yDiff && xDiff > 10) {
        setIsSwiping(true);
      }
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd || !touchStartY || isDrawerAnimating) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (Math.abs(distance) > minSwipeDistance && isSwiping) {
        if (drawerOpen && isLeftSwipe) {
          handleCloseDrawer();
        } else if (!drawerOpen && isRightSwipe && touchStart < 50) {
          handleOpenDrawer({ stopPropagation: () => {}, preventDefault: () => {} } as React.MouseEvent);
        }
      }
      
      setTouchStart(null);
      setTouchEnd(null);
      setTouchStartY(null);
      setIsSwiping(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [drawerOpen, isDrawerAnimating, handleCloseDrawer, handleOpenDrawer, touchStart, touchEnd, touchStartY, isSwiping]);

  /* Navigation Items */
  const navLeft = [
    { label: 'ABOUT', to: '/about-beesee' },
    { label: 'PRODUCTS', to: '/products' },
    { label: 'SERVICES', to: '/solution' },
  ];

  const navRight = [
    { label: 'INQUIRIES', to: '/inquiries' },
    { label: 'FAQS', to: '/faqs' },
    { label: 'SUPPORT', to: '/customer-support' },
  ];

  const mobileNavItems = [{ label: 'HOME', to: '/' }, ...navLeft, ...navRight];

  return (
    <>
      {/* DESKTOP HEADER - Only show on desktop */}
      {!isMobile && (
        <header 
          id="main-header" 
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out bg-transparent backdrop-blur-2xl"
          role="banner"
        >
          <Toolbar 
            className={`flex justify-between items-center w-full transition-all duration-700 ease-in-out ${
              isShrunk ? 'h-[60px] px-4 sm:px-6' : 'h-[100px] px-4 sm:px-6'
            }`}
          >
            {/* LEFT NAV */}
            <Box className="flex flex-1 justify-end">
              <nav className="flex items-center gap-8 lg:gap-16 mr-8 lg:mr-20">
                {navLeft.map((item) => {
                  const active = location.pathname.startsWith(item.to);
                  return (
                    <Button
                      key={item.label}
                      disableRipple
                      onClick={() => handleNavClick(item.to)}
                      aria-label={`Navigate to ${item.label}`}
                      className={`!font-bold font-segoe !normal-case relative group !transition-all !duration-300 ${
                        active ? '!text-[#FFD700]' : '!text-white'
                      } ${isShrunk ? '!text-[0.75rem] lg:!text-[0.8rem]' : '!text-[0.9rem] lg:!text-[1rem]'}`}
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

            {/* CENTER LOGO */}
            <Box className={`flex flex-shrink-0 justify-center ${isShrunk ? 'py-1' : 'py-2 sm:py-4'}`}>
              <img
                src={logo2}
                onClick={() => handleNavClick('/')}
                className={`cursor-pointer transition-all duration-300 hover:brightness-125 hover:scale-105 ${
                  isShrunk ? 'w-[40px]' : 'w-[78px]'
                }`}
                alt="BeeSee Logo"
                role="button"
                aria-label="Navigate to home"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavClick('/')}
              />
            </Box>

            {/* RIGHT NAV */}
            <Box className="flex flex-1 justify-start">
              <nav className="flex items-center gap-8 lg:gap-20 ml-8 lg:ml-20">
                {navRight.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <Button
                      key={item.label}
                      disableRipple
                      onClick={() => handleNavClick(item.to)}
                      aria-label={`Navigate to ${item.label}`}
                      className={`!flex !items-center !font-bold font-segoe tracking-wide !normal-case group relative !transition-all !duration-300 ${
                        active ? '!text-[#FFD700]' : '!text-white'
                      } ${isShrunk ? '!text-[0.75rem] lg:!text-[0.8rem]' : '!text-[0.9rem] lg:!text-[1rem]'}`}
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
          </Toolbar>
        </header>
      )}

      {/* MOBILE MENU BUTTON - FLOATING */}
      {isMobile && !drawerOpen && (
        <IconButton
          onClick={handleOpenDrawer}
          disabled={isDrawerAnimating || drawerOpen}
          aria-label="Open navigation menu"
          className="!text-white"
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 10000,
            opacity: drawerOpen ? 0 : 1,
            transition: 'opacity 0.2s ease',
            pointerEvents: drawerOpen ? 'none' : 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
            },
            '&:active': {
              backgroundColor: 'rgba(255, 215, 0, 0.3)',
            },
          }}
        >
          <MenuIcon fontSize="large" />
        </IconButton>
      )}

      {/* MOBILE DRAWER */}
      <AnimatePresence mode="wait">
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              className="backdrop-click-area fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] md:hidden"
              onClick={handleCloseDrawer}
              style={{ 
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            />
            
            {/* Drawer */}
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={handleCloseDrawer}
              variant="temporary"
              PaperProps={{
                sx: {
                  backgroundColor: '#181717',
                  width: '280px',
                  maxWidth: '85vw',
                  boxShadow: '0 0 25px rgba(255,215,0,0.25)',
                  borderRight: '1px solid rgba(255,215,0,0.2)',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  zIndex: 9999,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
              transitionDuration={450}
              ModalProps={{
                keepMounted: false,
                disableScrollLock: true,
                hideBackdrop: true,
                closeAfterTransition: true,
                disablePortal: false,
              }}
              sx={{
                zIndex: 9999,
                '& .MuiDrawer-paper': {
                  transition: 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1) !important',
                },
              }}
            >
              {/* LOGO + CLOSE */}
              <Box className="flex justify-between items-center px-6 py-5 border-b border-gray-700 bg-[#181717] sticky top-0 z-10 min-h-[80px]">
                <button
                  onClick={() => handleNavClick('/')}
                  className="focus:outline-none focus:ring-2 focus:ring-[#FFD700] rounded"
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

                <motion.div 
                  whileHover={{ rotate: 90, scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
              </Box>

              {/* NAV ITEMS */}
              <Box className="flex-1 overflow-y-auto pt-2">
                <List className="py-2">
                  {mobileNavItems.map((item, index) => {
                    const isActive = item.to.startsWith('#') 
                      ? false 
                      : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.25,
                          ease: 'easeOut',
                        }}
                      >
                        <ListItem
                          onClick={() => handleNavClick(item.to)}
                          className={`
                            hover:!bg-[#2A2A2A] transition-all duration-200
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
                            minHeight: '56px',
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
                                transition: 'all 0.2s ease',
                              },
                            }}
                          />
                        </ListItem>
                      </motion.div>
                    );
                  })}
                </List>
              </Box>

              {/* Footer */}
              <Box className="p-4 border-t border-gray-700 text-center text-gray-400 text-sm bg-[#181717]">
                BeeSee Global Technologies
              </Box>
            </Drawer>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeaderHomePage;