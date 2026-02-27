import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client'
import {
  Send, 
  User, 
  Clock, 
  Inbox, 
  Check,
  X,
  Trash2,
  File,
  FileText,
  Download,
  Paperclip,
  Reply,
  ArrowLeftToLine,
  Image as ImageIcon,  // Rename this!
  Upload,
} from 'lucide-react'; 
import AlertDialog from '../../../components/feedback/AlertDialog'; 
import { useParams } from 'react-router-dom'; 
import { handleDownloadAttachment } from '../../../utils/downloadFile'
import { 
  fetchTicketDetails, 
  fetchConversation,
  insertConversation,
  insertImageConversation,
  updateStatus,
  deleteTickets,
  uploadJobOrders,
  deleteSpecificConversation
} from '../../../services/Technician/ticketsServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConversationsDetails from '../../../components/ui/ConversationsDetails';
import { userAuth } from '../../../hooks/userAuth';
 import { useNavigate } from 'react-router-dom';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'

export default function EmailConversationApp() {
  const { pid } = useParams();  
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState<boolean>(false);  
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const jobOrderFileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [dialogAction, setDialogAction] = useState<'delete' | 'upload' | 'messageDelete' | null>(null);
  const [pendingJobOrderFile, setPendingJobOrderFile] = useState<File | null>(null);
  const [pendingMessageDeleteId, setPendingMessageDeleteId] = useState<string | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [socket, setSocket] = useState<any>(null);
  // Stores the message user selected to reply to (Messenger-style reply target).
  const [repliedMessage, setRepliedMessage] = useState<any | null>(null);
  // Client-side upload size limit.
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const { 
    userInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType, 
  } = userAuth()

  const { data: ticketInfo, isLoading, refetch: refetchTicketInfo } = useQuery({
    queryKey: ['ticketInformation', pid],
    queryFn: () => fetchTicketDetails(String(pid)),
    enabled: !!pid
  });

  const { 
    mutateAsync: deleteTicket, 
    isPending: isDeletingTicket } = useMutation({
    mutationFn: deleteTickets
  });

  const { 
    mutateAsync: uploadJobOrder,
    isPending
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => uploadJobOrders(id, data),
  });

  const {
    mutateAsync: deleteSpecificConversations
  } = useMutation({
    mutationFn: (id: string) => deleteSpecificConversation(id),
  })

  const userTicketInformation = ticketInfo?.data || {}; 

  const { data: conversationsData, } = useQuery({
    queryKey: ['conversations', userTicketInformation?.ticket_id],
    queryFn: () => fetchConversation(userTicketInformation?.ticket_id),
    enabled: !!userTicketInformation?.ticket_id
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

      queryClient.invalidateQueries({
        queryKey: ['ticketInformation', pid],
      })
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [userTicketInformation?.ticket_id]);

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
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);
    const invalidCount = files.length - validFiles.length;

    if (invalidCount > 0) {
      setSnackBarMessage(`Only files up to ${MAX_FILE_SIZE_MB} MB are allowed.`);
      setSnackBarType("error");
      setSnackBarOpen(true);
    }

    const fileObjects = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachedFiles(prev => [...prev, ...fileObjects]);
    e.target.value = "";
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

  // Removes embedded reply metadata from text so previews/snippets stay clean.
  const stripReplyMeta = (value: unknown) =>
    String(value || "").replace(/\[reply_meta\][\s\S]*?\[\/reply_meta\]/g, "").trim();

  // Embeds reply metadata directly into message_body so UI can render a quoted reply
  // even when backend does not have a dedicated reply_to field yet.
  const buildReplyBody = (target: any | null, text: string) => {
    if (!target) return text;

    const fallbackSnippet =
      target?.attachments?.[0]?.name
        ? `Attachment: ${target.attachments[0].name}`
        : "Message";
    const snippet = stripReplyMeta(target?.message_body || fallbackSnippet).slice(0, 100);
    const meta = JSON.stringify({
      id: target?.id,
      sender: target?.sender_name || "Unknown",
      snippet,
    });

    return `[reply_meta]${meta}[/reply_meta]\n${text}`;
  };

  // Reads reply metadata from message_body and returns:
  // 1) replyMeta for UI quote block
  // 2) cleanBody for actual message content
  const parseReplyBody = (body: string) => {
    const raw = String(body || "");
    // Flexible matcher: works even if backend adds spaces/newlines around metadata.
    const match = raw.match(/\[reply_meta\]([\s\S]*?)\[\/reply_meta\]/);
    if (!match) {
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
  };

  const handleSendReply = async () => {
    if ((!replyText.trim() && attachedFiles.length === 0)) return;
    if (!userTicketInformation?.ticket_id) {
      setSnackBarMessage("Ticket ID is missing.")
      setSnackBarType("error")
      setSnackBarOpen(true);
      return;
    }
 
    setLoading(true);

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
      formData.append('sender_email', String(userTicketInformation.email || 'admin@beesee.com'));
      formData.append('tickets_id', String(userTicketInformation?.ticket_id ?? ''));
      formData.append('sender_name', String(userInfo?.full_name || 'Support Team'));
      formData.append('message_body', composedMessageBody);
      formData.append('user_role', String(userInfo?.role || ''));
      formData.append('is_inbound', "0");

      if (currentAttachedFiles.length > 0) {
        currentAttachedFiles.forEach((fileObj) => {
         formData.append('attachments', fileObj.file);
        });
      }
 
    try {
      const response = await insertConversations(formData)

      if (response?.success) {
        await refetchTicketInfo(); 

        // Add locally for messages without attachments
        // const newMessage = {
        //   id: response.data.ticket_ids,
        //   sender_name: userInfo?.full_name || 'Support Team',
        //   sender_email: userTicketInformation.email,
        //   message_body: currentReplyText,
        //   user_role: userInfo?.role,
        //   is_inbound: false,
        //   attachments: [], // optional optimistic placeholder
        //   created_at: new Date().toISOString(),
        // };
 
        // // Add message to screen immediately
        // setMessages(prev => [
        //   ...prev,
        //   newMessage
        // ]);

        // emit to server for real-time
        // socket?.emit("send_ticket_message", {
        //   ticket_id: userTicketInformation?.ticket_id,
        //   message: newMessage
        // });

        queryClient.invalidateQueries({
          queryKey: ['conversations', userTicketInformation?.ticket_id]
        }) 
      }

    } catch (error) { 
      const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");
      setSnackBarMessage(cleanMessage);
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
      if (!userTicketInformation?.ticket_id) {
        setSnackBarMessage("Ticket ID is missing.")
        setSnackBarType("error")
        setSnackBarOpen(true)
        return
      }

      if (userTicketInformation.after_image.length  === 0 ) {
        setSnackBarMessage("Please upload after report images ")
        setSnackBarType("error")
        setSnackBarOpen(true)
        return
      } 

      const payload = new FormData();
      payload.append("status", "resolved");

      const response = await updateStats({
        reference_number: String(userTicketInformation?.ticket_id),
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

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage('');
    setDialogTitle('');
    setDialogAction(null);
    setPendingJobOrderFile(null);
    setPendingMessageDeleteId(null);
  };

  const processJobOrderUpload = async (selectedFile: File) => {
    try {
      if (!userTicketInformation?.ticket_id) {
        setSnackBarMessage("Ticket ID is missing.");
        setSnackBarType("error");
        setSnackBarOpen(true);
        return;
      }

      const formData = new FormData(); 
      formData.append("job_order_pdf", selectedFile);
      formData.append("ticket_id", userTicketInformation?.ticket_id);

      const response = await uploadJobOrder({
        id: String(userTicketInformation?.id),
        data: formData,
      });

      if (response?.success) {
        setSnackBarMessage("Job order PDF uploaded successfully.");
        setSnackBarType("success");
        setSnackBarOpen(true);
        await refetchTicketInfo();
        queryClient.invalidateQueries({
          queryKey: ['conversations', userTicketInformation?.ticket_id]
        });
      } else {
        setSnackBarMessage("Failed to upload. Please try again.");
        setSnackBarType("error");
        setSnackBarOpen(true);
      }

    } catch (error) {
      setSnackBarMessage("Failed to upload. Please try again.")
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  // Upload A Job Order
  const handleUploadJobOrder = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    // if (!isPdf) {
    //   setSnackBarMessage("Only PDF files are allowed.");
    //   setSnackBarType("error");
    //   setSnackBarOpen(true);
    //   e.target.value = "";
    //   return;
    // }

    setPendingJobOrderFile(selectedFile);
    setDialogAction('upload');
    setDialogTitle("Confirm Upload");
    setDialogMessage("Are you sure you want to upload this job order PDF?");
    setDialogOpen(true);
    e.target.value = "";
  }

  const handleDelete = (ids: number[]) => {
    const jobOrderPermission = userInfo?.permissions?.find(p => p.parent_id === 'job-order' && p.children_id === '');
    if (!jobOrderPermission || !jobOrderPermission.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete tickets.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }

    setDeleteIds(ids)
    setDialogAction('delete')
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete tickets?`)

  };

  const handleConfirmDelete = async () => {
    try {
      if (isDeletingTicket) return
      const response = await deleteTicket(deleteIds); // call mutation

      if (response?.success) {
        closeDialog()
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

  const handleDeleteMessage = async (id: string) => {
    try {
      const response = await deleteSpecificConversations(id);

      if (response?.success) {
        setSnackBarMessage("Message deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);
        queryClient.invalidateQueries({
          queryKey: ['conversations', userTicketInformation?.ticket_id]
        });
      }
    } catch (error) {
      const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");

      setSnackBarMessage(cleanMessage)
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const handleDeleteMessageDialog = (id: string | number) => {
    setPendingMessageDeleteId(String(id));
    setDialogAction('messageDelete');
    setDialogTitle("Confirm Delete");
    setDialogMessage("Are you sure you want to delete this message?");
    setDialogOpen(true);
  }

  const handleDialogSubmit = async () => {
    if (dialogAction === 'delete') {
      await handleConfirmDelete();
      return;
    }

    if (dialogAction === 'upload' && pendingJobOrderFile) {
      await processJobOrderUpload(pendingJobOrderFile);
      closeDialog();
      return;
    }

    if (dialogAction === 'messageDelete' && pendingMessageDeleteId) {
      await handleDeleteMessage(pendingMessageDeleteId);
      closeDialog();
      return;
    }

    closeDialog();
  }

  if (isLoading) {
    return <SpinningRingLoader />;
  }

  return (
    <div className="flex h-full bg-gray-50"> 

      {/* Upload PDF file */}
      <input
        ref={jobOrderFileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,.pdf,application/pdf"
        className="hidden"
        onChange={handleUploadJobOrder}
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

      {/* Messages View */}
      <div className="flex-1 flex flex-col"> 
        <>
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
            <div>
              <h2 className="bee-title-sm text-gray-900">
                Issue: {userTicketInformation.issue_name || userTicketInformation.item_name}
              </h2> 
            </div>

            {/* ticket */}
            <div className='flex gap-3 items-center'> 

              {userTicketInformation?.job_order_url_finish && (
                <button 
                  onClick={() => markAsCompleted()}
                  title="Mark as completed"
                  className='px-3 py-1 rounded-full text-md border bg-green-50'
                >
                  <Check className='text-green-700'/>
                </button>
              )}

                <div className='md:hidden'>
                  <button 
                    onClick={() => setShowSidebar(true)}
                    title="View Job Order Information"
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
                messages.map((msg) => {
                  const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0;

                  // Keep activity-log-only rows, but allow updated messages with attachments
                  // (e.g. PDF job orders) to render as normal message bubbles.
                  if (msg.is_updated === 1 && !hasAttachments) {
                    return (
                      <div key={msg.id} ref={messageEndRef} className="w-full">
                        <div className="mx-auto w-full max-w-2xl text-center text-xs sm:text-sm text-gray-500 space-y-1 break-words">
                          {msg.activity_logs?.flatMap((log) => log.lines || []).map((line, idx) => (
                            <p key={`${msg.id}-${idx}`} className='leading-relaxed'>{line}</p>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Extract quoted-reply info (if present) and clean message text for display.
                  const { replyMeta, cleanBody } = parseReplyBody(msg.message_body || "");

                  const isStartAligned = msg.is_inbound;

                  const replyButton = (
                    <div className='flex gap-2'>
                      {msg.is_inbound === 0 && (
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
                        className={`inline-flex justify-center gap-1 text-xs px-2 py-1 rounded-2xl border items-center ${
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

                  const messageBubble = (
                    <div
                      className={`max-w-2xl rounded-lg p-4 ${
                        msg.is_inbound
                          ? 'bg-white border border-gray-200'
                          : 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
                      // Highlight the message currently selected as the reply target.
                      } ${repliedMessage?.id === msg.id ? 'ring-2 ring-[#FCD000] ring-offset-2 shadow-md' : ''}`} 
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {msg.sender_name}
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
                      {/* Render quoted-reply preview on top of current message bubble. */}
                      {replyMeta && (
                        <div className={`mb-2 rounded-md border-l-4 p-2 text-xs ${
                          msg.is_inbound
                            ? "border-blue-400 bg-blue-50 text-blue-800"
                            : "border-yellow-300 bg-white/10 text-gray-100"
                        }`}>
                          <p className="font-semibold">
                            Replying to {replyMeta?.sender || "message"}
                          </p>
                          <p className="truncate">{replyMeta?.snippet || ""}</p>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{cleanBody}</p>
                      
                      {/* Attachments Display */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.attachments.map((attachment, idx) => (
                            attachment.type?.startsWith('image/') ? (
                              // Display images automatically
                              <div key={idx} className="mt-2">
                                <img
                                  src={attachment.attachment_url}
                                  alt={attachment.name}
                                  className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition"
                                  onClick={() => setSelectedImage(attachment.attachment_url)}
                                />
                                <p className="text-xs mt-1 opacity-70">{attachment.name}</p>
                              </div>
                            ) : (
                              // Display other file types as downloadable items
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
                                  type="button"
                                  onClick={() => handleDownloadAttachment(attachment)}
                                  className="p-1 hover:bg-gray-200 rounded transition"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      <div className="flex items-center mt-2">
                        <div
                          className={`flex items-center gap-1 text-xs ${
                            msg.is_inbound ? 'text-gray-500' : 'text-gray-300'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={msg.id}
                      ref={messageEndRef}
                      className={`flex ${msg.is_inbound ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className="flex items-center gap-2">
                        {isStartAligned ? (
                          <>
                            {messageBubble}
                            {replyButton}
                          </>
                        ) : (
                          <>
                            {replyButton}
                            {messageBubble}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
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
          {userTicketInformation.is_closed === 0 && (
            <div className="p-4 bg-white border-t border-gray-200">
            {/* Composer-level preview of the currently selected reply target. */}
            {repliedMessage && (
              <div className="mb-3 p-3 rounded-lg border border-[#FCD000] bg-yellow-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-yellow-800">
                      Replying to {repliedMessage.sender_name}
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
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic"
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
                style={{color: '#000000', caretColor: '#000000'}}
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
          )}
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
              <h2 className="text-xl text-[20px] font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                Job Order Information
              </h2>

              <div className='flex items-center gap-2'>
                {userTicketInformation?.job_order_url && (
                  <button 
                    disabled={isPending}
                    title="Upload Job Order"
                    onClick={() => jobOrderFileInputRef.current?.click()}
                    className="text-blue-700 bg-blue-100 p-2 rounded-md hover:bg-blue-200 transition-colors flex justify-center items-center"
                  >
                    <Upload size={16} />
                  </button>
                )}

                <button 
                  title="Delete Job Order"
                  onClick={(e) => handleDelete([userTicketInformation.id])}
                  className="text-red-700 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors flex justify-center items-center"
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
        <div className="flex justify-between p-4 border-b border-gray-200 "  style={{ backgroundColor: '#000000' }}>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Job Order Information
            </h2>
          </div>
          <div className='space-x-2'>
            {userTicketInformation?.job_order_url && (
              <button 
                title="Upload Job Order"
                onClick={() => jobOrderFileInputRef.current?.click()}
                className="text-blue-700 bg-blue-100 p-2 rounded-md hover:bg-blue-200 transition-colors "
              >
                <Upload size={16} />
              </button>
            )}

            <button 
              title="Delete Job Order"
              onClick={(e) => handleDelete([userTicketInformation.id])}
              className="text-red-700 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors "
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
