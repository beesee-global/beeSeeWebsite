import React, { useRef, useState } from 'react'
import { pdf } from "@react-pdf/renderer";
import JobOrderPDF from "../../utils/JobOrderPDF"; 
import { downloadFile } from '../../utils/downloadFile'
import { fetchCategoriesSortedByName } from '../../services/Technician/categoryServices'
import { fetchProducts, fetchIssueById } from '../../services/Technician/issuesServices'
import CustomTextField from '../Fields/CustomTextField';
import CustomSelectField from '../Fields/CustomSelectField';
import { useQuery, useQueryClient } from '@tanstack/react-query';  
import { 
  sentJobOder, 
  updateSerialNumber,
  beforeAfterInsert ,
  deleteBeforeAfterAttachment,
  saveRemarks
} from '../../services/Technician/ticketsServices'
import JobOrderFlowDialog from '../../pages/TechnicianPage/Home/components/JobOrderFlowDialog';
import { useMutation } from '@tanstack/react-query'; 
import {
  Mail,
  Ticket, 
  Phone,
  MessageSquare,
  Send,
  AlertCircle,
  User,
  Download,
  Image as ImageIcon,
  Calendar,
  FileText,
  FileCheck2,
  FileSearch,
  Barcode,
  Trash2,
  Upload, 
  Save,
  BadgeQuestionMark
} from "lucide-react" 
import { userAuth } from '../../hooks/userAuth';
import AlertDialog from '../feedback/AlertDialog';

interface formData {
  categories_id: number | string;
  product_id: number | string | null;
  issue_id: string | number | null;
  serial_number: string
  location?: string
  item_name?: string
  remarks?: string
}

interface ConversationsDetailsProps {
  userTicketInformation: any;
  setSelectedImage: (image: string, imageList?: string[], index?: number) => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>; 
  publicConversation?: boolean; 
}

const ConversationsDetails: React.FC<ConversationsDetailsProps> = ({
  userTicketInformation,
  setSelectedImage,
  formatDate,
  getStatusColor,
  setShowSidebar, 
  publicConversation = false, 
}) => {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [ticket_id, setTicket_id] = useState<string> ("");
  const [dialogAction, setDialogAction] = useState<"delete" | "upload" | "sendJobOrder" | "updateSerialNumber" | "remarks" | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"before" | "after" | "">("");
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<File[]>([]);
  const beforeAfterFileInputRef = useRef<HTMLInputElement>(null);
  const [jobOrderFlowDialogOpen, setJobOrderFlowDialogOpen] = useState<boolean>(false); 
 
  const {
    userInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType
  } = userAuth()
  
  const [formData, setFormData] = useState<formData>({
    categories_id: userTicketInformation.device_type,
    product_id: userTicketInformation.issue_type,
    issue_id: userTicketInformation.issue_id,
    serial_number: userTicketInformation.serial_number,
    item_name: userTicketInformation.item_name,
    location: userTicketInformation.location,
    remarks: userTicketInformation.remarks || ""
  })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
 
  const {
    mutateAsync: insertJobOrder, 
    isPending
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => sentJobOder(id, data)
  });

  const {
    mutateAsync: deleteBeforeAfterAttachments,
    isPending: isDeletingBeforeAfterImage
  } = useMutation({
    mutationFn:  deleteBeforeAfterAttachment
  })

  const {
    mutateAsync: insertBeforeAfterImage,
    isPending: isUploadingBeforeAfterImage
  } = useMutation({
    mutationFn: beforeAfterInsert
  })

  const {
    mutateAsync: saveRemarksMutate,
    isPending: isSavingRemarks,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      saveRemarks(id, data),
  });

  const {
    mutateAsync: updateSerial,
    isPending: isUpdatingSerialNumber
  } = useMutation({
    mutationFn: ({id, data}: {id: string; data: FormData}) => updateSerialNumber(id, data)
  })

  const { data: categories } = useQuery({
    queryKey: [
      "categories"
    ],
    queryFn: fetchCategoriesSortedByName,
    select: (res) =>
      res.data.map((item: any) => ({
        value: item.id,
        label: item.name,
        is_active: item.is_active,
      })),
  });

  const { data: modelType } = useQuery({
    queryKey:["products", formData?.categories_id],
    queryFn: () => fetchProducts(Number(formData.categories_id)),
    enabled: !!formData?.categories_id,
    select: (res) => 
      res.data.map((item: any) => ({
        value: item.id,
        label: item.product_name
      }))
  })

  // matching to display a name instead of id,
  const displayDeviceType =
    (categories || []).find(
      (item: any) => String(item.value) === String(userTicketInformation.device_type)
    )?.label ||
    userTicketInformation.device_type ||
    'N/A';

  // matching to display a name instead of id,
  const displayModelType =
    (modelType || []).find(
      (item: any) => String(item.value) === String(userTicketInformation.issue_type)
    )?.label ||
    userTicketInformation.issue_type ||
    'N/A';

  const { data: issueType } = useQuery({
    queryKey:["issue", formData?.product_id],
    queryFn: () => fetchIssueById(Number(formData.product_id)),
    enabled: !!formData?.product_id,
    select: (res) => 
      res.data.map((item: any) => ({
        value: item.id,
        label: item.name
      }))
  })

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'categories_id') {
      const selectedCategory = (categories || []).find(
        (item: any) => String(item.value) === String(value)
      );
      const isActiveCategory = String(selectedCategory?.is_active) === 'true';

      setFormData((prev) => ({
        ...prev!,
        categories_id: value,
        product_id: isActiveCategory ? null : '',
        issue_id: isActiveCategory ? null : '',
        item_name: ''
      }));
      return;
    }

    if (name === 'product_id' || name === 'products_id') {
      setFormData((prev) => ({
        ...prev!,
        product_id: isCategoryActive ? null : value,
        issue_id: null,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev!, [name]: value }));
  }

  const selectedCategory = (categories || []).find(
    (item: any) => String(item.value) === String(formData.categories_id)
  );
  const isCategoryActive = String(selectedCategory?.is_active) === 'true';

  const generateAndDownloadPDF = async () => {
    if (isGeneratingPDF || isPending) return;

    if (!isCategoryActive && (!formData.product_id || !formData.issue_id)) {
      setSnackBarMessage("Model Type and Issue Type are required.");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const selectedDeviceType = (categories || []).find(
        (item: any) => String(item.value) === String(formData.categories_id)
      )?.label || userTicketInformation.device_type || 'N/A';

      const selectedModelType = (modelType || []).find(
        (item: any) => String(item.value) === String(formData.product_id)
      )?.label || userTicketInformation.issue_type || 'N/A';

      const PDFContent = {
        ticket_id: userTicketInformation.ticket_id,
        company: userTicketInformation.company,
        full_name: userTicketInformation.full_name,
        city: userTicketInformation.city,
        phone: userTicketInformation.phone,
        email: userTicketInformation.email,
        location: formData.location || null,
        device_type: selectedDeviceType,
        issue_type: formData.item_name || selectedModelType,
        serial_number: formData.serial_number,
        questions: userTicketInformation.questions,
        technician_name: String(userInfo?.full_name),
      };

      const doc = pdf(<JobOrderPDF data={PDFContent} />);
      const blob = await doc.toBlob();

      // Create file from blob
      const file = new File(
        [blob],
        `JobOrder-${userTicketInformation?.ticket_id ?? Date.now()}.pdf`,
        { type: "application/pdf" }
      );

      // Append everything to FormData
      const JobOrder = new FormData();
      JobOrder.append("products_id", String(formData.product_id ?? ''));
      JobOrder.append("categories_id", String(formData.categories_id ?? ''));
      JobOrder.append("item_name", String(formData.item_name ?? ''));
      JobOrder.append("issues_id", String(formData.issue_id ?? ''));
      JobOrder.append("serial_number", String(formData.serial_number ?? ''));
      JobOrder.append("location", String(formData.location ?? ''));
      JobOrder.append("sender_name", String(userInfo?.full_name || 'Support Team'))
      JobOrder.append("sender_email", String(userTicketInformation.email || 'admin@beesee.com'))
      JobOrder.append("user_role", String(userInfo?.role || ''));
      JobOrder.append("user_id", String(userInfo?.id ?? ''));

      // Append PDF file
      JobOrder.append("job_order_pdf", file);

      // Send to API
      const response = await insertJobOrder({ id: String(userTicketInformation.ticket_id), data: JobOrder })

      if (response?.success) {
        await queryClient.invalidateQueries({ queryKey: ['ticketInformation'] });
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
        setSnackBarMessage("Your Job Order has been successfully sent.");
        setSnackBarOpen(true)
        setSnackBarType("success") 

        // Download locally (optional)
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

    } catch (error: any) { 
      const rawMessage = error?.response?.data?.message || "Something went wrong while sending Job Order.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");

      setSnackBarMessage(cleanMessage)
      setSnackBarType("error")
      setSnackBarOpen(true)
      console.error("Failed to generate/download PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleUpdateSerialNumber = async () => {
    try {

      const selectedDeviceType = (categories || []).find(
        (item: any) => String(item.value) === String(formData.categories_id)
      )?.label || userTicketInformation.device_type || 'N/A';

      const selectedModelType = (modelType || []).find(
        (item: any) => String(item.value) === String(formData.product_id)
      )?.label || userTicketInformation.issue_type || 'N/A';

      const PDFContent = {
        ticket_id: userTicketInformation.ticket_id,
        company: userTicketInformation.company,
        full_name: userTicketInformation.full_name,
        city: userTicketInformation.city,
        phone: userTicketInformation.phone,
        email: userTicketInformation.email,
        location: formData.location || null,
        device_type: selectedDeviceType,
        issue_type: formData.item_name || selectedModelType,
        serial_number: formData.serial_number,
        questions: userTicketInformation.questions,
        technician_name: null,
      };

      const doc = pdf(<JobOrderPDF data={PDFContent} />);
      const blob = await doc.toBlob();

      // Create file from blob
      const file = new File(
        [blob],
        `JobOrder-${userTicketInformation?.ticket_id ?? Date.now()}.pdf`,
        { type: "application/pdf" }
      );

      const form = new FormData()
      form.append("serial_number", formData.serial_number);
      form.append("location", String(formData.location ?? ''));
      form.append("user_id", String(userInfo?.id ?? ''));
      // Append PDF file
      form.append("job_order_pdf", file);

      const response = await updateSerial({id: String(userTicketInformation.ticket_id), data: form})

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['ticketInformation'] });
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
        setSnackBarMessage("Your serial number has been successfully updated.");
        setSnackBarOpen(true)
        setSnackBarType("success") 
      }
    } catch(error: any) {
      const rawMessage = error?.response?.data?.message || "Something went wrong while updating serial number.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");
      
      setSnackBarMessage(cleanMessage)
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  const handleDeleteConfirmReportImage = async () => {
    try {
      handleClose()
      const formData  = new FormData();

      formData.append("ticket_id", ticket_id);
      formData.append("status", status)
      formData.append("user_id", String(userInfo?.id ?? ''));

      const response = await deleteBeforeAfterAttachments(formData) 

      if (response.success) {
        setSnackBarMessage("Successfully delete")
        setSnackBarOpen(true)
        setSnackBarType('success')
        await queryClient.invalidateQueries({ queryKey: ['ticketInformation'] });
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");
      
      setSnackBarMessage(cleanMessage)
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  const handleDeleteReportImage = async (images: any[]) => {
    if (!Array.isArray(images) || images.length === 0) {
      setSnackBarMessage("No images found.")
      setSnackBarOpen(true)
      setSnackBarType('error')
      return
    }

    const firstImage = images[0];
    const status = firstImage?.status;
    const ticketId = firstImage?.ticket_id;

    if (status === 'before') {
      setDialogMessage('Are you sure you want to delete all before-service report images?')
      setDialogTitle("Delete Before-Service Report Images")
    } else {
      setDialogMessage('Are you sure you want to delete all after-service report images?')
      setDialogTitle("Delete After-Service Report Images")
    }

    setDialogAction("delete")
    setDialogOpen(true)
    setStatus(status)
    setTicket_id(ticketId)
  }

  const handleOpenUploadImage = (reportStatus: "before" | "after") => {
    setUploadStatus(reportStatus)
    beforeAfterFileInputRef.current?.click()
  }

  const handleSelectReportImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const acceptedTypes = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
    ])

    const hasInvalidFile = files.some((file) => {
      if (acceptedTypes.has(file.type)) return false
      return !/\.(jpg|jpeg|png|gif|webp|heic)$/i.test(file.name)
    })

    if (hasInvalidFile) {
      setSnackBarMessage("Only jpeg, jpg, png, gif, webp, and heic image files are allowed.")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      e.target.value = ""
      return
    }

    if (!uploadStatus) {
      setSnackBarMessage("Please select report timing (before service / after service) first.")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      e.target.value = ""
      return
    }

    setSelectedUploadFiles(files)
    setDialogAction("upload")
    setDialogTitle(uploadStatus === "before" ? "Upload Before-Service Report Images" : "Upload After-Service Report Images")
    setDialogMessage(`Upload ${files.length} image(s) to the ${uploadStatus === "before" ? "before-service" : "after-service"} report?`)
    setDialogOpen(true)
  }

  const handleUploadConfirmReportImage = async () => {
    try {
      if (!uploadStatus || selectedUploadFiles.length === 0) {
        handleClose()
        return
      }

      const formData = new FormData()
      formData.append("ticket_id", String(userTicketInformation.ticket_id))
      formData.append("status", uploadStatus);
      formData.append("user_id", String(userInfo?.id ?? ''))
      selectedUploadFiles.forEach((file) => {
        formData.append("images[]", file)
      })

      const response = await insertBeforeAfterImage(formData)
      if (response?.success) {
        setSnackBarMessage(`Successfully uploaded ${selectedUploadFiles.length} image(s).`)
        setSnackBarOpen(true)
        setSnackBarType("success")
        await queryClient.invalidateQueries({ queryKey: ['ticketInformation'] });
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || "Something went wrong while uploading images."
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");

      setSnackBarMessage(cleanMessage)
      setSnackBarType("error")
      setSnackBarOpen(true)
    } finally {
      handleClose()
    }
  }

  const handleOpenSendJobOrderDialog = () => {
    setDialogTitle("Send Job Order")
    setDialogMessage("Are you sure you want to send this job order?")
    setDialogAction("sendJobOrder")
    setDialogOpen(true)
  }

  const handleOpenUpdateSerialNumberDialog = () => {
    setDialogTitle("Update Serial Number")
    setDialogMessage("Are you sure you want to update this serial number?")
    setDialogAction("updateSerialNumber")
    setDialogOpen(true)
  }

  const handleOpenRemarksDialog = () => {
    setDialogTitle("Save Remarks")
    setDialogMessage("Are you sure you want to save these remarks?")
    setDialogAction("remarks")
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    if (dialogAction === "upload") {
      await handleUploadConfirmReportImage()
      return
    }

    if (dialogAction === "delete") {
      await handleDeleteConfirmReportImage()
      return
    }

    if (dialogAction === "sendJobOrder") {
      handleClose()
      await generateAndDownloadPDF()
      return
    }

    if (dialogAction === "updateSerialNumber") {
      handleClose()
      await handleUpdateSerialNumber()
    }

    if (dialogAction === "remarks") {
      handleClose()
      await handleSaveRemarks() 
    }
  }

  const handleClose = async () => {
    setDialogOpen(false)
    setDialogMessage("")
    setDialogTitle("")
    setDialogAction(null)
    setStatus("")
    setTicket_id("")
    setUploadStatus("")
    setSelectedUploadFiles([])
    if (beforeAfterFileInputRef.current) {
      beforeAfterFileInputRef.current.value = ""
    }
  }

  const handleSaveRemarks = async () => {
    try {
      const formDataSubmit = new FormData();
      formDataSubmit.append("remarks", formData.remarks || "");
      formDataSubmit.append("user_id", String(userInfo?.id ?? ''));

      const response = await saveRemarksMutate({ id: String(userTicketInformation.ticket_id), data: formDataSubmit })
      if (response?.success) {
        setSnackBarMessage("Remarks saved successfully.")
        setSnackBarOpen(true)
        setSnackBarType("success")
        await queryClient.invalidateQueries({ queryKey: ['ticketInformation'] });
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
 
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || "Something went wrong while saving remarks."
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");
      setSnackBarMessage(cleanMessage)
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }
  
  return (
    <div>  
      <div className="p-4 space-y-4">
        <JobOrderFlowDialog
          open={jobOrderFlowDialogOpen}
          onClose={() => setJobOrderFlowDialogOpen(false)}
        />

        <AlertDialog
          open={dialogOpen}
          title={dialogTitle}
          message={dialogMessage}
          onClose={handleClose}
          onSubmit={handleDialogSubmit}
          isLoading={
            dialogAction === "upload"
              ? isUploadingBeforeAfterImage
              : dialogAction === "delete"
              ? isDeletingBeforeAfterImage
              : dialogAction === "sendJobOrder"
              ? isGeneratingPDF || isPending
              : dialogAction === "updateSerialNumber"
              ? isUpdatingSerialNumber
              : dialogAction === "remarks"
              ? isSavingRemarks
              : false
          }
        />

        <input
          ref={beforeAfterFileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic"
          className="hidden"
          onChange={handleSelectReportImages}
        />

        {/* Status Badge */}
        <div className="md:flex items-center  justify-between gap-4">  
          <div className='space-y-2'>
            <div>
            <span className='text-md text-gray-600 font-semibold'>Date Created</span>
            <span className="text-md text-gray-500 flex items-center gap-1">
              <Calendar size={14} />
              {userTicketInformation.created_at ? formatDate(userTicketInformation.created_at) : 'N/A'}
            </span>
          </div>
          {userTicketInformation.status === "resolved" && (
            <div>
              <span className='text-md text-gray-600 font-semibold'>Date Completed</span>
              <span className="text-md text-gray-500 flex items-center gap-1">
                <Calendar size={14} /> 
                {userTicketInformation.updated_at ? formatDate(userTicketInformation.updated_at) : 'N/A'}
              </span>
            </div>
          )}
          </div>
          <div className='flex gap-2'>
            {!publicConversation && (
            <div className='flex gap-2 mt-3 md:mt-0'> 
              {userTicketInformation.job_order_url !== null ? (
                <>
                  {userTicketInformation?.job_order_url_finish && (
                    <button
                      title="View Finish Job Order"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default navigation 
                        downloadFile(userTicketInformation.job_order_url_finish, "view", "test")
                      }}
                      className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <FileCheck2 size={14} />
                    </button>
                  )}

                  {!userTicketInformation?.job_order_url_finish && (
                    <>
                      <button
                        title="View Job Order"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default navigation 
                          downloadFile(userTicketInformation.job_order_url, "view", "test")
                        }}
                        className="inline-flex justify-center items-center gap-2 px-3 py-1 rounded-md bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      >
                        <FileSearch size={14} />
                      </button>
                    </>
                  )}

                  {userTicketInformation.status != 'resolved' && userTicketInformation.is_closed !== 1 &&(
                    <> 
                      <button
                      title='Update Serial Number' 
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default navigation  
                        handleOpenUpdateSerialNumberDialog();
                      }}
                      disabled={isGeneratingPDF || isPending || isUpdatingSerialNumber}
                      className={`inline-flex justify-center items-center gap-2 px-3 py-3 rounded-md ${(isPending || isUpdatingSerialNumber) ? "bg-yellow-300" : "bg-yellow-600 hover:bg-yellow-700 "} text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300`}
                    >
                      <Barcode size={14} /> 
                    </button>

                    <button
                      title='Sent Job Order' 
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default navigation  
                        handleOpenSendJobOrderDialog();
                      }}
                      disabled={isGeneratingPDF || isPending || isUpdatingSerialNumber}
                      className={`inline-flex justify-center items-center gap-2 px-3 py-3 rounded-md ${isPending ? "bg-orange-300" : "bg-orange-600 hover:bg-orange-700 "} text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300`}
                    >
                      <Send size={14} /> 
                    </button>
                    </>
                  )} 
                  
                </>
              ) : (
                userTicketInformation.is_closed !== 1 && (
                  <>
                  <button
                    title='Update Serial Number' 
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default navigation  
                      handleOpenUpdateSerialNumberDialog();
                    }}
                    disabled={isGeneratingPDF || isPending || isUpdatingSerialNumber}
                    className={`inline-flex items-center gap-2 px-3 py-3 rounded-md ${(isPending || isUpdatingSerialNumber) ? "bg-yellow-300" : "bg-yellow-600 hover:bg-yellow-700 "} text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300`}
                  >
                    <Barcode size={14} /> 
                  </button>
                  
                  <button
                    title='Sent Job Order'
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default navigation  
                      handleOpenSendJobOrderDialog();
                    }}
                    disabled={isGeneratingPDF || isPending || isUpdatingSerialNumber}
                    className={`inline-flex items-center gap-2 px-3 py-3 rounded-md ${isPending ? "bg-orange-300" : "bg-orange-600 hover:bg-orange-700 "} text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300`}
                  >
                    <Send size={14} /> 
                  </button>                 
                  </>
                )
              )} 
            </div>
          )} 

          {!publicConversation && (
            <div className='mt-3 md:mt-0'>
              <button 
                className='bg-gray-200 justify-center text-gray-700 px-3 py-3 rounded-md flex items-center'
                title='Need help?'
                onClick={() => setJobOrderFlowDialogOpen(true)}
              >
                <BadgeQuestionMark size={15}/>
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Ticket ID */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-gray-600 text-md font-medium mb-1">
              <Ticket size={14} />
              Ticket ID
            </div>
            <div className="text-md font-mono text-gray-900">
              #{userTicketInformation.ticket_id || 'N/A'}
            </div>
          </div>

          
          {!publicConversation ? (
            <div className='flex gap-2'>
              {userTicketInformation.is_closed !== 1 && (
                <span className={`px-3 py-1 rounded-full text-md font-semibold border ${getStatusColor(userTicketInformation.status)}`}
                >
                  {userTicketInformation.status === "open" ? "Pending" :  userTicketInformation.status === "resolved" ? "Completed" : "Ongoing"}
                </span> 
              )}
              
              {userTicketInformation?.is_closed === 1 && (
                <span className={`px-3 py-1 rounded-full text-md font-semibold border bg-gray-200 text-gray-700`}
                >
                  Closed
              </span>
              )} 

            </div>
          ) : ( 
            <> 
              {userTicketInformation.is_closed === 1 && (
                <span className={`px-3 py-1 rounded-full text-md font-semibold border ${getStatusColor(userTicketInformation.status)}`}
                >
                  Closed
                </span>
              )}
            </>
          )} 

        </div>

        {/* Issue Details */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-2 text-orange-900 font-semibold mb-3">
            <AlertCircle size={16} />
            Issue Details
          </div>
          
          {!publicConversation ? (
            <div className="space-y-2">
            {userTicketInformation?.is_closed !== 1 ? (
              <>
                <div>
                  <div className="text-md text-orange-600 font-medium mb-1">Device Type</div>
                  <div className="text-md text-gray-900 font-medium">
                    <CustomSelectField 
                      options={categories || []}
                      name='categories_id'
                      onChange={handleChangeInput}
                      value={formData.categories_id}
                      placeholder='Select Device Type'
                    />
                  </div>
                </div>
                
                <div>
                  {isCategoryActive ? (
                    <>
                      <div className="text-md text-orange-600 font-medium mb-1">Item Name</div>
                        <div className="text-md text-gray-900 flex items-center gap-2"> 
                          <CustomTextField 
                            onChange={handleChangeInput}
                            name='item_name'
                            rows={1}
                            multiline={false}
                            value={formData?.item_name} 
                          />
                        </div>
                    </>
                  ) : (
                    <div className='space-y-2'>
                      <div>
                        <div className="text-md text-orange-600 font-medium mb-1">Model Type</div>
                        <div className="text-md text-gray-900 flex items-center gap-2"> 
                          <CustomSelectField 
                            options={modelType || []}
                            name='product_id'
                            onChange={handleChangeInput}
                            value={formData.product_id ?? ''}
                            placeholder='Select Model Type'
                          />
                        </div> 
                      </div>

                      <div>
                        <div className="text-md text-orange-600 font-medium mb-1">Issue Type</div>
                        <div className="text-md text-gray-900 flex items-center gap-2"> 
                          <CustomSelectField 
                            options={issueType || []}
                            name='issue_id'
                            onChange={handleChangeInput}
                            value={formData.issue_id ?? ''}
                            placeholder='Select Issue Type'
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                </div>

                <div>
                  <div className="text-md text-orange-600 font-medium mb-1">Serial number</div>
                  <div className="text-md text-gray-900 flex items-center gap-2"> 
                    <CustomTextField 
                      onChange={handleChangeInput}
                      name='serial_number'
                      rows={1}
                      multiline={false}
                      value={formData.serial_number}
                    />
                  </div>
                </div> 

                <div>
                  <div className="text-md text-orange-600 font-medium mb-1">Location</div>
                  <div className="text-md text-gray-900 flex items-center gap-2"> 
                    <CustomTextField 
                      onChange={handleChangeInput}
                      name='location'
                      rows={1}
                      multiline={false}
                      value={formData.location}
                    />
                  </div>
                </div> 
              </>
            ) : (
              <>
                <div>
                  <div className="text-md text-orange-600 font-medium mb-1">Device Type</div>
                  <div className="text-md text-gray-900 font-medium">
                    {displayDeviceType}
                  </div>
                </div>
                
                <div>
                  <div className="text-md text-orange-600 font-medium mb-1">Model Type</div>
                  <div className="text-md text-gray-900 flex items-center gap-2 font-medium"> 
                    {displayModelType}
                  </div>
                </div>

                {userTicketInformation.issue_name && (
                  <div>
                    <div className="text-md text-orange-600 font-medium mb-1">Issue Type</div>
                    <div className="text-md text-gray-900 font-medium flex items-center gap-2"> 
                      {userTicketInformation.issue_name || 'N/A'}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-md text-orange-600 font-medium mb-1">Serial number</div>
                  <div className="text-md text-gray-900 flex items-center font-medium gap-2"> 
                    {userTicketInformation.serial_number || 'N/A'} 
                  </div>
                </div> 

                {userTicketInformation.location && (
                  <div>
                    <div className="text-md text-orange-600 font-medium mb-1">Location</div>
                    <div className="text-md text-gray-900 font-medium flex items-center gap-2"> 
                      {userTicketInformation.location || 'N/A'}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          ) : (
            <div className="space-y-2">
            <div>
              <div className="text-md text-orange-600 font-medium mb-1">Device Type</div>
              <div className="text-md text-gray-900 font-medium">
                {displayDeviceType}
              </div>
            </div>
            
            <div>
              <div className="text-md text-orange-600 font-medium mb-1">Model Type</div>
              <div className="text-md text-gray-900 flex items-center gap-2"> 
                {displayModelType}
              </div>
            </div>

            {userTicketInformation.issue_name && (
              <div>
                <div className="text-md text-orange-600 font-medium mb-1">Issue Type</div>
                <div className="text-md text-gray-900 flex items-center gap-2 font-medium"> 
                  {userTicketInformation.issue_name || 'N/A'}
                </div>
              </div>
            )} 

            {userTicketInformation.item_name && (
              <div>
                <div className="text-md text-orange-600 font-medium mb-1">Item Name</div>
                <div className="text-md text-gray-900 flex items-center gap-2 font-medium"> 
                  {userTicketInformation.item_name || 'N/A'}
                </div>
              </div>
            )} 

            <div>
              <div className="text-md text-orange-600 font-medium mb-1">Serial number</div>
              <div className="text-md text-gray-900 flex items-center gap-2 font-medium"> 
                {userTicketInformation.serial_number || 'N/A'}
              </div>
            </div> 

            {userTicketInformation.location && (
              <div>
                <div className="text-md text-orange-600 font-medium mb-1">Location</div>
                <div className="text-md text-gray-900 flex items-center gap-2 font-medium"> 
                  {userTicketInformation.location || 'N/A'}
                </div>
              </div>
            )}
          </div>
          )}  
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
            <MessageSquare size={16} />
            Concern
          </div>
          <div className="text-md text-gray-600 leading-relaxed">
            {userTicketInformation.questions || 'No question provided'}
          </div>
        </div>

        {!publicConversation && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-900 font-semibold mb-3">
            <User size={16} />
            Customer Details
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="text-md text-blue-600 font-medium mb-1">Full Name</div>
              <div className="text-md text-gray-900 font-medium">
                {userTicketInformation.full_name || 'N/A'}
              </div>
            </div>
            
            <div>
              <div className="text-md text-blue-600 font-medium mb-1">Email</div>
              <div className="text-md text-gray-900 flex items-center gap-2">
                <Mail size={14} className="text-blue-500" />
                {userTicketInformation.email || 'N/A'}
              </div>
            </div>
            
            <div>
              <div className="text-md text-blue-600 font-medium mb-1">Phone</div>
              <div className="text-md text-gray-900 flex items-center gap-2">
                <Phone size={14} className="text-blue-500" />
                {userTicketInformation.phone || 'N/A'}
              </div>
            </div>    
            <div>
              <div className="text-md text-blue-600 font-medium mb-1">Company Name</div>
              <div className="text-md text-gray-900 font-medium">
                {userTicketInformation.company || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-md text-blue-600 font-medium mb-1">City</div>
              <div className="text-md text-gray-900 font-medium">
                {userTicketInformation.city || 'N/A'}
              </div>
            </div>
          </div>
        </div>
        )} 

        {/* Other Remarks */}
        {userTicketInformation.other_remarks && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-semibold mb-2">
              <FileText size={16} />
              Other Remarks
            </div>
            <div className="text-md text-gray-700 leading-relaxed">
              {userTicketInformation.other_remarks}
            </div>
          </div>
        )}

        {!publicConversation && (
          <div className='bg-white rounded-lg p-4 border border-gray-200'>
          <div className='flex items-center justify-between text-gray-700 font-semibold mb-3'>
            <div className='flex items-center gap-2'>
              <FileText size={16} />
              Remarks
            </div>
            {userTicketInformation.is_closed !== 1 && (
              <div>
                <button 
                  onClick={handleOpenRemarksDialog}
                  title="Save Remarks"
                  className='bg-green-200 p-2 rounded-md text-green-700 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors flex items-center gap-1'>
                  <Save className='w-5 h-5'/>
                </button>
              </div>
            )}
          </div>
          <div>
            {userTicketInformation.is_closed ? (
              <div>
                <span>{formData.remarks || "None"}</span>
              </div>
            ) : (
              <div>
                <CustomTextField
                  name='remarks'
                  onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                  value={String(formData.remarks || '')}
                  placeholder='Add remarks here...'
                  rows={4}
                  multiline={true}
                  type="text"
                />
              </div>
            )}
          </div>
        </div>
        )}

        {/* Images */}
        {userTicketInformation.images && userTicketInformation.images.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <ImageIcon size={16} />
              Attached Images Report ({userTicketInformation.images.length})
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
              {userTicketInformation.images.map((img: any, index: number) => (
                <div 
                  key={img.id || index}
                  className="relative group cursor-pointer"
                    onClick={() => {
                    const imageList = userTicketInformation.images.map((item: any) => item.image);
                    setSelectedImage(img.image, imageList, index);
                    setShowSidebar(false)
                  }}
                >
                  <img 
                    src={img.image} 
                    alt={`Attachment ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                    <Download 
                      size={20} 
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {publicConversation && userTicketInformation?.before_image.length > 0 && (
          <>
            
         {/* Before image  */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between">
              <div className='flex items-center gap-2 text-gray-700 font-semibold mb-3'>
                <ImageIcon size={16} />
                Before-Service Report Images ({userTicketInformation?.before_image?.length || 0})
              </div>
              {!publicConversation && (
                <div className='flex items-center gap-2'>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                    title="Upload image"
                    onClick={() => handleOpenUploadImage("before")}
                  >
                    <Upload size={16} />
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                    title="Delete image"
                    onClick={() => handleDeleteReportImage(userTicketInformation.before_image)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
              {(userTicketInformation?.before_image?.length || 0) > 0 ? (
                userTicketInformation.before_image.map((img: any, index: number) => (
                  <div 
                    key={img.id || index}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      const imageList = userTicketInformation.before_image.map((item: any) => item.image_url);
                      setSelectedImage(img.image_url, imageList, index);
                      setShowSidebar(false)
                    }}
                  >
                    <img 
                      src={img.image_url} 
                      alt={`Attachment ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                      <Download 
                        size={20} 
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 px-4 text-center">
                  <p className="text-sm sm:text-base text-gray-500">No uploaded image</p>
                </div>
              )} 
            </div>
          </div>
          </>
        )}
  
        {publicConversation && userTicketInformation?.after_image.length > 0 && (
         <>
            {/* After image */}

           <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between">
              <div className='flex items-center gap-2 text-gray-700 font-semibold mb-3'>
                <ImageIcon size={16} />
                After-Service Report Images ({userTicketInformation?.after_image?.length || 0})
              </div>
              {!publicConversation && (
                <div className='flex items-center gap-2'>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                    title="Upload image"
                    onClick={() => handleOpenUploadImage("after")}
                  >
                    <Upload size={16} />
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                    title="Delete image"
                    onClick={() => handleDeleteReportImage(userTicketInformation.after_image)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
              {(userTicketInformation?.after_image?.length || 0) > 0 ? (
                userTicketInformation.after_image.map((img: any, index: number) => (
                  <div 
                    key={img.id || index}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      const imageList = userTicketInformation.after_image.map((item: any) => item.image_url);
                      setSelectedImage(img.image_url, imageList, index);
                      setShowSidebar(false)
                    }}
                  >
                    <img 
                      src={img.image_url} 
                      alt={`Attachment ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                      <Download 
                        size={20} 
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 px-4 text-center">
                  <p className="text-sm sm:text-base text-gray-500">No uploaded image</p>
                </div>
              )} 
            </div>
          </div>
         </>
        )}

        {!publicConversation && (
          <>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between">
                <div className='flex items-center gap-2 text-gray-700 font-semibold mb-3'>
                  <ImageIcon size={16} />
                  Before-Service Report Images ({userTicketInformation?.before_image?.length || 0})
                </div>
                {!publicConversation && (
                  <div className='flex items-center gap-2'>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                      title="Upload image"
                      onClick={() => handleOpenUploadImage("before")}
                    >
                      <Upload size={16} />
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                      title="Delete image"
                      onClick={() => handleDeleteReportImage(userTicketInformation.before_image)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
                {(userTicketInformation?.before_image?.length || 0) > 0 ? (
                  userTicketInformation.before_image.map((img: any, index: number) => (
                    <div 
                      key={img.id || index}
                      className="relative group cursor-pointer"
                      onClick={() => {
                        const imageList = userTicketInformation.before_image.map((item: any) => item.image_url);
                        setSelectedImage(img.image_url, imageList, index);
                        setShowSidebar(false)
                      }}
                    >
                      <img 
                        src={img.image_url} 
                        alt={`Attachment ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                        <Download 
                          size={20} 
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 px-4 text-center">
                    <p className="text-sm sm:text-base text-gray-500">No uploaded image</p>
                  </div>
                )} 
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between">
                <div className='flex items-center gap-2 text-gray-700 font-semibold mb-3'>
                  <ImageIcon size={16} />
                  After-Service Report Images ({userTicketInformation?.after_image?.length || 0})
                </div>
                {!publicConversation && (
                  <div className='flex items-center gap-2'>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                      title="Upload image"
                      onClick={() => handleOpenUploadImage("after")}
                    >
                      <Upload size={16} />
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                      title="Delete image"
                      onClick={() => handleDeleteReportImage(userTicketInformation.after_image)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
                {(userTicketInformation?.after_image?.length || 0) > 0 ? (
                  userTicketInformation.after_image.map((img: any, index: number) => (
                    <div 
                      key={img.id || index}
                      className="relative group cursor-pointer"
                      onClick={() => {
                        const imageList = userTicketInformation.after_image.map((item: any) => item.image_url);
                        setSelectedImage(img.image_url, imageList, index);
                        setShowSidebar(false)
                      }}
                    >
                      <img 
                        src={img.image_url} 
                        alt={`Attachment ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                        <Download 
                          size={20} 
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 px-4 text-center">
                    <p className="text-sm sm:text-base text-gray-500">No uploaded image</p>
                  </div>
                )} 
              </div>
            </div> 
          </>
        )}

        
      </div> 
    </div>
  )
}

export default ConversationsDetails

