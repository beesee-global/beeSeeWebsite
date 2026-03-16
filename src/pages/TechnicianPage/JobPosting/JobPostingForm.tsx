import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"  
import { useParams } from "react-router-dom"; 
import {  
  Plus,
  Pencil,  
  Briefcase,
  MapPin, 
  FileText, 
} from "lucide-react";
import {  
  User2,  
  FilePenLine, 
} from "lucide-react"
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../components/Fields/CustomSelectField"; 
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  createJob,  
  getSpecificJob, 
  updateJob 
} from '../../../services/Technician/careersServices' 
import { userAuth } from "../../../hooks/userAuth"
import RichTextEditor from "../../../components/Fields/RichTextEditor";

interface FormJobData {
  title: string;
  description: string;
  location: string;
  work_location: string;
  job_type: string;
  status?: string;
  careers_job_details: string;
}

interface FormError {
  title?: string;
  description?: string;
  location?: string;
  work_location?: string;
  job_type?: string;
  careers_job_details?: string; 
}

const JobPostingForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Use userAuth hook for snackbar
  const {   
    userInfo,
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
  } = userAuth()

  // --- Basic Info ---
  const [formJobData, setJobData] = useState<FormJobData>({
    title: "",
    description: "",
    location: "",
    work_location: "",
    job_type: "",
    status: "",
    careers_job_details: ""
  });

  // --- Form Error ---
  const [formError, setFormError] = useState<FormError>({})
 
  // --- Responsibilities & Qualifications ---
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [qualifications, setQualifications] = useState<string[]>([""]);

  // --- Responsibilities handlers ---
  const handleAddResponsibility = () => {
    setResponsibilities([...responsibilities, ""]);
  };

  const handleRemoveResponsibility = (index: number) => {
    const updated = responsibilities.filter((_, i) => i !== index);
    setResponsibilities(updated);
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    const updated = [...responsibilities];
    updated[index] = value;
    setResponsibilities(updated);
    setFormError((prev) => ({ ...prev, responsibilities: undefined }));
  };

  // --- Qualifications handlers ---
  const handleAddQualification = () => {
    setQualifications([...qualifications, ""]);
  };

  const handleRemoveQualification = (index: number) => {
    const updated = qualifications.filter((_, i) => i !== index);
    setQualifications(updated);
  };

  const handleQualificationChange = (index: number, value: string) => {
    const updated = [...qualifications];
    updated[index] = value;
    setQualifications(updated);
    setFormError((prev) => ({ ...prev, qualifications: undefined }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setJobData((prev: FormJobData) => ({
      ...prev,
      [name]: value
    }));

    // clear error when typing
    setFormError((prev) => ({
      ...prev,
      [name]: undefined
    }))
  }

  // --- Validation Function ---
  const validateForm = (): FormError => {
    const errors: FormError = {};

    const title = String(formJobData.title || '');
    const description = String(formJobData.description || '');
    const location = String(formJobData.location || '');
    const workLocation = String(formJobData.work_location || '');
    const jobType = String(formJobData.job_type || '');
    const careers_job_details = String(formJobData.careers_job_details || '');

    if (!title.trim()) errors.title = "Job title is required.";
    if (!description.trim()) errors.description = "Job description is required."; 
    if (!location.trim()) errors.location = "Location is required.";
    if (!workLocation.trim()) errors.work_location = "Work location is required.";
    if (!jobType.trim()) errors.job_type = "Job type is required.";
    if (!careers_job_details.trim()) errors.careers_job_details = "Job details is required";

    // Validate responsibilities
    // const validResponsibilities = responsibilities.filter(r => r.trim() !== "");
    // if (validResponsibilities.length === 0) {
    //   errors.responsibilities = "Please add at least one responsibility.";
    // }

    // Validate qualifications
    // const validQualifications = qualifications.filter(q => q.trim() !== "");
    // if (validQualifications.length === 0) {
    //   errors.qualifications = "Please add at least one qualification.";
    // }

    return errors;
  }

  // ✅ Mutation for creating job
  const {
    mutateAsync: createJobAsync,
    isPending: isCreating,
  } = useMutation({
    mutationFn: createJob
  })
  
  /* updating job */
  const {
    mutateAsync: updateJobAsync,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: updateJob,
  });
  
  // --- save function ---
  const handleSubmit = async () => {
    try {
      const errors = validateForm();
      setFormError(errors)
      if (Object.keys(errors).length > 0) {
        setSnackBarType("error")
        setSnackBarMessage("Please fill in all required fields.")
        setSnackBarOpen(true);
        return;
      }

      // Filter out empty strings
      const validResponsibilities = responsibilities.filter(r => r.trim() !== "");
      const validQualifications = qualifications.filter(q => q.trim() !== "");

      const jobData = {
        user_id: String(userInfo?.id),
        title: formJobData.title,
        description: formJobData.description,
        location: formJobData.location,
        work_location: formJobData.work_location,
        job_type: formJobData.job_type,
        status: formJobData.status,
        careers_job_details: formJobData.careers_job_details
        // responsibilities: validResponsibilities,
        // qualifications: validQualifications
      };

      if (id) {
        // Extract actual job data from nested response
        const currentJobInfo = jobResponse?.data?.data || jobResponse?.data || jobResponse;
        await updateJobAsync({ id: currentJobInfo.id, jobData });
        setSnackBarType('success');
        setSnackBarMessage('Job posting updated successfully!');
      } else {
        await createJobAsync(jobData);
        setSnackBarType('success');
        setSnackBarMessage('Job posting created successfully!');
      }
      
      setSnackBarOpen(true);
      navigate('/beesee/job-posting') 
    } catch (error: any) {
      console.log('Error', error)
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message;
        console.log(errorMessage)
        
        if (errorMessage?.includes("title") || errorMessage?.toLowerCase().includes("already exists")) {
          setFormError((prev) => ({
            ...prev,
            title: errorMessage
          }))
        }
      }
      
      console.error('❌ Error creating job:', error); 
      setSnackBarType("error");
      setSnackBarMessage("Failed to create job posting. Please try again.");
      setSnackBarOpen(true);
    }
  }
  
  // --- fetch specific job ---
  const { data: jobResponse } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getSpecificJob(String(id)),
    enabled: !!id,
  });

  // --- populate form when jobInfo is loaded --- 
  useEffect(() => {
    // Extract the actual job data from the nested response
    const jobInfo = jobResponse?.data?.data || jobResponse?.data || jobResponse;
    
    if (jobInfo && jobInfo.id) {
      setJobData({
        title: jobInfo.title || "",
        description: jobInfo.description || "",
        location: jobInfo.location || "",
        work_location: jobInfo.work_location || "",
        job_type: jobInfo.job_type || "",
        status: jobInfo.status || "",
        careers_job_details: jobInfo.careers_job_details || ""
      });

      // setResponsibilities(
      //   Array.isArray(jobInfo.responsibilities) && jobInfo.responsibilities.length > 0
      //     ? jobInfo.responsibilities
      //     : [""]
      // );

      // setQualifications(
      //   Array.isArray(jobInfo.qualifications) && jobInfo.qualifications.length > 0
      //     ? jobInfo.qualifications
      //     : [""]
      // );
    }
  }, [jobResponse]);

  return (
    <div className="min-h-screen bg-white-50 dark:bg-white py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8"> 

        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[ 
              { label: "Careers",  href: "/beesee/job-posting", icon: <User2 className="w-4 h-4"/> },
              { label: "Careers Form", isActive: true, icon: <FilePenLine className="w-4 h-4"/> }
            ]}
          />
        </div>

        {/* Header */}
        <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-black mb-2">
                {id ? "Update Job Posting" : "Create New Job Posting"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Post a new job opportunity with detailed requirements
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/beesee/job-posting')} 
                disabled={isCreating || isUpdating}
                className="px-6 py-3 border border-var(--bo-border-gold) dark:border-var(--bo-border-gold) text-gray-black dark:text-black rounded-lg hover:bg-[#ff7676] dark:hover:bg-[#ff7676] transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              > 
                {isCreating || isUpdating ? (
                  <span>
                    {id ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <>
                    {id ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {id ? "Update Job" : "Create Job"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Basic Information */}
            <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-var(--bo-border-gold) dark:bg-blue-900/20 rounded-lg mr-4">
                  <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl text-black dark:text-black">Basic Information</h2>
                  <p className="text-gray-600 dark:text-gray-400">Essential job details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm  text-black mb-2">
                    Job Title *
                  </label>
                  <CustomTextField 
                    name="title"
                    placeholder="e.g., Sales and Marketing"
                    value={formJobData.title}
                    multiline={false}
                    rows={1}
                    type="text"
                    maxLength={100} 
                    onChange={handleInputChange}  
                    error={!!formError.title}
                    helperText={formError.title}
                    icon={<Briefcase className="w-4 h-4" />}
                  /> 
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm  text-black dark:text-black mb-2">
                    Job Description *
                  </label>
                   <RichTextEditor
                      value={formJobData.description || ''}
                      onChange={(value) =>
                        setJobData(prev => ({ ...prev, description: value }))
                      }
                    />
                    {formError.description && (
                      <p className="text-red-500 text-sm mt-1">{formError.description}</p>
                    )}  
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm  text-black dark:text-black mb-2">
                    Location *
                  </label>
                  <CustomTextField 
                    name="location"
                    placeholder="e.g., South Triangle, Quezon City"
                    value={formJobData.location}
                    multiline={false}
                    rows={1}
                    type="text"
                    maxLength={100} 
                    onChange={handleInputChange}  
                    error={!!formError.location}
                    helperText={formError.location}
                    icon={<MapPin className="w-4 h-4" />}
                  /> 
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-black dark:text-black mb-2">
                    Work Location *
                  </label>
                  <CustomSelectField
                    name="work_location"
                    placeholder="Select Work Location"
                    value={formJobData.work_location}
                    onChange={handleInputChange}
                    options={[
                      { value: "Onsite", label: "Onsite" },
                      { value: "Remote", label: "Remote" },
                      { value: "Hybrid", label: "Hybrid" },
                    ]}
                    error={!!formError.work_location}
                    helperText={formError.work_location}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm  text-black dark:text-black mb-2">
                    Job Type *
                  </label>
                  <CustomSelectField
                    name="job_type"
                    placeholder="Select Job Type"
                    value={formJobData.job_type}
                    onChange={handleInputChange}
                    options={[
                      { value: "Full-time", label: "Full-time" },
                      { value: "Part-time", label: "Part-time" },
                      { value: "Internship", label: "Internship" },
                      { value: "Contract", label: "Contract" },
                    ]}
                    error={!!formError.job_type}
                    helperText={formError.job_type}
                  />
                </div>

                {id && (
                  <div className="md:col-span-2">
                  <label className="block text-sm  text-black dark:text-black mb-2">
                    Status *
                  </label>
                  <CustomSelectField
                    name="status"
                    placeholder="Select status"
                    value={formJobData.status}
                    onChange={handleInputChange}
                    options={[
                      { value: "Accepting_Applications", label: "Accepting Applications" },
                      { value: "Closed", label: "Closed" }, 
                    ]}
                    error={!!formError.job_type}
                    helperText={formError.job_type}
                  />
                </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm  text-black dark:text-black mb-2">
                    Job details *
                  </label>
                  <RichTextEditor
                    value={formJobData.careers_job_details || ''}
                    onChange={(value) =>
                      setJobData(prev => ({ ...prev, careers_job_details: value }))
                    }
                  />
                  {formError.careers_job_details && (
                    <p className="text-red-500 text-sm mt-1">{formError.careers_job_details}</p>
                  )} 
                </div>
              </div>
            </div>

            {/* Responsibilities Section */}
            {/* <div className="bo-stat-card dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                    <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl text-black dark:text-black">Responsibilities</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Key duties and responsibilities</p>
                  </div>
                </div>
                <button
                  onClick={handleAddResponsibility}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>

              {formError.responsibilities && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError.responsibilities}</p>
                </div>
              )}

              <div className="space-y-3">
                {responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <textarea
                        placeholder="Enter responsibility..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white  text-black  focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors resize-none"
                        rows={2}
                        value={responsibility}
                        onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                      />
                    </div>
                    {responsibilities.length > 1 && (
                      <button
                        onClick={() => handleRemoveResponsibility(index)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors mt-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div> */}

            {/* Qualifications Section */}
            {/* <div className="bo-stat-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-4">
                    <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl text-black">Qualifications</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Required skills and qualifications</p>
                  </div>
                </div>
                <button
                  onClick={handleAddQualification}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>

              {formError.qualifications && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError.qualifications}</p>
                </div>
              )}

              <div className="space-y-3">
                {qualifications.map((qualification, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <textarea
                        placeholder="Enter qualification..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white  text-black  focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors resize-none"
                        rows={2}
                        value={qualification}
                        onChange={(e) => handleQualificationChange(index, e.target.value)}
                      />
                    </div>
                    {qualifications.length > 1 && (
                      <button
                        onClick={() => handleRemoveQualification(index)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors mt-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingForm;