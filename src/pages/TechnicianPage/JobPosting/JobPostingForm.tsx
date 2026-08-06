import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import { useParams } from "react-router-dom";
import { Plus, Pencil, Briefcase, MapPin, FileText } from "lucide-react";
import { User2, FilePenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../components/Fields/CustomSelectField";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createJob, getSpecificJob, updateJob, preScreenList } from '../../../services/Technician/careersServices';
import { userAuth } from "../../../hooks/userAuth";
import RichTextEditor from "../../../components/Fields/RichTextEditor";
import PreScreeningModal from "./components/PreScreeningModal";

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

interface SelectedPreScreening {
  id?: number;           // careers_pre_screening row id — present when editing existing
  instance_id: string;   // local unique key for React
  question_id: number;
  is_deal_breaker: 0 | 1;
  deal_breaker_expected_value?: string;
  blank_value?: string;
  answer?: string;
}

interface ApiPreScreening {
  id?: number;
  question_id: number | string;
  is_deal_breaker: number | string | boolean;
  deal_breaker_expected_value?: string | number | null;
  blank_value?: string | null;
  answer?: string | number | null;
  question?: string;
}

const BLANK_REGEX = /_{2,}/;

const isLocationQuestion = (question?: string) =>
  Boolean(question?.toLowerCase().includes('located in'));

const isTrailingBlank = (q: string) => {
  const t = q.trim().toLowerCase();
  return t.endsWith('to') || t.endsWith('valid') || t.endsWith('located in') || t.endsWith('in');
};

const buildDisplay = (question: string, blankVal?: string, liveLocation?: string) => {
  const resolved = isLocationQuestion(question)
    ? (liveLocation?.trim() || blankVal?.trim() || '')
    : (blankVal?.trim() || '');
  if (!resolved) return question.trim();
  if (BLANK_REGEX.test(question)) return question.trim().replace(BLANK_REGEX, resolved);
  if (isTrailingBlank(question)) return `${question.trim()} ${resolved}`;
  return question.trim();
};

const getChoiceLabel = (question: any, value?: string | number | null) => {
  if (!question?.choices || value === undefined || value === null) return String(value ?? '');
  const choice = question.choices.find((c: any) => String(c.value) === String(value));
  return choice?.choice_text ?? String(value);
};

const getJobInfo = (response: any) =>
  response?.data?.data || response?.data || response;

const getJobPreScreening = (jobInfo: any): ApiPreScreening[] => {
  const ps = jobInfo?.['pre-screening'] || jobInfo?.pre_screening || jobInfo?.preScreening || [];
  return Array.isArray(ps) ? ps : [];
};

const generateInstanceId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const normalizePreScreeningSelection = (
  item: ApiPreScreening,
  questions: any[] = []
): SelectedPreScreening => {
  const question = questions.find((q) => q.id === Number(item.question_id));
  let answer = String(item.answer ?? item.deal_breaker_expected_value ?? '');
  if (!answer) {
    if (question?.type === 'yes_no') answer = 'Yes';
    else if (question?.type === 'multiple_choice' && question.choices?.length) {
      answer = question.choices[0].value;
    }
  }
  return {
    id: item.id,                           // ← row id from DB
    instance_id: generateInstanceId(),
    question_id: Number(item.question_id),
    is_deal_breaker: Number(item.is_deal_breaker) === 1 || item.is_deal_breaker === true ? 1 : 0,
    deal_breaker_expected_value:
      item.deal_breaker_expected_value == null ? '' : String(item.deal_breaker_expected_value),
    blank_value: item.blank_value ?? '',
    answer,
  };
};

const JobPostingForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { userInfo, setSnackBarMessage, setSnackBarOpen, setSnackBarType } = userAuth();

  const [formJobData, setJobData] = useState<FormJobData>({
    title: "", description: "", location: "", work_location: "",
    job_type: "", status: "", careers_job_details: ""
  });
  const [formError, setFormError] = useState<FormError>({});
  const [removedPreScreeningIds, setRemovedPreScreeningIds] = useState<{ id: number; question_id: number }[]>([]);
  const [preScreeningOpen, setPreScreeningOpen] = useState(false);
  const [selectedPreScreening, setSelectedPreScreening] = useState<SelectedPreScreening[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nextValue = name === "title" ? value.replace(/\d/g, "") : value;
    setJobData((prev) => ({ ...prev, [name]: nextValue }));
    setFormError((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): FormError => {
    const errors: FormError = {};
    if (!formJobData.title.trim()) errors.title = "Job title is required.";
    else if (/\d/.test(formJobData.title)) errors.title = "Job title must not contain numbers.";
    if (!formJobData.description.trim()) errors.description = "Job description is required.";
    if (!formJobData.location.trim()) errors.location = "Location is required.";
    if (!formJobData.work_location.trim()) errors.work_location = "Work location is required.";
    if (!formJobData.job_type.trim()) errors.job_type = "Job type is required.";
    if (!formJobData.careers_job_details.trim()) errors.careers_job_details = "Job details is required";
    return errors;
  };

  const { mutateAsync: createJobAsync, isPending: isCreating } = useMutation({ mutationFn: createJob });
  const { mutateAsync: updateJobAsync, isPending: isUpdating } = useMutation({ mutationFn: updateJob });

  const { data: preScreeningData } = useQuery({
    queryKey: ['pre-screening-list'],
    queryFn: preScreenList,
  });
  // Keep the fallback reference stable. A new [] on every render changes the
  // initialization effect dependency and causes repeated form state updates.
  const preScreeningQuestions = useMemo(
    () => Array.isArray(preScreeningData?.data) ? preScreeningData.data : [],
    [preScreeningData]
  );

  // ── Pre-screening handlers ─────────────────────────────────────────────────

  const handlePreScreenAdd = (selection: SelectedPreScreening) => {
    setSelectedPreScreening((prev) => [...prev, selection]);
  };

  const handlePreScreenRemove = (instanceId: string) => {
    setSelectedPreScreening((prev) => {
      const removing = prev.find((q) => q.instance_id === instanceId);
      // If this row has a DB id, track it so we can send it in the payload as removed
      if (removing?.id !== undefined) {
        setRemovedPreScreeningIds((ids) => [...ids, { id: removing.id!, question_id: removing.question_id }]);
      }
      return prev.filter((q) => q.instance_id !== instanceId);
    });
  };

  const handlePreScreenUpdate = (selection: SelectedPreScreening) => {
    setSelectedPreScreening((prev) =>
      prev.map((q) => q.instance_id === selection.instance_id ? selection : q)
    );
  };


  const handleSubmit = async () => {
    try {
      const errors = validateForm();
      setFormError(errors);
      if (Object.keys(errors).length > 0) {
        setSnackBarType("error");
        setSnackBarMessage("Please fill in all required fields.");
        setSnackBarOpen(true);
        return;
      }

      const hasMissingAnswer = selectedPreScreening.some((s) => !s.answer?.trim());
      if (hasMissingAnswer) {
        setSnackBarType("error");
        setSnackBarMessage("Please provide an expected answer for every selected pre-screening question.");
        setSnackBarOpen(true);
        return;
      }

      const jobData: any = {
        user_id: String(userInfo?.id),
        title: formJobData.title,
        description: formJobData.description,
        location: formJobData.location,
        work_location: formJobData.work_location,
        job_type: formJobData.job_type,
        status: formJobData.status,
        careers_job_details: formJobData.careers_job_details,
      };

      if (selectedPreScreening.length > 0 || removedPreScreeningIds.length > 0) {
        const active = selectedPreScreening.map((sel) => {
          const question = preScreeningQuestions.find((q: any) => q.id === sel.question_id);
          const blankValue = isLocationQuestion(question?.question)
            ? formJobData.location.trim()
            : sel.blank_value ?? '';
          return {
            ...(sel.id !== undefined && { id: sel.id }),
            question_id: sel.question_id,
            is_deal_breaker: sel.is_deal_breaker ?? 0,
            deal_breaker_expected_value: sel.is_deal_breaker === 1
              ? (sel.deal_breaker_expected_value ?? sel.answer ?? '')
              : '',
            blank_value: blankValue,
            answer: sel.answer ?? '',
          };
        });

        const removed = removedPreScreeningIds.map(({ id, question_id }) => ({
          id,
          question_id,
          removed: true,
        }));

        jobData['pre-screening'] = [...active, ...removed];
      }

      if (id) {
        const currentJobInfo = getJobInfo(jobResponse);
        await updateJobAsync({ id: currentJobInfo.id, jobData });
        setSnackBarType('success');
        setSnackBarMessage('Job posting updated successfully!');
      } else {
        await createJobAsync(jobData);
        setSnackBarType('success');
        setSnackBarMessage('Job posting created successfully!');
      }
      setSnackBarOpen(true);
      setRemovedPreScreeningIds([]); // reset after successful save
      navigate('/beesee/job-posting');
    } catch (error: any) {
      if (error.response?.status === 400) {
        const msg = error.response.data?.message;
        if (msg?.includes("title") || msg?.toLowerCase().includes("already exists")) {
          setFormError((prev) => ({ ...prev, title: msg }));
        }
      }
      console.error('❌ Error saving job:', error);
      setSnackBarType("error");
      setSnackBarMessage("Failed to save job posting. Please try again.");
      setSnackBarOpen(true);
    }
  };

  const { data: jobResponse } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getSpecificJob(String(id)),
    enabled: !!id,
  });

  useEffect(() => {
    const jobInfo = getJobInfo(jobResponse);
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

      setRemovedPreScreeningIds([]); // reset on load — start fresh
      setSelectedPreScreening(
        getJobPreScreening(jobInfo)
          .map((item) => normalizePreScreeningSelection(item, preScreeningQuestions))
          .filter((s) => Number.isFinite(s.question_id))
      );
    }
  }, [jobResponse, preScreeningQuestions]);

  return (
    <div className="min-h-screen bg-white-50 dark:bg-white py-8">
      <PreScreeningModal
        open={preScreeningOpen}
        onClose={() => setPreScreeningOpen(false)}
        questions={preScreeningQuestions}
        jobLocation={formJobData.location}
        onAdd={handlePreScreenAdd}
        onRemove={handlePreScreenRemove}
        onUpdate={handlePreScreenUpdate}
        selectedQuestions={selectedPreScreening}
      />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Careers", href: "/beesee/job-posting", icon: <User2 className="w-4 h-4" /> },
              { label: "Careers Form", isActive: true, icon: <FilePenLine className="w-4 h-4" /> }
            ]}
          />
        </div>

        {/* Page header */}
        <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-black mb-2">
                {id ? "Update Job Posting" : "Create New Job Posting"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Post a new job opportunity with detailed requirements</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/beesee/job-posting')}
                disabled={isCreating || isUpdating}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {isCreating || isUpdating ? (
                  <span>{id ? "Updating..." : "Creating..."}</span>
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
          <div className="lg:col-span-3 space-y-8">

            {/* Basic Information */}
            <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                  <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl text-black dark:text-black">Basic Information</h2>
                  <p className="text-gray-600 dark:text-gray-400">Essential job details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm text-black mb-2">Job Title *</label>
                  <CustomTextField
                    name="title" placeholder="e.g., Sales and Marketing"
                    value={formJobData.title} multiline={false} rows={1} type="text" maxLength={100}
                    onChange={handleInputChange} error={!!formError.title} helperText={formError.title}
                    icon={<Briefcase className="w-4 h-4" />}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key.length === 1 && /[0-9]/.test(e.key)) e.preventDefault();
                    }}
                    onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                      if (/[0-9]/.test(e.clipboardData.getData('text'))) e.preventDefault();
                    }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-black dark:text-black mb-2">Job Description *</label>
                  <RichTextEditor
                    value={formJobData.description || ''}
                    onChange={(value) => setJobData(prev => ({ ...prev, description: value }))}
                  />
                  {formError.description && <p className="text-red-500 text-sm mt-1">{formError.description}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-black dark:text-black mb-2">Location *</label>
                  <CustomTextField
                    name="location" placeholder="e.g., South Triangle, Quezon City"
                    value={formJobData.location} multiline={false} rows={1} type="text" maxLength={100}
                    onChange={handleInputChange} error={!!formError.location} helperText={formError.location}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-black dark:text-black mb-2">Work Location *</label>
                  <CustomSelectField
                    name="work_location" placeholder="Select Work Location" value={formJobData.work_location}
                    onChange={handleInputChange}
                    options={[
                      { value: "Onsite", label: "Onsite" },
                      { value: "Remote", label: "Remote" },
                      { value: "Hybrid", label: "Hybrid" },
                    ]}
                    error={!!formError.work_location} helperText={formError.work_location}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-black dark:text-black mb-2">Job Type *</label>
                  <CustomSelectField
                    name="job_type" placeholder="Select Job Type" value={formJobData.job_type}
                    onChange={handleInputChange}
                    options={[
                      { value: "Full-time", label: "Full-time" },
                      { value: "Part-time", label: "Part-time" },
                      { value: "Internship", label: "Internship" },
                      { value: "Contract", label: "Contract" },
                    ]}
                    error={!!formError.job_type} helperText={formError.job_type}
                  />
                </div>

                {id && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-black dark:text-black mb-2">Status *</label>
                    <CustomSelectField
                      name="status" placeholder="Select status" value={formJobData.status}
                      onChange={handleInputChange}
                      options={[
                        { value: "Accepting_Applications", label: "Accepting Applications" },
                        { value: "Closed", label: "Closed" },
                      ]}
                      error={!!formError.job_type} helperText={formError.job_type}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm text-black dark:text-black mb-2">Job Details *</label>
                  <RichTextEditor
                    value={formJobData.careers_job_details || ''}
                    onChange={(value) => setJobData(prev => ({ ...prev, careers_job_details: value }))}
                  />
                  {formError.careers_job_details && <p className="text-red-500 text-sm mt-1">{formError.careers_job_details}</p>}
                </div>
              </div>
            </div>

            {/* Pre-screening Section */}
            <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-4">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl text-black dark:text-black">Pre-screening Questions</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Customize questions to screen applicants (optional)</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreScreeningOpen(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Customize
                </button>
              </div>

              {selectedPreScreening.length > 0 ? (
                <div className="space-y-3">
                  {selectedPreScreening.map((selection) => {
                    const question = preScreeningQuestions.find((q: any) => q.id === selection.question_id);
                    if (!question) return null;
                    return (
                      <div
                        key={selection.instance_id}
                        className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {buildDisplay(question.question, selection.blank_value, formJobData.location)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Type: {question.type?.replace('_', ' ')}
                            </p>
                            {selection.answer && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Answer: "{getChoiceLabel(question, selection.answer)}"
                              </p>
                            )}
                            {selection.is_deal_breaker === 1 && (
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">
                                ✓ Deal breaker — expected: "{getChoiceLabel(question, selection.deal_breaker_expected_value)}"
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handlePreScreenRemove(selection.instance_id)}
                            className="px-3 py-1 text-sm bg-purple-200 hover:bg-purple-300 text-purple-700 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No pre-screening questions selected</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click "Customize" to add questions</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingForm;
