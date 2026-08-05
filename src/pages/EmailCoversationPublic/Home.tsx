import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  User,
  Clock,
  X,
  File,
  Inbox,
  ArrowLeftToLine,
  FileText,
  Image as ImageIcon,
  FileQuestion,
  Download,
  Paperclip,
  Reply, 
  Trash2
} from 'lucide-react';

import { SpinningRingLoader } from '../../components/ui/LoadingScreens'
import AlertDialog from '../../components/feedback/AlertDialog';

import {
  fetchTicketDetailsPublic,
  fetchConversationPublic,
  insertConversationPublic,
  insertImageConversation,
  deleteSpecificConversation
} from '../../services/Technician/ticketsServices';
import Snackbar from '../../components/feedback/Snackbar';
import ConversationsDetails from '../../components/ui/ConversationsDetails';
import { userAuth } from '../../hooks/userAuth';
import { handleDownloadAttachment } from '../../utils/downloadFile'

export default function EmailConversationApp() {
  const { pid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);  
  const queryClient = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef(null);
  const [pendingMessageDeleteId, setPendingMessageDeleteId] = useState<string | number>(null);
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>(""); 

  const message = "This Job Order is closed. If you need to follow up or require further assistance, please submit a new job order using the following link"
  const url = `${import.meta.env.VITE_API_URL_FRONTEND}/customer-support`

  const {  
    setSnackBarMessage,
    setSnackBarType,
    setSnackBarOpen, 
    snackBarMessage, 
    snackBarOpen, 
    snackBarType 
  } = userAuth();

  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const MAX_FILE_SIZE_MB = 130; 
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const [socket, setSocket] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  
  // Stores the message user selected to reply to (Messenger-style reply target).
  const [repliedMessage, setRepliedMessage] = useState<any | null>(null);

  const { data: ticketInfo, isLoading, isError, error } = useQuery({
    queryKey: ['ticketInformation', pid],
    queryFn: () => fetchTicketDetailsPublic(String(pid)),
    enabled: !!pid,
    retry: false
  });

  const userTicketInformation = ticketInfo?.data || {}; 

  const { data: conversationData } = useQuery({
    queryKey: ['conversations', userTicketInformation?.ticket_id],
    queryFn: () => fetchConversationPublic(userTicketInformation?.ticket_id),
    enabled: !!userTicketInformation?.ticket_id,
  });

  const { 
    mutateAsync: insertConversationMutation, 
    isPending: isInsertConversations 
  } = useMutation({
    mutationFn: insertConversationPublic,
  });

  const {
     mutateAsync: deleteSpecificConversations
  } = useMutation({
    mutationFn: (id: string) => deleteSpecificConversation(id)
  })

  // --- inserting image ---
  const {
    mutateAsync: insertImageConversations
  } = useMutation({
    mutationFn: insertImageConversation
  });

  // Initialize socket connection per ticket 
  useEffect(() => {
    if (!userTicketInformation?.ticket_id) return;

    const s = io(import.meta.env.VITE_API_URL_BACKEND as string, {
      auth: { ticket_id: userTicketInformation.ticket_id },
      path: "/socket.io/",
      transports: ["polling", "websocket"], // try polling first, then upgrade
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    s.on("connect", () => {
      console.log("Connected to socket server");
      s.emit("join_ticket_room", userTicketInformation.ticket_id);
    });

    s.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    s.on("new_ticket_message", (msg: any) => {
      setMessages(prev => [...prev, msg]);
      // Only invalidate queries to refetch from server - this ensures we get attachments
      // Don't add msg directly to state as it doesn't contain attachment data
      queryClient.invalidateQueries({
        queryKey: ['conversations', userTicketInformation?.ticket_id]
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [userTicketInformation?.ticket_id]);


  // Set messages initially
  useEffect(() => {
    if (conversationData?.data) setMessages(conversationData.data);
  }, [conversationData]);

  const scrollToBottom = () => messageEndRef.current?.scrollIntoView({  }); // behavior: "smooth"
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Send message
  const handleSendReply = async () => {
    if (!replyText.trim() && attachedFiles.length === 0) return;
    setLoading(true)
    
    const currentReplyText = replyText;
    const currentAttachedFiles = [...attachedFiles];

    // Preserve selected reply target before clearing input state.
    const currentRepliedMessage = repliedMessage;

    setReplyText('');
    setAttachedFiles([]);

    // Clear reply target immediately after pressing send.
    setRepliedMessage(null);

    // If replying to a specific message, prepend reply metadata into payload.
    const composedMessageBody = buildReplyBody(currentRepliedMessage, currentReplyText);

    const formData = new FormData();
    formData.append('sender_email', userTicketInformation.email);
    formData.append('tickets_id', userTicketInformation?.ticket_id);
    formData.append('sender_name', userTicketInformation.full_name);
    formData.append('message_body', composedMessageBody);
    formData.append('user_role', "Customer");
    formData.append('is_inbound', "1");

    if (currentAttachedFiles.length > 0) {
      currentAttachedFiles.forEach((fileObj) => {
        formData.append('attachments', fileObj.file);
      });
    } 

    try {
      const response = await insertConversationMutation(formData);

      if (response?.success) { 
        // Add locally for messages without attachments
        // const newMessage = {
        //   id: response.data.ticket_ids,
        //   sender_name: userTicketInformation?.full_name || 'Support Team',
        //   sender_email: userTicketInformation.email,
        //   message_body: composedMessageBody,
        //   is_inbound: false,
        //   attachments: [], // optional optimistic placeholder
        //   created_at: new Date().toISOString(),
        // };
  
        // setMessages(prev => [
        //   ...prev,
        //   newMessage
        // ]);

        // // Emit to server for real-time
        // socket?.emit("send_ticket_message", {
        //   ticket_id: userTicketInformation.ticket_id,
        //   message: newMessage
        // });

        queryClient.invalidateQueries({
          queryKey: ['conversations', userTicketInformation.ticket_id]
        }); 
      }
    } catch (error) {
      const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");
      setSnackBarMessage(cleanMessage);
      setSnackBarOpen(true)
      setSnackBarType("error") 
      console.error(error);
    } finally {
      setLoading(false)
    }
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

  const handleDeleteMessageDialog = (id: string | number) => {
    setPendingMessageDeleteId(String(id));
    setDialogTitle("Confirm Delete");
    setDialogMessage("Are you sure you want to delete this message?");
    setDialogOpen(true);
  }

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage('');
    setDialogTitle(''); 
    setPendingMessageDeleteId(null);
  };

  const handleFileSelect = (e: any) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file: any) => file.size <= MAX_FILE_SIZE_BYTES);
    const invalidCount = files.length - validFiles.length;

    if (invalidCount > 0) {
      setSnackBarMessage(`Only files up to ${MAX_FILE_SIZE_MB} MB are allowed.`);
      setSnackBarType("error");
      setSnackBarOpen(true);
    }

    const fileObjects = validFiles.map((file: any) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') || file.type.startsWith('video/')
        ? URL.createObjectURL(file)
        : null
    }));
    setAttachedFiles(prev => [...prev, ...fileObjects]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type?: string) => {
    if (type?.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type?.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // removes embedded reply metadata from text so preview
  const stripReplyMeta =  (value: unknown) =>
    String(value || "").replace(/\[reply_meta\][\s\S]*?\[\/reply_meta\]/g, "").trim();

  // embed reply metadata directly into message body so ui can render a quoted reply
  // even when backend does not have a dedicated reply to yield yet.
  const buildReplyBody = (target: any | null, text: string) => {
    if (!target) return text 

    const fallbackSnippet = 
      target?.attachments?.[0]?.name
      ? `Attachment: ${target.attachments[0].name}`
      : "Message"
    
      const snippet = stripReplyMeta(target?.message_body || fallbackSnippet).slice(0, 100)
      const meta = JSON.stringify({
        id: target?.id,
        sender: target?.sender_name || "Unknown",
        snippet
      });

      return `[reply_meta]${meta}[/reply_meta]\n${text}`;
  }


  // reads reply metadata from message body
  const parseReplyBody = (body: string) => {
    const raw = String(body || "");
    // flexible matcher 
    const match = raw.match(/\[reply_meta\]([\s\S]*?)\[\/reply_meta\]/);

    if (!match){
      return { replyMeta: null, cleanBody: raw };
    }

    try {
      const cleanBody = raw
        .replace(/\[reply_meta\][\s\S]*?\[\/reply_meta\]/, "")
        .replace(/^\s+/, "");

      return {
        replyMeta: JSON.parse(match[1]),
        cleanBody,
      };
    } catch {
      return { replyMeta: null, cleanBody: raw };
    }
  } 

  const handleDeleteMessage = async () => {
    try {
      const response = await deleteSpecificConversations(String(pendingMessageDeleteId)); // call mutation

      if (response?.success) {
        // Don't add msg directly to state as it doesn't contain attachment data
        queryClient.invalidateQueries({
          queryKey: ['conversations', userTicketInformation?.ticket_id]
        });
        
        closeDialog() 
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete ticket. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }


  const handleDialogSubmit = async () => { 
    await handleDeleteMessage();
    closeDialog();
  }

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

    /* automatic close on wider screens */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setShowSidebar(false)
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize)
  }, []);

  if (isLoading) {
    return <SpinningRingLoader />;
  }
  
  if (isError) {
    const respData = (error as any)?.response?.data;
    const statusCode = respData?.statusCode ?? (error as any)?.response?.status;
    const message = respData?.message ?? (error as any)?.message ?? 'An error occurred';

    /* if (statusCode === 403) {
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
    }  */
    
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
      {/* Snackbar */}
      <Snackbar
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
        onClose={closeDialog}
        onSubmit={handleDialogSubmit} 
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

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
          <div>
            <h2 className="bee-title-sm text-gray-900">
              {userTicketInformation.company || 'Support Team'}
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">No messages yet</div>
          ) : (
            messages.map(msg => {
              const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0; 

              // Parse optional embedded reply metadata and remove it from visible message text.
              const { replyMeta, cleanBody } = parseReplyBody(msg.message_body || "");
              const activityLines = Array.isArray(msg.activity_logs)
                ? msg.activity_logs.flatMap((log) => log?.lines || [])
                : [];
              const shouldRenderBubble = Boolean(cleanBody?.trim()) || hasAttachments;

              const isStartAligned = msg.is_inbound;
              
              const replyButton = (
                <div className='flex gap-2'>
                  {msg.is_inbound === 1 && userTicketInformation?.is_closed === 0 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMessageDialog(msg.id)}
                      className={`inline-flex justify-center gap-1 text-xs px-2 py-1 rounded-2xl border items-center ${
                        msg.is_inbound
                          ? "text-gray-600 border-gray-300 bg-white hover:bg-gray-50"
                          : "text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                      title="Delete this message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRepliedMessage(msg)}
                    className={`inline-flex justify-center items-center gap-1 text-xs px-2 py-1 rounded-2xl border ${
                      msg.is_inbound
                        ? "text-gray-600 border-gray-300 bg-white hover:bg-gray-50"
                        : "text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                    title="Reply to this message"
                  >
                    <Reply className="w-3 h-3" />
                  </button>
                </div>
              );
              
              return (
                <div key={msg.id} ref={messageEndRef} className="w-full space-y-2">
                  {activityLines.length > 0 && (
                    <div className="mx-auto w-full max-w-2xl text-center text-xs sm:text-sm text-gray-500 space-y-1 break-words">
                      {activityLines.map((line, idx) => (
                        <p key={`${msg.id}-${idx}`} className="leading-relaxed">{line}</p>
                      ))}
                    </div>
                  )}

                  {shouldRenderBubble && (
                    <div className={`flex ${msg.is_inbound ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-center gap-2">
                        {/* Start aligned: message then reply. End aligned: reply then message. */}
                        {isStartAligned ? replyButton : null}
                        <div
                          className={`max-w-2xl rounded-lg p-4 ${
                            msg.is_inbound ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'
                          } ${repliedMessage?.id === msg.id ? 'ring-2 ring-[#FCD000] ring-offset-2 shadow-md' : ''}`}
                        >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-semibold text-sm">{msg.is_inbound ? msg.sender_name : "Support Team"}</span>
                        </div>
                        {/* Show quoted reply context (Messenger-like) when metadata exists. */}
                        {replyMeta && (
                          <div className={`mb-2 rounded-md border-l-4 p-2 text-xs ${
                            msg.is_inbound
                              ? "border-yellow-300 bg-white/10 text-gray-100"
                              : "border-blue-400 bg-blue-50 text-blue-800"
                          }`}>
                            <p className="font-semibold">
                              Replying to Support Team
                               {/* {replyMeta?.sender || "message"} */}
                            </p>
                            <p className="truncate">{replyMeta?.snippet || ""}</p>
                          </div>
                        )}
                        {/* Render only clean message body so [reply_meta] is never shown to users. */}
                        {cleanBody?.trim() && <p className="text-sm whitespace-pre-wrap">{cleanBody}</p>}
                        {msg.attachments?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.attachments.map((file, idx) => (
                              file.type?.startsWith('image/') ? (
                                // Display images automatically
                                <div key={idx} className="mt-2">
                                  <img
                                    src={file.attachment_url}
                                    alt={file.name}
                                    className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition"
                                    onClick={() => setSelectedImage(file.attachment_url)}
                                  />
                                  <p className="text-xs mt-1 opacity-70">{file.name}</p>
                                </div>
                              ) : file.type?.startsWith('video/') ? (
                                // Display videos with inline player
                                <div key={idx} className="mt-2">
                                  <video
                                    src={file.attachment_url}
                                    controls
                                    className="max-w-full max-h-64 rounded-lg"
                                  />
                                  <p className="text-xs mt-1 opacity-70">{file.name}</p>
                                </div>
                              ) : (
                                // Display other file types as downloadable items
                                <div key={idx} className={`flex items-center gap-2 p-2 rounded ${
                                  msg.is_inbound
                                    ? 'bg-gray-700 bg-opacity-50'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}>
                                  {getFileIcon(file.type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{file.name}</p>
                                    <p className="text-xs opacity-70">{formatFileSize(file.size)}</p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDownloadAttachment(file)}
                                    className="p-1 hover:bg-gray-200 rounded transition flex items-center justify-center"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" /> {formatDate(msg.created_at)}
                        </div>
                        </div>
                        {isStartAligned ? null  : replyButton}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}

          {Number(userTicketInformation?.is_closed) === 1 && (
            <div className="flex justify-center">
              <div className="max-w-2xl w-full rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  {message}{" "}
                  <a
                    href={url}
                    className="font-semibold text-amber-950 hover:text-amber-700"
                    target="_blank"
                    rel="noreferrer"
                  >
                    BEESEE Customer Support
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reply Box */}
        {userTicketInformation?.is_closed === 0 && (
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Show selected reply target before sending (same behavior as technician page). */}
            {repliedMessage && (
              <div className="mb-3 p-3 rounded-lg border border-[#FCD000] bg-yellow-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-yellow-800">
                      Replying to Support Team
                    </p>
                    <p className="text-xs text-yellow-700 truncate">
                      {stripReplyMeta(repliedMessage.message_body || repliedMessage?.attachments?.[0]?.name || "Message")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRepliedMessage(null)}
                    className="text-yellow-700 hover:text-yellow-900"
                    title="Cancel reply"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((fileObj, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg p-2 pr-1"
                  >
                    {fileObj.preview ? (
                      fileObj.type?.startsWith('video/') ? (
                        <video
                          src={fileObj.preview}
                          className="w-10 h-10 rounded object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img 
                          src={fileObj.preview} 
                          alt={fileObj.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )
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
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                /*  accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls" */
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
                rows="3"
                style={{color: '#000000', caretColor: '#000000'}}
                disabled={loading}
              />
              <button
                onClick={handleSendReply}
                disabled={loading || isInsertConversations || (!replyText.trim() && attachedFiles.length === 0)}
                className="px-6 py-3 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isInsertConversations ? "Sending..." : "Send"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Reply will be sent via email and saved in the conversation
              {attachedFiles.length > 0 && ` • ${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''} attached`}
            </p>

            {isInsertConversations && (
              <p className="text-xs text-gray-600 mt-1">Uploading attachments, please wait...</p>
            )}
          </div>
        )}
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
              <h2 className='text-white text-[20px] font-bold flex items-center gap-2'>
                <Inbox className='w-5 h-5'/>
                Job Order Information
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
        <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#000000'}}>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Job Order Information
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
