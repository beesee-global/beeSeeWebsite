import React, { useState, useMemo, useEffect } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { SxProps } from '@mui/system';
import Avatar from '@mui/material/Avatar';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { userAuth } from '../../hooks/userAuth';
import { useNavigate } from 'react-router-dom';
import { fetchUserById } from '../../services/Technician/myAccountServices';
import { useQuery } from '@tanstack/react-query';
import beeseeGoldLogo from '../../../public/beeseeGoldLogo.png';
import { Menu } from 'lucide-react';
import { io } from 'socket.io-client';

interface UserData {
    first_name: string;
    last_name: string;
    image?: File | string | null;
    role: string;
}

const NavigationTechnician = () => {
    const { userInfo, logout, setUserNav } = userAuth();
    const navigate = useNavigate();
    const [notification, setNotification] = useState<any[]>([]);

    const id = userInfo?.id;

    const [openAccount, setOpenAccount] = React.useState(false);
    const [openNotification, setOpenNotification] = React.useState(false);

    const handleClick = () => {
        setOpenAccount((prev) => !prev);
    };

    const handleClickAway = () => {
        setOpenAccount(false);
    };

    const handleClickAwayNotification = () => {
        setOpenNotification(false);
    };

    const handleClickNotification = () => {
        setOpenNotification((prev) => !prev);
    };

    const styles: SxProps = {
        position: 'absolute',
        top: 60,
        right: 0,
        zIndex: 10,
        border: '1px solid #e5e7eb',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        width: 280,
        p: 0,
        overflow: 'hidden',
    };

    const stylesNotification: SxProps = {
        position: 'absolute',
        top: 48,
        right: 0,
        zIndex: 10,
        border: '1px solid #e5e7eb',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        width: 400,
        p: 1,
    };

    const { data: userInformation } = useQuery({
        queryKey: ['users_data', id],
        queryFn: () => fetchUserById(id ? String(id) : ''),
        enabled: !!id,
    });

    const user: UserData = useMemo(
        () => ({
            first_name: userInformation?.data?.first_name || 'Loading...',
            last_name: userInformation?.data?.last_name || '',
            image: userInformation?.data?.image_url || null,
            role: userInformation?.data?.details?.position || null,
        }),
        [userInformation]
    );

    const preview = useMemo(() => {
        if (user.image instanceof File) {
            return URL.createObjectURL(user.image);
        } else if (typeof user.image === 'string' && user.image.trim() !== '') {
            return user.image;
        }
        return undefined;
    }, [user.image]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL_BACKEND, {
            transports: ['websocket'],
        });
        socket.on('notification', (message: any) => {
            setNotification((prev) => [...prev, message]);
            console.log('notification', message);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="py-3 px-4 border-b border-gray-800" style={{ backgroundColor: '#000000' }}>
            <div className="flex items-center justify-between gap-3 sm:gap-5">
                <div className="flex gap-2 sm:gap-4 items-center">
                    <div className="flex md:hidden">
                        <button onClick={() => setUserNav(true)} className="text-white" aria-label="Open navigation menu">
                            <Menu />
                        </button>
                    </div>
                    <div className="hidden sm:block">
                        <img src={beeseeGoldLogo} className="w-[160px]" alt="Beesee Logo" />
                    </div>
                </div>

                {/* Notification Bell */}
                <div className="flex gap-2 sm:gap-4 items-center">
                    {/*  <div>
          <ClickAwayListener
            mouseEvent='onMouseDown'
            touchEvent="onTouchStart"
            onClickAway={handleClickAwayNotification}
          >
            <Box sx={{ position: 'relative' }}>
               <button
                title='Notification'
                type='button'
                className='py-2 px-2 bg-gray-100 rounded-full hover:bg-gray-200'
                onClick={handleClickNotification}
               >
                    <Badge badgeContent={notification.length} color="error">
                        <NotificationsIcon color="action" />
                    </Badge>
               </button>

               {openNotification && (
                <Box sx={stylesNotification}>
                    <ul className='flex flex-col text-gray-800'>
                        <li className='flex items-center gap-4 py-2'>

                        </li>
                    </ul>
                </Box>
               )}
            </Box>
          </ClickAwayListener>
        </div> */}

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={handleClickAway}>
                            <Box sx={{ position: 'relative' }}>
                                <button type="button" onClick={handleClick} className="flex items-center space-x-2 rounded-full transition" aria-label="Open account menu">
                                    {user.image ? (
                                        <>
                                            {/* Desktop view with name */}
                                            <div className="hidden sm:flex items-center gap-2  py-2 px-3 rounded-md transition-all duration-200">
                                                <Avatar alt={`${user.first_name} ${user.last_name}`} src={preview} className="w-8 h-8 rounded-full bg-white object-cover" />
                                                <span className="text-white font-medium truncate">{`${user.first_name} ${user.last_name}`}</span>
                                            </div>
                                            {/* Mobile view - avatar only */}
                                            <div className="sm:hidden">
                                                <Avatar alt={`${user.first_name} ${user.last_name}`} src={preview} className="w-9 h-9 rounded-full bg-white object-cover" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black font-semibold text-sm">
                                            {`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}
                                        </div>
                                    )}
                                </button>

                                {openAccount && (
                                    <Box sx={styles}>
                                        {/* User Info Section */}
                                        <div className="px-4 py-3 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div>
                                                    {user.image ? (
                                                        <Avatar alt={`${user.first_name} ${user.last_name}`} src={preview} className="w-12 h-12 rounded-full object-cover shadow-md" />
                                                    ) : (
                                                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-lg shadow-md">
                                                            {`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Information */}
                                                <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                                                    {/* Full name */}
                                                    <h3 className="text-base font-bold text-gray-900 truncate">{`${user.first_name} ${user.last_name}`}</h3>

                                                    {/* Position */}
                                                    <p className="text-sm text-gray-600 truncate">{user.role || 'Staff'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <ul className="py-2">
                                            <li
                                                onClick={() => {
                                                    navigate('/beesee/my-account'), handleClickAway();
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group"
                                            >
                                                <SettingsIcon sx={{ fontSize: 20 }} className="text-gray-500 group-hover:text-yellow-600 transition-colors" />
                                                <span className="font-medium">Account Setting</span>
                                            </li>

                                            <li
                                                className="flex items-center gap-3 px-4 py-3 cursor-pointer text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                                                onClick={logout}
                                            >
                                                <LogoutIcon sx={{ fontSize: 20 }} className="text-gray-500 group-hover:text-red-600 transition-colors" />
                                                <span className="font-medium">Sign Out</span>
                                            </li>
                                        </ul>
                                    </Box>
                                )}
                            </Box>
                        </ClickAwayListener>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavigationTechnician;
