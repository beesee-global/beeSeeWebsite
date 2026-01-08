import React, { useState, useMemo, useEffect } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge'; 
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { SxProps } from '@mui/system';
import Avatar from '@mui/material/Avatar';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { userAuth } from '../../hooks/userAuth'
import { useNavigate } from 'react-router-dom';
import { fetchUserById } from '../../services/Ecommerce/myAccountServices'
import { useQuery } from '@tanstack/react-query';
import beeseeGoldLogo from '../../../public/beeseeGoldLogo.png'
import { Menu } from 'lucide-react'
import { io } from 'socket.io-client'

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
  const [openNotification, setOpenNotification] = React.useState(false)

  const handleClick = () => {
    setOpenAccount((prev) => !prev);
  };

  const handleClickAway = () => {
    setOpenAccount(false);
  };

  const handleClickAwayNotification = () => {
    setOpenNotification(false);
  }

  const handleClickNotification = () => {
    setOpenNotification((prev) => !prev);
  }

  const styles: SxProps = {
    position: 'absolute',
    top: 60,
    right: 0,
    zIndex: 10,
    border: '1px solid #e5e7eb', // light gray
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 3,
    width: 240,
    p: 1,
  };

  const stylesNotification: SxProps = {
    position: 'absolute',
    top: 48,
    right: 0,
    zIndex: 10,
    border: '1px solid #e5e7eb', // light gray
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 3,
    width: 400,
    p: 1,
  }

  const { data: userInformation } = useQuery({
    queryKey: ["users_data", id],
    queryFn: () => fetchUserById(Number(id)),
    enabled: !!id
  });

  const user: UserData = useMemo(() => ({
    first_name: userInformation?.data?.first_name || "Loading...",
    last_name: userInformation?.data?.last_name || "",
    image: userInformation?.data?.image_url || null,
    role: userInformation?.data?.details?.position  || null,
  }), [userInformation]);

  const preview = useMemo(() => {
    if (user.image instanceof File) {
      return URL.createObjectURL(user.image)
    } else if (typeof user.image === "string" && user.image.trim() !== "") {
      return user.image
    }
    return undefined
  }, [user.image]);
  
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL_BACKEND);
    socket.on("notification", (message:any) => {
      setNotification(prev => [...prev, message])
      console.log("notification", message)
    })
  }, [])
  return (
    <div className="py-3 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-300">
      <div className="flex items-center justify-between gap-5">
        <div className='flex gap-4 items-center'>
          <div className='flex md:hidden' >
            <button 
              onClick={() => setUserNav(true)}
              className='text-white'
            >
              <Menu/>
            </button>
          </div> 
          <div>
            <img 
              src={beeseeGoldLogo}
              className='w-[160px]'
            />  
          </div>
        </div>

        {/* Notification Bell */}
        <div className='flex gap-4 items-center'>
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
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={handleClickAway}
          >
            <Box sx={{ position: 'relative' }}>
              <button
                type="button"
                onClick={handleClick}
                className="flex items-center space-x-2 rounded-full transition"
              >
                {user.image ? (
                  <div className="flex items-center gap-2 bg-gray-800 w-full max-w-48 hover:bg-gray-700 py-2 px-3 rounded-md">
                    <Avatar
                      alt={`${user.first_name} ${user.last_name}`}
                      src={preview}
                      className="w-8 h-8 rounded-full bg-white object-cover"
                    />
                    <span className="text-white">{`${user.first_name} ${user.last_name}`}</span>
                  </div>
                ) : (
                  <div className='w-9 h-9 flex items-center justify-center rounded-full bg-white text-black font-semibold'>
                    {`${user.first_name.charAt(0)} ${user.last_name.charAt(0)}`}
                  </div>
                )}
              </button>

              {openAccount && (
                <Box sx={styles}>
                  <ul className="flex flex-col text-gray-800">
                    <li className='flex items-center gap-4 py-2'>
                        {/* Avatar */}
                        <div>
                          {user.image ? (
                            <Avatar 
                              alt={`${user.first_name} ${user.last_name}`}
                              src={preview} 
                              className='w-8 h-8 rounded-full bg-white object-cover'
                          />
                          ) : (
                            <div className='w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold'>
                              {`${user.first_name.charAt(0)} ${user.last_name.charAt(0)}`}
                            </div>
                          )}
                        </div>

                        {/* Information */}
                        <div className='flex flex-col space-y-1'>
                            {/* full name */}
                            <div className='max-w-[150px]'>
                                <h3 className='text-[17px] font-semibold truncate'>
                                  {`${user.first_name} ${user.last_name}`}
                                </h3>  
                            </div>

                            {/* position */}
                            <div className='max-w-[150px]'>
                                <p className='text-[15px] text-gray-600 truncate'>
                                  {`${user.role}`}
                                </p>
                            </div>
                        </div>
                    </li>
                    <hr className='border-gray-300 my-1'/>
                    <li
                      onClick={() => {
                        navigate('/beesee/my-account'), 
                        handleClickAway()
                      }} 
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100" 
                    >
                      <SettingsIcon sx={{ fontSize: 16 }}/> Account Setting
                    </li>
                    <hr className="border-gray-300 my-1" />
                    <li
                      className="flex items-center gap-2 px-3 py-1 cursor-pointer  hover:bg-gray-100"
                      onClick={logout}
                    >
                      <LogoutIcon sx={{ fontSize: 16 }}/> Sign Out
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
