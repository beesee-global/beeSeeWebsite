import React from 'react'
import { Outlet } from 'react-router-dom'
import ConversationNavigation from '../components/ui/ConversationNavigation'

const EmailConversationLayout = () => {
  return (
    <div className='flex flex-col h-screen'>
    <div className="flex flex-col flex-1 overflow-hidden">
        <ConversationNavigation /> 
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default EmailConversationLayout
