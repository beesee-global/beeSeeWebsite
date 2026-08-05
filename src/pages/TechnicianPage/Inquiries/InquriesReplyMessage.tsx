import React, { useState, useEffect, useRef } from 'react';
import {  
  Send, 
  User, 
  Clock,  
  Paperclip,
  X,
  File,
  Image as ImageIcon,
  Trash2,
  FileText,
  Download,
  MailX
} from 'lucide-react'; 
import { 
    inquiriesReply, 
    fetchInquiriesById,
    fetchInquiriesByPid,
    closeInquiries,
    deleteInquiries
} from '../../../services/Technician/inquiriesServices'
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { userAuth } from '../../../hooks/userAuth'; 
import { downloadFile } from '../../../utils/downloadFile'
import AlertDialog from '../../../components/feedback/AlertDialog';
import { useNavigate } from 'react-router-dom';
import { MinimalIconLoader } from '../../../components/ui/LoadingScreens' 

export default function InquriesReplyMessage() { 
  const navigate = useNavigate()
  const { 
    setSnackBarMessage, 
    setSnackBarType, 
    setSnackBarOpen, 
    userInfo
} = userAuth()
  const { pid } = useParams();
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);        
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messageEndRef = useRef<HTMLDivElement>(null)

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState(''); 
  const [dialogAction, setDialogAction] = useState<"inquiries-delete" | "inquiries-close"| null>(null); 
  const [dialogMessage, setDialogMessage] = useState('');
  const [deleteIds, setDeleteIds] = useState<number[]>([]);  

  const InquiriesPermissionJob = userInfo?.permissions?.find(p=> p.parent_id === "inquiries" && p.children_id === '')

  const { data: inquiriesInfo, isLoading, isError } = useQuery ({
    queryKey: ['inquiries-info', pid],
    queryFn: () => fetchInquiriesByPid(String(pid)),
    enabled: !!pid
  });

  const userInquiriesInfo = inquiriesInfo?.data || [];

  const { data: inquiriesMessage, } = useQuery ({
    queryKey: ["inquiries-reply", userInquiriesInfo?.id],
    queryFn: () => fetchInquiriesById(Number(userInquiriesInfo?.id)),
    retry: true
  });

  const {
    mutateAsync: sentInquiries, isPending
  } = useMutation({
    mutationFn: inquiriesReply
  })

  const {
    mutateAsync: closeInquire
  } = useMutation ({
    mutationFn: closeInquiries
  })

  useEffect(() => {
    if (inquiriesMessage?.data) setMessages(inquiriesMessage?.data) 
  }, [inquiriesMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages])

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ })
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

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleSendReply = async () => {
    try {
      if ((!replyText.trim() && attachedFiles.length === 0)) return;

        setLoading(true);
        
        // Here you would upload files and send message
        const formData = new FormData();
        formData.append('message_body', replyText);
        formData.append("user_id", String(userInfo?.id));
        formData.append("subject",inquiriesMessage?.data[0]?.subject)
        formData.append('sender_email', userInquiriesInfo?.email); 
        formData.append("inquiries_id", userInquiriesInfo?.id);
        formData.append("sender_name", userInfo?.full_name);
        formData.append("is_inbound", "0")
        formData.append("user_role", userInfo?.role)

        attachedFiles.forEach((fileObj, index) => {
            formData.append(`attachments`, fileObj.file);
        });
        
        const response = await sentInquiries(formData)
        
        if (response?.success) {
            // Mock adding message
            const newMessage = {
              id: messages.length + 1, 
              sender_name:  userInfo?.full_name,
              user_role: userInfo?.role,
              message_body: replyText,
              is_inbound: false,
              created_at: new Date().toISOString(),
              message_type: 'web',
              attachments: attachedFiles.map(f => ({
                  name: f.name,
                  size: f.size,
                  type: f.type
            }))
            };

            setMessages([...messages, newMessage]);
            setReplyText('');
            setAttachedFiles([]);

            setSnackBarMessage("Email successfully sent")
            setSnackBarType('success')
            setSnackBarOpen(true)
        }
    } catch (error) {
        setSnackBarMessage("Something went wrong, Please try again.")
        setSnackBarType("error")
        setSnackBarOpen(true); 
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

  // Handle Delete Inquiry
  const handleDelete = () => {
    const Permission = userInfo?.permissions?.find(p => p.parent_id === 'inquiries' && p.children_id === '');
    if (!Permission || !Permission.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete inquiries.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
    setDialogOpen(true)
    setDeleteIds([Number(userInquiriesInfo?.id)]);
    setDialogTitle('Delete Inquiry');
    setDialogMessage('Are you sure you want to delete this inquiry?'); 
  };

  // Confirm Delete or Close
  const handleConfirmAction = async () => {
    try {
      if (dialogAction === "inquiries-close") {
        const formData = new FormData();
        formData.append("id", userInquiriesInfo?.id);
        formData.append("user_id", String(userInfo?.id));

        const response = await closeInquire(formData);

        if (response.success) {
          setDialogOpen(false);
          setDialogMessage('');
          setDialogTitle('');
          setDialogAction(null);
          
          setSnackBarMessage('Inquiry closed successfully');
          setSnackBarType('success');
          setSnackBarOpen(true);

          navigate("/beesee/inquiries") 
        }
      } else if (dialogAction === "inquiries-delete") {
        const formData = new FormData();
        formData.append("ids", JSON.stringify(deleteIds)); 
        formData.append("user_id", String(userInfo?.id));  

        const response = await deleteInquiries(formData);

        if (response?.success) {
          setDialogOpen(false);
          setDialogMessage('');
          setDialogTitle('');
          setDialogAction(null);
          setDeleteIds([]);
          
          setSnackBarMessage('Inquiry deleted successfully');
          setSnackBarType('success');
          setSnackBarOpen(true);

          navigate("/beesee/inquiries")
        }
      }
    } catch (error) {
      const errorMessage = dialogAction === "inquiries-close" 
        ? 'Failed to close inquiry. Please try again.'
        : 'Failed to delete inquiry. Please try again.';
      setSnackBarMessage(errorMessage);
      setSnackBarType('error');
      setSnackBarOpen(true);
    }
  };; 

  if (isPending) {
    return <MinimalIconLoader />
  }

  return (
    <div className="flex h-full bg-gray-50">  

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => {
          setDialogOpen(false);
          setDeleteIds([]);
          setDialogAction(null);
        }}
        onSubmit={handleConfirmAction} 
      />

      {/* Messages View */}
      <div className="flex-1 flex flex-col">
          <>
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Inquiries Reply
                </h2> 
              </div>

              <div className='flex gap-2'>
                {InquiriesPermissionJob?.actions.includes("closed_inquiries") && userInquiriesInfo.status !== 'Closed' && (
                  <div>
                    <button
                      onClick={() => {
                        setDialogOpen(true);
                        setDialogAction("inquiries-close");
                        setDialogTitle('Close Inquiry');
                        setDialogMessage('Are you sure you want to close this inquiry?');
                      }}
                      className='inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      
                    <MailX className='w-4 h-4' />
                    <span className='hidden sm:inline'>Closed</span>
                    </button>
                  </div>
                )}
                
                {InquiriesPermissionJob?.actions.includes("delete") && (
                  <div>
                    <button 
                      onClick={() => handleDelete()}
                      title="Delete"
                      className='inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60'>
                      <Trash2 className='w-4 h-4'/>
                      <span className='hidden sm:inline'>Delete</span>
                    </button>
                </div>
                )}
              </div>
 
            </div>

            {/* Messages */}
            {messages.length !== 0 ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-black">Loading messages...</div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      ref={messageEndRef}
                      key={msg.id}
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
                          <span className={`font-semibold text-sm ${msg.is_inbound ? 'text-gray-900' : 'text-white'}`} style={msg.is_inbound ? {color: '#111827'} : {}}>
                            {msg.sender_name || msg.sender_email}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              msg.message_type === 'email'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            } ${!msg.is_inbound && 'bg-opacity-30 text-white'}`}
                          >
                            {msg.user_role}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words" style={msg.is_inbound ? {color: '#111827'} : {color: '#ffffff'}}>{msg.message_body}</p>
                        
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
                                  <p className="text-xs font-medium truncate" style={msg.is_inbound ? {color: '#111827'} : {color: '#ffffff'}}>{attachment.name}</p>
                                  <p className="text-xs" style={msg.is_inbound ? {color: '#111827'} : {color: '#ffffff'}}>{formatFileSize(attachment.size)}</p>
                                </div>
                                <button 
                                  onClick={() => downloadFile(attachment.attachment_url, attachment.name)}
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
                          className={`flex items-center gap-1 mt-2 text-xs`}
                          style={msg.is_inbound ? {color: '#111827'} : {color: '#ffffff'}}
                        >
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : ( 
              <>
              <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
                <span className="text-center text-black text-lg">No reply message</span>
              </div>
              </>
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
                        <p className="text-xs text-black">{formatFileSize(fileObj.size)}</p>
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
                  accept=".pdf,.docx"
                />

                {/* Attach File Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Attach files"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                  style={{color: '#000000'}}
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
    </div>
  );
}