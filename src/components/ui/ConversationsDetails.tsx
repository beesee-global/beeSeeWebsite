import React, { useState } from 'react'
import { pdf } from "@react-pdf/renderer";
import JobOrderPDF from "../../utils/JobOrderPDF"; 
import { downloadFile } from '../../utils/downloadFile'
import { fetchCategories } from '../../services/Technician/categoryServices'
import { fetchProducts, fetchIssueById } from '../../services/Technician/issuesServices'
import CustomTextField from '../Fields/CustomTextField';
import CustomSelectField from '../Fields/CustomSelectField';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import { sentJobOder, updateSerialNumber } from '../../services/Technician/ticketsServices'
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
  Barcode
} from "lucide-react" 
import { userAuth } from '../../hooks/userAuth';

interface formData {
  categories_id: number | string;
  product_id: number | string | null;
  issue_id: string | number | null;
  serial_number: string
  item_name?: string
}

interface ConversationsDetailsProps {
  userTicketInformation: any;
  setSelectedImage: (image: string) => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>; 
  publicConversation: boolean; 
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
    item_name: userTicketInformation.item_name
  })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
 
  const {
    mutateAsync: insertJobOrder, 
    isPending
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => sentJobOder(id, data)
  });

  const {
    mutateAsync: updateSerial,
    isPending: isCreating
  } = useMutation({
    mutationFn: ({id, data}: {id: string; data: FormData}) => updateSerialNumber(id, data)
  })

  const { data: categories } = useQuery({
    queryKey: [
      "categories"
    ],
    queryFn: fetchCategories,
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
      JobOrder.append("sender_name", String(userInfo?.full_name || 'Support Team'))
      JobOrder.append("sender_email", String(userTicketInformation.email || 'admin@beesee.com'))
      JobOrder.append("user_role", String(userInfo?.role || ''))

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

    } catch (err) {
      setSnackBarMessage("Something went wrong while sending Job Order.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      console.error("Failed to generate/download PDF:", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleUpdateSerialNumber = async () => {
    try {
      const form = new FormData()
      form.append("serial_number", formData.serial_number);

      const response = await updateSerial({id: String(userTicketInformation.ticket_id), data: form})

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['ticketInformation'] });
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
        setSnackBarMessage("Your serial number has been successfully updated.");
        setSnackBarOpen(true)
        setSnackBarType("success") 
      }
    } catch(err) {
      setSnackBarMessage("Something went wrong while updating serial number")
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  return (
    <div>  
      <div className="p-4 space-y-4">
        {/* Status Badge */}
        <div className="md:flex items-center justify-between ">  
          <span className="text-md text-gray-500 flex items-center gap-1">
            <Calendar size={14} />
            {userTicketInformation.created_at ? formatDate(userTicketInformation.created_at) : 'N/A'}
          </span>
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
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <FileCheck2 size={14} />
                    </button>
                  )}

                  <button
                    title="View Job Order"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default navigation 
                      downloadFile(userTicketInformation.job_order_url, "view", "test")
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  >
                    <FileSearch size={14} />
                  </button>

                  <button
                    title='Update Serial Number' 
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default navigation  
                      handleUpdateSerialNumber();
                    }}
                    disabled={isGeneratingPDF || isPending}
                    className={`inline-flex items-center gap-2 px-3 py-3 rounded-md ${isPending ? "bg-yellow-300" : "bg-yellow-600 hover:bg-yellow-700 "} text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300`}
                  >
                    <Barcode size={14} /> 
                  </button>

                  <button
                    title='Sent Job Order' 
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default navigation  
                      generateAndDownloadPDF();
                    }}
                    disabled={isGeneratingPDF || isPending}
                    className={`inline-flex items-center gap-2 px-3 py-3 rounded-md ${isPending ? "bg-orange-300" : "bg-orange-600 hover:bg-orange-700 "} text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300`}
                  >
                    <Send size={14} /> 
                  </button>
                </>
              ) : (
                 <>
                  <button
                    title='Update Serial Number' 
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default navigation  
                      handleUpdateSerialNumber();
                    }}
                    disabled={isGeneratingPDF || isPending}
                    className={`inline-flex items-center gap-2 px-3 py-3 rounded-md ${isPending ? "bg-yellow-300" : "bg-yellow-600 hover:bg-yellow-700 "} text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300`}
                  >
                    <Barcode size={14} /> 
                  </button>
                  
                  <button
                    title='Sent Job Order'
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default navigation  
                      generateAndDownloadPDF();
                    }}
                    disabled={isGeneratingPDF || isPending}
                    className={`inline-flex items-center gap-2 px-3 py-3 rounded-md ${isPending ? "bg-orange-300" : "bg-orange-600 hover:bg-orange-700 "} text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300`}
                  >
                    <Send size={14} /> 
                  </button>                 
                 </>
              )} 
            </div>
          )} 
        </div>

        {/* Ticket ID */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-md font-medium mb-1">
            <Ticket size={14} />
            Ticket ID
          </div>
          <div className="text-md font-mono text-gray-900">
            #{userTicketInformation.ticket_id || 'N/A'}
          </div>
        </div>

        {/* Issue Details */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-2 text-orange-900 font-semibold mb-3">
            <AlertCircle size={16} />
            Issue Details
          </div>
          
          {!publicConversation ? (
            <div className="space-y-2">
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
          </div>
          ) : (
            <div className="space-y-2">
            <div>
              <div className="text-md text-orange-600 font-medium mb-1">Device Type</div>
              <div className="text-md text-gray-900 font-medium">
                {userTicketInformation.device_type || 'N/A'}
              </div>
            </div>
            
            <div>
              <div className="text-md text-orange-600 font-medium mb-1">Model Type</div>
              <div className="text-md text-gray-900 flex items-center gap-2"> 
                {userTicketInformation.issue_type || 'N/A'}
              </div>
            </div>

            {userTicketInformation.issue_name && (
              <div>
                <div className="text-md text-orange-600 font-medium mb-1">Issue Type</div>
                <div className="text-md text-gray-900 flex items-center gap-2"> 
                  {userTicketInformation.issue_name || 'N/A'}
                </div>
              </div>
            )}
            

            <div>
              <div className="text-md text-orange-600 font-medium mb-1">Serial number</div>
              <div className="text-md text-gray-900 flex items-center gap-2"> 
                {userTicketInformation.serial_number || 'N/A'}
              </div>
            </div> 
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

        {/* Images */}
        {userTicketInformation.images && userTicketInformation.images.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <ImageIcon size={16} />
              Attached Images ({userTicketInformation.images.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {userTicketInformation.images.map((img: any, index: number) => (
                <div 
                  key={img.id || index}
                  className="relative group cursor-pointer"
                    onClick={() => {
                    setSelectedImage(img.image);
                    setShowSidebar(false)
                  }}
                >
                  <img 
                    src={img.image} 
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
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
      </div> 
    </div>
  )
}

export default ConversationsDetails
