import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client'
import {
  Send, 
  User, 
  Clock, 
  Inbox, 
  TicketCheck,
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
  TicketX,
  ChevronLeft,
  ChevronRight
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
  markAsClosed,
  deleteTickets,
  uploadJobOrders,
  deleteSpecificConversation,
  fetchStatus
} from '../../../services/Technician/ticketsServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConversationsDetails from '../../../components/ui/ConversationsDetails';
import { userAuth } from '../../../hooks/userAuth';
 import { useNavigate } from 'react-router-dom';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'

export default function EmailConversationApp() {
  
  const { 
    userInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType, 
  } = userAuth()

  const { pid } = useParams();  
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState<boolean>(false);  
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const jobOrderFileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImageList, setSelectedImageList] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState<boolean>(false); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [dialogAction, setDialogAction] = useState<'delete' | 'upload' | 'messageDelete' | 'markAsClosed' | null>(null);
  const [pendingJobOrderFile, setPendingJobOrderFile] = useState<File | null>(null);
  const [pendingMessageDeleteId, setPendingMessageDeleteId] = useState<string | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [triggerCompletedClosed, setTriggerCompletedClosed] = useState<boolean>(false);
  // Stores the message user selected to reply to (Messenger-style reply target).
  const [repliedMessage, setRepliedMessage] = useState<any | null>(null);
  // Client-side upload size limit.
  const MAX_FILE_SIZE_MB = 130; // Set your desired max file size in MB
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const message = "This Job Order has been closed."

  const selectedImage = selectedImageList[selectedImageIndex] ?? null;

  const openImageViewer = (image: string, imageList?: string[], index?: number) => {
    const list = imageList && imageList.length > 0 ? imageList : [image];
    const resolvedIndex =
      typeof index === "number"
        ? index
        : Math.max(0, list.indexOf(image));
    const safeIndex = Math.min(Math.max(resolvedIndex, 0), list.length - 1);
    setSelectedImageList(list);
    setSelectedImageIndex(safeIndex);
  };

  const closeImageViewer = () => {
    setSelectedImageList([]);
    setSelectedImageIndex(0);
  };

  const handlePrevImage = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setSelectedImageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextImage = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setSelectedImageIndex((prev) => Math.min(prev + 1, selectedImageList.length - 1));
  };
  
  const jobOrderPermission = userInfo?.permissions?.find(p => p.parent_id === 'job-order' && p.children_id === '');

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
    mutateAsync: deleteSpecificConversations,
    isPending: isDeleteSpecificConversation
  } = useMutation({
    mutationFn: (id: string) => deleteSpecificConversation(id),
  })

  const {
    mutateAsync: markAsClosedMutation,
    isPending: isMarkAsClosed
  } = useMutation({
    mutationFn: markAsClosed
  });

  const userTicketInformation = ticketInfo?.data || {}; 

  const { data: conversationsData, refetch: fetchTicketConversations } = useQuery({
    queryKey: ['conversations', userTicketInformation?.ticket_id],
    queryFn: () => fetchConversation(userTicketInformation?.ticket_id),
    enabled: !!userTicketInformation?.ticket_id
  });

  // fetch status for conditional rendering  
  const { data: statusData, refetch: fetchStatusData } = useQuery({
    queryKey: ['status', userTicketInformation?.ticket_id, userTicketInformation?.status],
    queryFn: () =>
      fetchStatus(
      userTicketInformation.is_closed === 0 ? userTicketInformation.status : "closed" ,
        userTicketInformation.status === 'open' || userTicketInformation.status === 'ongoing'
          ? 'created_at'
          : 'updated_at',
        userTicketInformation.is_closed
      ),
    enabled: !!userTicketInformation?.status && !!userTicketInformation?.ticket_id,
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
     fetchTicketConversations();

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
    mutateAsync: insertConversations,
    isPending: isInsertConversations,
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
    mutateAsync: updateStats,
    isPending: isUpdateStats
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
      preview: file.type.startsWith('image/') || file.type.startsWith('video/')
        ? URL.createObjectURL(file)
        : null
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
      formData.append("user_id", String(userInfo?.id));

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

        await fetchTicketConversations();
      }

    } catch (error: any) { 
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

  const markAsClosedJobOrder = async () => {
    try {
      const formData = new FormData();
      formData.append("reference_number", userTicketInformation?.ticket_id);
      formData.append("is_closed", "1");
      formData.append("user_id", String(userInfo?.id ?? ''));
      formData.append("status", "resolved");

      const response = await markAsClosedMutation(formData);

      if (response?.success) {
        setSnackBarMessage("Job order marked as closed successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        setTriggerCompletedClosed(true) // Set flag to indicate we just completed a job order.
        await nextJobOrderStep(true) // Move to next or return to list after completion.
      }


    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");

      setSnackBarMessage(cleanMessage)
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  const markAsCompleted = async() => {
    try {
      if (!userTicketInformation?.ticket_id) {
        setSnackBarMessage("Ticket ID is missing.")
        setSnackBarType("error")
        setSnackBarOpen(true)
        return
      }

      if (userTicketInformation.after_image.length  === 0 ) {
        setSnackBarMessage("Please upload after service report images ")
        setSnackBarType("error")
        setSnackBarOpen(true)
        return
      } 

      const payload = new FormData();
      payload.append("status", "resolved");
      payload.append("user_id", String(userInfo?.id ?? ''));

      const response = await updateStats({
        reference_number: String(userTicketInformation?.ticket_id),
        payload
      });

      if (response?.success) {
        setSnackBarMessage("Successfully Mark as Completed")
        setSnackBarType("success")
        setSnackBarOpen(true) 

        setTriggerCompletedClosed(true) // Set flag to indicate we just completed a job order.
        await nextJobOrderStep(true) // Move to next or return to list after completion.
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
      formData.append("user_id", String(userInfo?.id ?? ''));

      const response = await uploadJobOrder({
        id: String(userTicketInformation?.id),
        data: formData,
      });

      if (response?.success) {
        setSnackBarMessage("Job order PDF uploaded successfully.");
        setSnackBarType("success");
        setSnackBarOpen(true);
        await refetchTicketInfo();
        await fetchTicketConversations();
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
      const formData = new FormData();
      formData.append("ids", JSON.stringify(deleteIds));
      formData.append("user_id", String(userInfo?.id ?? ''));

      const response = await deleteTicket(formData); // call mutation

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
        await fetchTicketConversations();
      }
    } catch (error) {
      const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");

      setSnackBarMessage(cleanMessage)
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const handleMarkAsClosed = async () => {
    setDialogAction('markAsClosed');
    setDialogTitle("Confirm Mark as Closed");
    setDialogMessage("Are you sure you want to mark this job order as closed?");
    setDialogOpen(true);
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

    if (dialogAction === 'markAsClosed') {
      await markAsClosedJobOrder();
    }

    closeDialog();
  }

  const nextJobOrderStep = async (forceReturnToList = false) => {
    // Debug: move to the next PID based on statusData order
    const statusList = statusData?.data ?? [];
    const currentIndex = statusList.findIndex((item: any) => item.pid === pid);

    if (currentIndex === -1) {
      setSnackBarMessage("Current ticket not found in status list.");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    const nextItem = statusList[currentIndex + 1];
    if (!nextItem?.pid) {
      const shouldReturnToList = forceReturnToList || triggerCompletedClosed;
      console.log("No next item. Force return to list?", forceReturnToList, "Triggered by completion?", triggerCompletedClosed);
      if (shouldReturnToList) {
        setTriggerCompletedClosed(false) // Reset flag after redirecting to job order list.
        navigate("/beesee/job-order");
        return;
      }

      setSnackBarMessage("You are already at the last job order.");
      setSnackBarType("info");
      setSnackBarOpen(true);
      return;
    }

      await refetchTicketInfo();
      await fetchTicketConversations();
      await fetchStatusData();

    navigate(`/beesee/job-order/conversation/${nextItem.pid}`);
  }

  const previousJobOrderStep = () => {
    // Debug: move to the previous PID based on statusData order
    const statusList = statusData?.data ?? [];
    const currentIndex = statusList.findIndex((item: any) => item.pid === pid);

    if (currentIndex === -1) {
      setSnackBarMessage("Current ticket not found in status list.");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    const prevItem = statusList[currentIndex - 1];
    if (!prevItem?.pid) {
      setSnackBarMessage("You are already at the first job order.");
      setSnackBarType("info");
      setSnackBarOpen(true);
      return;
    }

    navigate(`/beesee/job-order/conversation/${prevItem.pid}`);
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
        isLoading={
          dialogAction === 'delete'
            ? isDeletingTicket
            : dialogAction === 'upload'
            ? isPending
            : dialogAction === 'messageDelete'
            ? isDeleteSpecificConversation
            : false
        }
      />

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeImageViewer}
        >
          <button 
            onClick={(event) => {
              event.stopPropagation();
              closeImageViewer();
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={32} />
          </button>
          {selectedImageList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                disabled={selectedImageIndex === 0}
                className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full p-2 text-white transition ${
                  selectedImageIndex === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-white/10"
                }`}
                title="Previous image"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                disabled={selectedImageIndex === selectedImageList.length - 1}
                className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full p-2 text-white transition ${
                  selectedImageIndex === selectedImageList.length - 1
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-white/10"
                }`}
                title="Next image"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}
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
            <div className='flex gap-2 items-center '> 

              {userTicketInformation?.is_closed != 1 && 
                userTicketInformation?.status != 'resolved' && 
                userTicketInformation?.job_order_url_finish && (
                <button 
                  onClick={() => markAsCompleted()}
                  title="Mark as completed"
                  disabled={isUpdateStats}
                  className='inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <TicketCheck className='h-4 w-4' />
                  <span className='hidden sm:inline'>Complete</span>
                </button>
              )}

              {jobOrderPermission && 
                jobOrderPermission.actions.includes('close_job_order') &&
                !userTicketInformation?.is_closed && (
                <button 
                  onClick={() => handleMarkAsClosed()}
                  title="Mark as closed"
                  disabled={isMarkAsClosed}
                  className='inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <TicketX className='h-4 w-4' />
                  <span className='hidden sm:inline'>Closed</span>
                </button>
              )}

                <div className='md:hidden'>
                  <button 
                    onClick={() => setShowSidebar(true)}
                    title="View Job Order Information"
                    className='inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300'>
                  <ArrowLeftToLine className='h-4 w-4' />
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
                  <div className="text-gray-400">Loadfing messages...</div>
                </div>
              ) : (
                messages.map((msg) => {
                  const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0;
                  // Extract quoted-reply info (if present) and clean message text for display.
                  const { replyMeta, cleanBody } = parseReplyBody(msg.message_body || "");
                  const activityLines = Array.isArray(msg.activity_logs)
                    ? msg.activity_logs.flatMap((log) => log?.lines || [])
                    : [];
                  const shouldRenderBubble = Boolean(cleanBody?.trim()) || hasAttachments;

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
                      {cleanBody?.trim() && (
                        <p className="text-sm whitespace-pre-wrap break-words">{cleanBody}</p>
                      )}
                      
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
                                  onClick={() => openImageViewer(attachment.attachment_url)}
                                />
                                <p className="text-xs mt-1 opacity-70">{attachment.name}</p>
                              </div>
                            ) : attachment.type?.startsWith('video/') ? (
                              // Display videos with inline player
                              <div key={idx} className="mt-2">
                                <video
                                  src={attachment.attachment_url}
                                  controls
                                  className="max-w-full max-h-64 rounded-lg"
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
                    <div key={msg.id} ref={messageEndRef} className="w-full space-y-2">
                      {activityLines.length > 0 && (
                        <div className="mx-auto w-full max-w-2xl text-center text-xs sm:text-sm text-gray-500 space-y-1 break-words">
                          {activityLines.map((line, idx) => (
                            <p key={`${msg.id}-${idx}`} className="leading-relaxed">{line}</p>
                          ))}
                        </div>
                      )}

                      {shouldRenderBubble && (
                        <div
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
                      )}
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

          {Number(userTicketInformation?.is_closed) === 1 && (
            <div className="flex justify-center mb-2 text-center">
              <div className="max-w-2xl w-full rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  {message}{" "} 
                </p>
              </div>
            </div>
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
                style={{color: '#000000', caretColor: '#000000'}}
                rows="3"
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
            <div className='p-4 border-b md:flex space-y-2 bg-gradient-to-r from-gray-900 to-gray-800 justify-between items-center'>
              <h2 className="text-xl text-[20px] font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                Job Order Information
              </h2>

              <div className='flex items-center gap-2'>
                <button 
                  title='Previous Job Order'
                  onClick={previousJobOrderStep}
                  className='bg-white flex items-center justify-center p-2 rounded-md hover:bg-gray-200'>
                  <ChevronLeft className='w-5 h-5'/>
                </button>
                <button 
                  title="Next Job Order"
                  onClick={() => nextJobOrderStep()}
                  className='bg-white flex items-center justify-center p-2 rounded-md hover:bg-gray-200'>
                  <ChevronRight className='w-5 h-5'/>
                </button>

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
                <button className='text-white bg-gray-500 hover:bg-gray-700 flex justify-center items-center rounded-md' onClick={() => setShowSidebar(false)}>
                  <X />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ConversationsDetails 
                userTicketInformation={userTicketInformation}
                setSelectedImage={openImageViewer}
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
        <div className="flex justify-between items-center p-4 border-b border-gray-200 "  style={{ backgroundColor: '#000000' }}>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Job Order Information
            </h2>
          </div>
          <div className='space-x-1 flex gap-1'>
            <div className='flex gap-1'>
              <button 
                title="Previous Job Order"
                onClick={previousJobOrderStep}
                className='bg-white p-2 rounded-md hover:bg-gray-200'>
                <ChevronLeft className='w-5 h-5'/>
              </button>
              <button 
                title='Next Job Order'
                onClick={() => nextJobOrderStep()}
                className='bg-white p-2 rounded-md hover:bg-gray-200'>
                <ChevronRight className='w-5 h-5'/>
              </button>
            </div>

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
            setSelectedImage={openImageViewer}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            setShowSidebar={setShowSidebar}
          />
        </div>
      </div>
    </div>
  );
}


