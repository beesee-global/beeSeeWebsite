import React, { useState, useEffect, useRef } from 'react';

import {
  Send, 
  User, 
  Clock, 
  Inbox,  
  X,
  File,
  FileText,
  Download,
  ArrowLeftToLine,
  AlertCircle, 
  Mail,
  FileQuestion,  
  Image as ImageIcon  // Rename this!
} from 'lucide-react'; 
import { useParams } from 'react-router-dom'; 
import { 
  fetchTicketDetailsPublic, 
  fetchConversation,
  insertConversationPublic,
  insertImageConversation,
  updateStatus
} from '../../services/ticketsServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConversationsDetails from '../../components/ui/ConversationsDetails';
import { userAuth } from '../../hooks/userAuth';
import Snackbar from '../../components/feedback/Snackbar';
import { useNavigate } from 'react-router-dom';

export default function EmailConversationApp() {
  const { pid } = useParams();  
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState<boolean>(false);  
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null)

  const { 
    userInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
    snackBarMessage,
    snackBarOpen,
    snackBarType
  } = userAuth()

  const { data: userInformation, isLoading, isError, error } = useQuery({
    queryKey: ['ticketInformation', pid],
    queryFn: () => fetchTicketDetailsPublic(String(pid)),
    enabled: !!pid,
    retry: false
  })
  
  const userTicketInformation = userInformation?.data || {}; 
  
  const { data: conversationsData, } = useQuery({
    queryKey: ['conversations', userTicketInformation?.ticket_id],
    queryFn: () => fetchConversation(userTicketInformation?.ticket_id),
    enabled: !!userTicketInformation?.ticket_id
  })

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
    mutationFn: insertConversationPublic
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
      setMessages(conversationsData?.data); 
    }
  }, [conversationsData]);
 
   /* automatic close on wider screens */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setShowSidebar(false)
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize)
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
 
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView()
  }
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

    // Create new message object
    const newMessage = { 
      sender_email: userTicketInformation?.email,
      sender_name: userTicketInformation?.full_name,
      message_body: replyText,
      is_inbound: true,
      created_at: new Date().toISOString(),
      message_type: 'Customer',
      /* attachments: attachedFiles.map(f => ({
        name: f.name,
        size: f.size, 
        type: f.type
      })) */
    }; 

    const payload = {
      sender_email: userTicketInformation.email,
      tickets_id: userTicketInformation?.ticket_id,
      sender_name: userTicketInformation?.full_name,
      message_body: replyText,
      user_role: "Customer",
      is_inbound: true,
    } 
    
    const response = await insertConversations(payload)

    if (response?.success) {
      
      // Add message to screen immediately
      setMessages([...messages, newMessage]);
      setReplyText('');
      setAttachedFiles([]);
      
      queryClient.invalidateQueries({ 
        queryKey: ['ticketInformation', pid] 
      }) 
    }

    setLoading(false);
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

  if (isLoading) {
    return <div></div>;
  }

  if (isError) {
    const respData = (error as any)?.response?.data;
    const statusCode = respData?.statusCode ?? (error as any)?.response?.status;
    const message = respData?.message ?? (error as any)?.message ?? 'An error occurred';

    if (statusCode === 403) {
        return (
          <div className="flex flex-1 items-center justify-center min-h-screen p-6">
             <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-6">
                  <AlertCircle className="w-16 h-16 text-red-600" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={(e) => navigate("/customer-support")}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
                >
                  <Mail className="w-5 h-5" />
                  Submit Ticket
                </button>
              </div>

              <p className="text-sm text-gray-500 pt-2">
                Need help? Our support team is here to assist you.
              </p>
            </div>
          </div>
        );
    } 
    
    if (statusCode === 404) {
      return (
        <> 
        <div className="flex flex-1 items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-12 text-center space-y-8">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-8">
                <FileQuestion className="w-20 h-20 text-gray-600" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Ticket does not exist or has been removed
              </h1> 
            </div>

            <div className="pt-6">
              <button
                onClick={(e) => navigate("/customer-support")}
                className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-5 px-10 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
              >
                <Send className="w-6 h-6" />
                Submit Ticket
              </button>
            </div>

            <p className="text-sm text-gray-500 pt-2">
              Create a new support ticket and we'll help you right away.
            </p>
          </div>
        </div>
        </>
      );
    }

    // no extra closing brace here
  }
 
  return (
    <div className="flex h-full bg-gray-50">
      {/* snackbar */}
      <Snackbar 
        open={snackBarOpen}
        type={snackBarType}
        message={snackBarMessage}
        onClose={() => setSnackBarOpen(false)}
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
                {userTicketInformation.questions || 'No Subject'}
              </h2> 
            </div>

            {/* ticket */}
            <div className='flex gap-3 items-center'> 
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
                    className={`flex ${msg.is_inbound ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-lg p-4 ${
                        msg.is_inbound
                          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
                          : 'bg-white border border-gray-200'
                      }`} 
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {msg.is_inbound ? msg.sender_name || msg.sender_email : "Technical Support"}
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
                                  ? 'bg-gray-700 bg-opacity-50' 
                                  : 'bg-gray-50 border border-gray-200'
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
                          msg.is_inbound ? 'text-gray-300' : 'text-gray-500'
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
              <button className='text-white' onClick={() => setShowSidebar(false)}>
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ConversationsDetails 
                userTicketInformation={userTicketInformation}
                setSelectedImage={setSelectedImage}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                user={true}
                setShowSidebar={setShowSidebar}
                publicConversation={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop view */}
      {/* Conversations List */}
      <div className="hidden md:flex md:flex-col w-1/3 bg-gray-100 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Ticket Information
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ConversationsDetails 
            userTicketInformation={userTicketInformation}
            setSelectedImage={setSelectedImage}
            formatDate={formatDate}
            user={true}
            getStatusColor={getStatusColor}
            setShowSidebar={setShowSidebar}
            publicConversation={true}
          />
        </div>
      </div>
    </div>
  );
}