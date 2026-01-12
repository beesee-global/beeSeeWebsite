import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client'
import {
  Send, 
  User, 
  Clock, 
  Inbox, 
  EllipsisVertical,
  Paperclip,
  X,
  Trash2,
  File,
  FileText,
  Download,
  ArrowLeftToLine,
  Image as ImageIcon  // Rename this!
} from 'lucide-react';
import Box from '@mui/material/Box';
import AlertDialog from '../../../components/feedback/AlertDialog';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useParams } from 'react-router-dom'; 
import { 
  fetchTicketDetails, 
  fetchConversation,
  insertConversation,
  insertImageConversation,
  updateStatus,
  deleteTickets
} from '../../../services/Technician/ticketsServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConversationsDetails from '../../../components/ui/ConversationsDetails';
import { userAuth } from '../../../hooks/userAuth';
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician';
import { useNavigate } from 'react-router-dom';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'

export default function EmailConversationApp() {
  const { pid } = useParams();  
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState<boolean>(false); 
  const [openJob, setOpenJob] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [socket, setSocket] = useState<any>(null);

  const { 
    userInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
    snackBarMessage,
    snackBarOpen,
    snackBarType
  } = userAuth()

  const { data: ticketInfo, isLoading } = useQuery({
    queryKey: ['ticketInformation', pid],
    queryFn: () => fetchTicketDetails(String(pid)),
    enabled: !!pid
  })

  const { mutateAsync: deleteTicket } = useMutation({
    mutationFn: deleteTickets
  });

  const userTicketInformation = ticketInfo?.data || {}; 

  const { data: conversationsData, } = useQuery({
    queryKey: ['conversations', userTicketInformation?.ticket_id],
    queryFn: () => fetchConversation(userTicketInformation?.ticket_id),
    enabled: !!userTicketInformation?.ticket_id
  });

  useEffect(() => {
    if (!userTicketInformation?.ticket_id) return;

    const s  = io(import.meta.env.VITE_API_URL_BACKEND as string, {
      query: {
        ticket_id: userTicketInformation?.ticket_id
      }
    });

    setSocket(s);

    // Listen to new message
    s.on("new_ticket_message", (msg:any) => {
      setMessages(prev => [...prev, msg]); 
        
      // fetch initial ticket information
      queryClient.invalidateQueries({
        queryKey: ['ticketInformation', pid],
      })
    });

    // join ticket room on server
    s.emit("join_ticket_room", userTicketInformation?.ticket_id);


    return () => {
      s.disconnect();
    };

  }, [userTicketInformation?.ticket_id])

  // set messages initially
  useEffect(() => {
    if (conversationsData?.data) setMessages(conversationsData?.data)
  }, [conversationsData])

  // --- inserting image ---
  const {
    mutateAsync: insertImageConversations
  } = useMutation({
    mutationFn: insertImageConversation
  });

  // --- inserting conversation ---
  const {
    mutateAsync: insertConversations
  } = useMutation({
    mutationFn: insertConversation,
    onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['conversations', userTicketInformation.ticket_id],
    })

    queryClient.invalidateQueries({
      queryKey: ['ticketInformation', pid],
    })
  },
  });

  // --- update status mark as completed ---
  const {
    mutateAsync: updateStats
  } = useMutation({
    mutationFn: ({reference_number, payload} : { reference_number: string, payload: any}) => 
      updateStatus(reference_number, payload)
  });

  useEffect(() => {
    if (conversationsData?.data) {
      setMessages(conversationsData.data); 
    }
  }, [conversationsData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
 
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ }) //  behavior: "smooth"
  }
 
   /* automatic close on wider screens */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setShowSidebar(false)
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize)
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const fileObjects = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachedFiles(prev => [...prev, ...fileObjects]);
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type?: string) => {
    if (type?.startsWith('image/*')) return <ImageIcon className="w-4 h-4" />;
    if (type?.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleSendReply = async () => {
    if ((!replyText.trim() && attachedFiles.length === 0)) return;

    setLoading(true);

    setReplyText('');
    setAttachedFiles([]);
 
    const payload = {
      sender_email: userTicketInformation.email || 'admin@beesee.com',
      tickets_id: userTicketInformation?.ticket_id,
      sender_name: userInfo?.full_name || 'Support Team',
      message_body: replyText,
      user_role: userInfo?.role,
      is_inbound: false,
    }

    try {
      const response = await insertConversations(payload)

      if (response?.success) {
        if (userTicketInformation.status === 'open') {
          setSnackBarMessage("Mark as Completed")
          setSnackBarType('success')
          setSnackBarOpen(true)
        }

        // Add locally
        const newMessage = {
          ...payload,
          id: response.data.ticket_ids,
          created_at: new Date().toISOString(),
        };
        
        // Add message to screen immediately
        setMessages(prev => [
          ...prev, 
          newMessage
        ]);

        // emit to server for real-time
        socket?.emit("send_ticket_message", {
          ticket_id: userTicketInformation?.ticket_id,
          message: newMessage
        });

        queryClient.invalidateQueries({ 
          queryKey: ['conversations', userTicketInformation?.ticket_id] 
        })
      }
  
      // Here you would send the actual API request
      // const formData = new FormData();,
      // formData.append('message', replyText);
      // formData.append('sender_email', userTicketInformation.email);
      // attachedFiles.forEach((fileObj, index) => {
      //   formData.append(`attachments`, fileObj.file);
      // });
      //
      // try {
      //   await fetch(`http://localhost:3001/api/conversations/${selectedConversation.id}/reply`, {
      //     method: 'POST',
      //     body: formData
      //   });
      // } catch (error) {
      //   console.error('Error sending message:', error);
      //   // Optionally remove the message if send fails
      // }

    } catch (error) {
      setSnackBarMessage("Something went wrong, Please try again.")
      setSnackBarType("error")
      setSnackBarOpen(true);
      console.error(error)
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleClickAwayJob = () => {
    setOpenJob(false);
  };

  const handleClickJob = () => {
    setOpenJob((prev) => !prev);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const markAsCompleted = async() => {
    try {
      const payload = new FormData();
      payload.append("status", "resolved");

      const response = await updateStats({
        reference_number: userTicketInformation?.ticket_id,
        payload
      });

      if (response?.success) {
        setSnackBarMessage("Successfully Mark as Completed")
        setSnackBarType("success")
        setSnackBarOpen(true)
        navigate("/beesee/job-order")
      }

    } catch (error) {
      setSnackBarMessage("Failed to mark as completed. Please try again.")
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

    const handleDelete = (ids: number[]) => {
    if (userInfo?.role !== "Admin") {
      setSnackBarMessage("You do not have permission to delete tickets.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    } 

    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} tickets?`)
 
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteTicket(deleteIds); // call mutation

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSnackBarMessage("Tickets deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true); 

        navigate("/beesee/job-order")       
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete ticket. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  if (isLoading) {
    return <SpinningRingLoader />;
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* snackbar */}
      <SnackbarTechnician 
        open={snackBarOpen}
        type={snackBarType}
        message={snackBarMessage}
        onClose={() => setSnackBarOpen(false)}
      />

      {/* Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirmDelete} 
      />

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full view" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Messages View */}
      <div className="flex-1 flex flex-col"> 
        <>
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
            <div>
              <h2 className="text-md font-semibold text-gray-900">
                {userTicketInformation.company || 'No Subject'}
              </h2>
              {/* <p className="text-sm text-gray-500">
                Conversation with {userTicketInformation.email}
              </p> */}
            </div>

            {/* ticket */}
            <div className='flex gap-3 items-center'> 

              <div>
                <ClickAwayListener
                  mouseEvent="onMouseDown"
                  touchEvent="onTouchStart"
                  onClickAway={handleClickAwayJob}
                >
                  <Box sx={{ position: 'relative' }}>
                    <button
                      type='button'
                      onClick={handleClickJob}
                      className='hover:bg-gray-100 p-2 rounded-md transition'
                    >
                      <EllipsisVertical className='w-5 h-5' />
                    </button>
                    {openJob && (
                      <Box sx={{
                        position: 'absolute',
                        top: 40,
                        right: 0,
                        zIndex: 10,
                        border: '1px solid #e5e7eb',
                        bgcolor: 'background.paper', 
                        boxShadow: 3,
                        borderRadius: 1,
                        width: 170,
                        p: 1,
                      }}>
                        <ul className='flex flex-col gap-1 justify-center items-center text-center'>
                          {/* <li className='hover:bg-gray-100 px-2 py-1 cursor-pointer rounded text-sm w-full'>
                            Create Job Order
                          </li> */}
                          <li onClick={() => markAsCompleted()} className='hover:bg-gray-100 px-2 py-1 cursor-pointer rounded text-sm w-full'>
                            Mark as completed
                          </li>
                        </ul>
                      </Box>
                    )}
                  </Box>
                </ClickAwayListener>
              </div>
              
                <div className='md:hidden'>
                  <button 
                    onClick={() => setShowSidebar(true)}
                    title="View Ticket Information"
                    className='p-2 hover:bg-gray-100 rounded-md transition'>
                  <ArrowLeftToLine />
                </button>
              </div>
            </div>
          </div>

          {messages.length !== 0 ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-gray-400">Loading messages...</div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    ref={messageEndRef}
                    className={`flex ${msg.is_inbound ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-lg p-4 ${
                        msg.is_inbound
                          ? 'bg-white border border-gray-200'
                          : 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
                      }`} 
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {msg.sender_name || msg.sender_email}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            msg.message_type === 'email'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          } ${!msg.is_inbound && 'bg-opacity-30 text-white'}`}
                        >
                          {msg.is_inbound ? userTicketInformation?.company : msg.message_type}  
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message_body}</p>
                      
                      {/* Attachments Display */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 p-2 rounded ${
                                msg.is_inbound 
                                  ? 'bg-gray-50 border border-gray-200' 
                                  : 'bg-gray-700 bg-opacity-50'
                              }`}
                            >
                              {getFileIcon(attachment.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{attachment.name}</p>
                                <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                              </div>
                              <button 
                                className="p-1 hover:bg-gray-200 rounded transition"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        className={`flex items-center gap-1 mt-2 text-xs ${
                          msg.is_inbound ? 'text-gray-500' : 'text-gray-300'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {formatDate(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
          ) : (
            <>
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
              <span className="text-center text-gray-500 text-lg">No message found</span>
            </div></>
          )}
          
          {/* Reply Box */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((fileObj, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg p-2 pr-1"
                  >
                    {fileObj.preview ? (
                      <img 
                        src={fileObj.preview} 
                        alt={fileObj.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(fileObj.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 max-w-xs">
                      <p className="text-xs font-medium truncate">{fileObj.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 hover:bg-red-100 rounded-full transition"
                      title="Remove file"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {/* File Input (Hidden) */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
                /*  accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls" */
              />

              {/* Attach File Button */}
              {/* <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Attach files"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button> */}

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                rows="3"
                disabled={loading}
              />
              <button
                onClick={handleSendReply}
                disabled={loading || (!replyText.trim() && attachedFiles.length === 0)}
                className="px-6 py-3 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Reply will be sent via email and saved in the conversation
              {attachedFiles.length > 0 && ` • ${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''} attached`}
            </p>
          </div>
        </>  
      </div>

      {/* Mobile view */}
      {showSidebar && (
        <div className='fixed inset-0 z-50 md:hidden'>
          
          {/* Dark transparent background */}
          <div 
            onClick={() => setShowSidebar(false)}
            className='absolute inset-0 bg-black bg-opacity-40'
          />

          {/* Slide in sidebar */}
          <div className='absolute left-0 top-0 h-screen w-80 bg-gray-100 shadow-xl animate-slideIn flex flex-col'>
            <div className='p-4 border-b flex bg-gradient-to-r from-gray-900 to-gray-800 justify-between items-center'>
              <h2 className='text-white font-bold flex items-center gap-2'>
                <Inbox className='w-5 h-5'/>
                Ticket Information
              </h2>

              <div className='flex items-center gap-2'>
                <button 
                  onClick={(e) => handleDelete([userTicketInformation.customers_id])}
                  className="text-red-700 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <button className='text-white' onClick={() => setShowSidebar(false)}>
                  <X />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ConversationsDetails 
                userTicketInformation={userTicketInformation}
                setSelectedImage={setSelectedImage}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                setShowSidebar={setShowSidebar}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop view */}
      {/* Conversations List */}
      <div className="hidden md:flex md:flex-col w-1/3 bg-gray-100 border-r border-gray-200">
        <div className="flex justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Ticket Information
            </h2>
          </div>
          <div>
            <button 
              onClick={(e) => handleDelete([userTicketInformation.customers_id])}
              className="text-red-700 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ConversationsDetails 
            userTicketInformation={userTicketInformation}
            setSelectedImage={setSelectedImage}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            setShowSidebar={setShowSidebar}
          />
        </div>
      </div>
    </div>
  );
}