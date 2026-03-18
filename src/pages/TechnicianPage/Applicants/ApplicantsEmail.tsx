import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom" 
import CustomTextField from "../../../components/Fields/CustomTextField"
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"   
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query" 
import { 
  getInformationApplicant,
  shortList,
  rejectedApplicants,
  deleteApplicants, 
  closedApplicants,
  sendInterviewInvitation
} from '../../../services/Technician/applicantServices' 
import { downloadFileDesktop } from '../../../utils/downloadFile'
import {  
  User2,
  FilePenLine,
  Download,
  Plus,
  X,
  Trash2,
  Send,
  FileText,
  ZoomIn,
  ZoomOut,
  Ban 
} from "lucide-react"
import { Email, Phone } from "@mui/icons-material"
import { userAuth } from "../../../hooks/userAuth"
import AlertDialog from '../../../components/feedback/AlertDialog'
import ApplicantsDialog from "./components/ApplicantsDialog"

interface ApplicantFormProps {
  id: number;
  full_name: string;
  email: string;
  phone: string; 
  position: string; 
  job_number: string;
  status: string; 
  attachment_url: string;
}

const ApplicantsEmail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const {
    userInfo: authUserInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
  } = userAuth();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [actionType, setActionType] = useState<string>("");
  const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false);
  const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);

  const [formData, setFormData] = useState<ApplicantFormProps>({
    id: 0,
    full_name: "",
    email: "",
    phone: "", 
    position: "",
    job_number: "",
    status: "", 
    attachment_url: ""
  }); 

  // Fetch data only when id exists
  const { data: applicantInfoResponse, isLoading } = useQuery({
    queryKey: ["applicant-detail", id],
    queryFn: () => getInformationApplicant(String(id)),
    enabled: !!id,
  });

  const { mutateAsync: shortListed } = useMutation({
    mutationFn: shortList
  });

  const { mutateAsync: closedApplicant } = useMutation({
    mutationFn: closedApplicants
  });

  const { mutateAsync: rejectApplicant } = useMutation({
    mutationFn: rejectedApplicants
  });

  const { mutateAsync: deleteApplicant } = useMutation({
    mutationFn: deleteApplicants
  });

  const { mutateAsync: sendInterviewInvitations } = useMutation({
    mutationFn: sendInterviewInvitation
  })

  const applicantDetails = applicantInfoResponse?.data;
  
  // Load data when fetched
  useEffect(() => {
    if (applicantDetails) {
      console.log("Applicant", applicantDetails);
      setFormData({
        id: applicantDetails.id || 0,
        full_name: applicantDetails.full_name || "",
        email: applicantDetails.email || "",
        phone: applicantDetails.phone || "",
        position: applicantDetails.position || "",
        job_number: applicantDetails.job_number || "",
        status: applicantDetails.status || "",
        attachment_url: applicantDetails.attachment_url || ""
      });
    }
  }, [applicantDetails]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageZoomToggle = () => {
    setIsImageZoomed(!isImageZoomed);
  }

  const handleDownload = () => {
    if (!formData.attachment_url) {
      setSnackBarMessage("No file available to download");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    downloadFileDesktop(formData.attachment_url, {
      filename:
        formData.attachment_url.split("/").pop() ||
        `${formData.full_name}_resume.pdf`,
      onSuccess: () => { 
        // setSnackBarMessage("File downloaded successfully");
        // setSnackBarType("success");
        // setSnackBarOpen(true);
      },
      onError: () => {
        setSnackBarMessage("Failed to download file. Please try again.");
        setSnackBarType("error");
        setSnackBarOpen(true);
      }
    });
  };

  const handleOpenEmailDialog = () => {
    if (formData.status !== 'SHORTLISTED') {
      setSnackBarMessage("Please shortlist this applicant before sending an interview invitation");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }
    setEmailDialogOpen(true);
  }; 

  const handleEmailSubmit = async(emailData: {
    messages: string;
    location: string;
    time: string;
    date: string;
    schedule: string;
    duration: string;
    format: string;
  }) => {
    const payload = {
      id: formData.id,
      name: formData.full_name,
      position:formData.position,
      email: formData.email, 
      location: emailData.location,
      time: emailData.time,
      date: emailData.date,
      schedule_details: emailData.schedule,
      format: emailData.format,
      duration: emailData.duration,
      user_id: authUserInfo?.id
    };

    const response = await sendInterviewInvitations(payload)

    if (response?.success) {
      setSnackBarMessage("Interview invitation sent successfully!");
      setSnackBarType("success");
      setSnackBarOpen(true);
    }
    // TODO: Replace with actual API call
    // const response = await sendInterviewInvitation(payload);
    
    
  };

  const handleShortlist = () => {
    setActionType('shortlist');
    setDialogTitle("Confirm Shortlist");
    setDialogMessage("Are you sure you want to shortlist this applicant?");
    setDialogOpen(true);
  };

  const handleReject = () => {
    setActionType('reject');
    setDialogTitle("Confirm Reject");
    setDialogMessage("Are you sure you want to reject this applicant?");
    setDialogOpen(true);
  };

  const handleDelete = () => {
    setActionType('delete');
    setDialogTitle("Confirm Delete");
    setDialogMessage("Are you sure you want to delete this applicant? This action cannot be undone.");
    setDialogOpen(true);
  };

  const handleClose = () => {
    setActionType('close');
    setDialogTitle("Confirm Close");
    setDialogMessage("Are you sure you want to close this applicant? This action cannot be undone.");
    setDialogOpen(true);
  }

  const handleConfirmAction = async () => {
    try {
      let response;
      
      if (actionType === 'shortlist') {
        response = await shortListed({ id: String(formData.id), user_id: authUserInfo?.id });
      } else if (actionType === 'reject') {
        response = await rejectApplicant({ id: String(formData.id), user_id: authUserInfo?.id });
      } else if (actionType === 'delete') {
        response = await deleteApplicant({ ids: [formData.id], user_id: authUserInfo?.id });
      } else if (actionType === 'close') {
        response = await closedApplicant({ id: String(formData.id), user_id: authUserInfo?.id });
      }

      if (response?.success) {
        setDialogOpen(false);
        
        if (actionType === 'shortlist') {
          setSnackBarMessage("Applicant shortlisted successfully");
        } else if (actionType === 'reject') {
          setSnackBarMessage("Applicant rejected successfully");
        } else if (actionType === 'delete') {
          setSnackBarMessage("Applicant deleted successfully"); 
          navigate(-1); 
        } else if (actionType === 'close') {  
          setSnackBarMessage("Applicant closed successfully"); 
          navigate(-1); 
        }
        
        setSnackBarType("success");
        setSnackBarOpen(true);

        queryClient.invalidateQueries({ queryKey: ['applicant-detail'] });
      }
    } catch (error) {
      setSnackBarMessage("Action failed. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW_APPLICANT':
        return 'bg-gray-100 text-gray-800 border-gray-400';
      case 'SHORTLISTED':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW_APPLICANT':
        return 'New Applicant';
      case 'SHORTLISTED':
        return 'Shortlisted';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading applicant details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 

        {/* Alert Dialog */}
        <AlertDialog 
          open={dialogOpen}
          title={dialogTitle}
          message={dialogMessage}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleConfirmAction}
        />

        {/* Email Dialog */}
        <ApplicantsDialog
          open={emailDialogOpen}
          onClose={() => setEmailDialogOpen(false)}
          onSubmit={handleEmailSubmit}
          applicantName={formData.full_name}
          applicantEmail={formData.email}
        />

        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb 
            items={[ 
              { label: "Careers", href: "/beesee/job-posting", icon: <User2 className="w-4 h-4"/> },
              { label: "Applicant Details", isActive: true, icon: <FilePenLine className="w-4 h-4"/> }
            ]}
          />
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl font-bold text-gray-900">
                  {formData.full_name}
                </h1>
                <span className={`px-4 py-2 rounded-full border-2 font-bold text-sm ${getStatusColor(formData.status)}`}>
                  {getStatusText(formData.status)}
                </span>
              </div>
              <p className="text-lg text-gray-600 mb-2">
                <span className="font-semibold">Position:</span> {formData.position}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Job Reference:</span> {formData.job_number}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3"> 
              {/* Send Email Button */}
              {formData.status !== "CLOSED" && (
                <button
                  title="Send Email"
                  onClick={handleOpenEmailDialog}
                  disabled={formData.status !== 'SHORTLISTED'}
                  className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg ${
                    formData.status === 'SHORTLISTED'
                      ? 'bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 hover:shadow-xl hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-6 h-6" /> 
                </button>
              )}

              {/* Action Buttons based on status */}
              {formData.status === 'NEW_APPLICANT' && (
                <>
                  <button
                    title="Shortlist"
                    onClick={handleShortlist}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    title="Reject"
                    onClick={handleReject}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <X className="w-5 h-5" /> 
                  </button>
                </>
              )}

              {formData.status === 'SHORTLISTED' && (
                <button
                  title="Reject"
                  onClick={handleReject}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <X className="w-5 h-5" /> 
                </button>
              )}

              {formData.status === 'REJECTED' && (
                <>
                  <button
                    onClick={handleShortlist}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Shortlist</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete</span>
                  </button>
                </>
              )}

              {formData.status !== 'CLOSED' && (
                <button 
                  title="Close Applicant" 
                  onClick={ handleClose } 
                  aria-label="Close"
                  className="px-6 py-3 border-2 text-white rounded-xl transition-all duration-200 font-semibold bg-[#0f766e]"
                >
                  <Ban className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6"> 
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                <p className="text-gray-600">Personal details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <CustomTextField 
                  name="full_name"
                  placeholder="Full name"
                  value={formData.full_name}
                  onChange={handleChangeInput}
                  disabled={true}
                  rows={1}
                  multiline={false}
                  type="text"
                  icon={<User2 className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <CustomTextField 
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChangeInput}
                  disabled={true}
                  rows={1}
                  multiline={false}
                  type="email"
                  icon={<Email className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <CustomTextField 
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChangeInput}
                  disabled={true}
                  rows={1}
                  multiline={false}
                  type="text"
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Position Applied
                </label>
                <CustomTextField 
                  name="position"
                  placeholder="Position"
                  value={formData.position}
                  onChange={handleChangeInput}
                  disabled={true}
                  rows={1}
                  multiline={false}
                  type="text"
                  icon={<FileText className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Resume Card */}  
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center"> 
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resume/CV</h2>
                <p className="text-gray-600">Applicant's resume</p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          </div>
          
          {formData.attachment_url ? (
            <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-50">
              {/* Check if file is an image */}
              {applicantDetails?.file_type?.startsWith('image/') ? (
                <div 
                  className={`relative w-full ${isImageZoomed ? 'h-auto' : 'h-[600px]'} flex items-center justify-center p-4 bg-white transition-all duration-300 cursor-pointer group`}
                  onClick={handleImageZoomToggle}
                >
                  <img
                    src={formData.attachment_url}
                    alt="Resume"
                    className={`transition-all duration-300 ${
                      isImageZoomed 
                        ? 'max-w-none w-full cursor-zoom-out' 
                        : 'max-w-full max-h-full object-contain cursor-zoom-in'
                    }`}
                  />
                  
                  {/* Zoom Indicator Icon */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isImageZoomed ? (
                      <>
                        <ZoomOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Click to zoom out</span>
                      </>
                    ) : (
                      <>
                        <ZoomIn className="w-5 h-5" />
                        <span className="text-sm font-medium">Click to zoom in</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <iframe
                  src={formData.attachment_url}
                  className="w-full h-[600px]"
                  title="Resume Preview"
                />
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No resume uploaded</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantsEmail;


