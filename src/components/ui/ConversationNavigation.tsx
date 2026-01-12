import React, { useState, useMemo } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge'; 
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { SxProps } from '@mui/system';
import Avatar from '@mui/material/Avatar';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings'; 
import { fetchUserById } from '../../services/Technician/myAccountServices'
import { useQuery } from '@tanstack/react-query';
import beeseeGoldLogo from '../../../public/beeseeGoldLogo.png'
import { Menu } from 'lucide-react'

interface UserData {
  first_name: string;
  last_name: string;
  image?: File | string | null;
  role: string;
}

const ConversationNavigation = () => {   

  const styles: SxProps = {
    position: 'absolute',
    top: 48,
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
  
  return (
    <div className="py-3 px-4 border-b border-gray-300"  style={{ backgroundColor: '#000000' }}>
      <div className="flex items-center justify-between gap-5">
        <div className='flex gap-4 items-center'> 
          <div>
              <img 
              src={beeseeGoldLogo}
              className='w-[160px]'
            />  
          </div>
        </div>
 
      </div>
    </div>
  );
};

export default ConversationNavigation;
