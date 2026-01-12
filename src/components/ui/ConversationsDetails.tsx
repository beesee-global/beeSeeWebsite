import React from 'react'
import { pdf } from "@react-pdf/renderer";
import JobOrderPDF from "../../utils/JobOrderPDF";
import { Buffer } from "buffer";
 
 
import {
  Mail,
  Ticket,
  Building2,
  School,
  Phone,
  MessageSquare,
  AlertCircle,
  Laptop,
  User,
  Download,
  Image as ImageIcon,
  Calendar,
  FileText,
} from "lucide-react"

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

const generateAndDownloadPDF = async () => {
    try {
      const doc = pdf(<JobOrderPDF data={userTicketInformation} />);
      const blob = await doc.toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JobOrder-${userTicketInformation?.ticket_id ?? Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to generate/download PDF:", err);
    }
  };

  return (
    <div>  
      <div className="p-4 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between"> 
            {!publicConversation && (
              <div className='flex gap-2'>
                <span className={`px-3 py-1 rounded-full text-md font-semibold border ${getStatusColor(userTicketInformation.status)}`}
                >
                  {userTicketInformation.status === "open" ? "OPEN" :  userTicketInformation.status === "resolved" ? "COMPLETED" : "Expired"}
                </span>

                <button
  onClick={(e) => {
    e.preventDefault(); // Prevent default navigation
    generateAndDownloadPDF();
  }}
  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
>
  <Download size={14} />
  DOWNLOAD
</button>

              </div>
            )} 
          <span className="text-md text-gray-500 flex items-center gap-1">
            <Calendar size={14} />
            {userTicketInformation.created_at ? formatDate(userTicketInformation.created_at) : 'N/A'}
          </span>
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
                <Laptop size={14} className="text-orange-500" />
                {userTicketInformation.issue_type || 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-md text-orange-600 font-medium mb-1">Issue Type</div>
              <div className="text-md text-gray-900 flex items-center gap-2">
                <Laptop size={14} className="text-orange-500" />
                {userTicketInformation.issue_name || 'N/A'}
              </div>
            </div>
          </div>
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
