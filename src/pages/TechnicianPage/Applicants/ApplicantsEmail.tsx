import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import CustomTextField from "../../../components/Fields/CustomTextField"
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getInformationApplicant,
  deleteApplicants,
  sendInterviewInvitation,
  applicantUpdateStatus,
  APPLICANT_MODE_STATUSES,
} from "../../../services/Technician/applicantServices"
import { downloadFileDesktop } from "../../../utils/downloadFile"
import {
  User2,
  FilePenLine,
  Download,
  Trash2,
  FileText,
  ZoomIn,
  ZoomOut,
  UserRoundCog,
  Link,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  Check,
} from "lucide-react"
import { Email, Phone } from "@mui/icons-material"
import { userAuth } from "../../../hooks/userAuth"
import AlertDialogRejected from "../../../components/feedback/AlertDialogRejected"
import ApplicantsDialog from "./components/ApplicantsDialog"

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ApplicantFormProps {
  id: number
  full_name: string
  email: string
  phone: string
  position: string
  job_number: string
  status: string
  attachment_url: string
  portfolio_link?: string
  portfolio?: string
  remarks?: string
}

/* ─── Status config ──────────────────────────────────────────────────────── */

const STATUS_META: Record<
  string,
  { label: string; dot: string; pill: string; text: string }
> = {
  NEW_APPLICANT:      { label: "New Applicant",       dot: "#378ADD", pill: "#E6F1FB", text: "#185FA5" },
  SHORTLISTED:        { label: "Shortlisted",          dot: "#7F77DD", pill: "#EEEDFE", text: "#534AB7" },
  INTERVIEWED:        { label: "Interviewed",          dot: "#1D9E75", pill: "#E1F5EE", text: "#0F6E56" },
  ASSESSMENT:         { label: "Assessment",           dot: "#EF9F27", pill: "#FAEEDA", text: "#854F0B" },
  FOR_APPROVAL:       { label: "For Approval",         dot: "#BA7517", pill: "#FAEEDA", text: "#854F0B" },
  BACKGROUND_CHECK:   { label: "Background Check",     dot: "#534AB7", pill: "#EEEDFE", text: "#3C3489" },
  OFFER_STAGE:        { label: "Offer Stage",          dot: "#639922", pill: "#EAF3DE", text: "#3B6D11" },
  ONBOARDING:         { label: "Onboarding",           dot: "#0F6E56", pill: "#E1F5EE", text: "#085041" },
  HIRED:              { label: "Hired",                dot: "#3B6D11", pill: "#EAF3DE", text: "#27500A" },
  REJECTED:           { label: "Rejected",             dot: "#E24B4A", pill: "#FCEBEB", text: "#A32D2D" },
  DECLINED_OFFER:     { label: "Declined Offer",       dot: "#D85A30", pill: "#FAECE7", text: "#993C1D" },
  WITHDRAWN_INACTIVE: { label: "Withdrawn / Inactive", dot: "#888780", pill: "#F1EFE8", text: "#5F5E5A" },
  CLOSED:             { label: "Closed",               dot: "#5F5E5A", pill: "#F1EFE8", text: "#444441" },
}

const STATUS_GROUPS = [
  {
    label: "Initial",
    keys: ["NEW_APPLICANT", "SHORTLISTED"],
  },
  {
    label: "In Progress",
    keys: [
      "INTERVIEWED",
      "ASSESSMENT",
      "FOR_APPROVAL",
      "BACKGROUND_CHECK",
      "OFFER_STAGE",
    ],
  },
  {
    label: "Outcome",
    keys: [
      "ONBOARDING",
      "HIRED",
      "DECLINED_OFFER",
      "REJECTED",
      "WITHDRAWN_INACTIVE",
      "CLOSED",
    ],
  },
]

/* ─── StatusDropdown component ───────────────────────────────────────────── */

interface StatusDropdownProps {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const meta = STATUS_META[value]

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (key: string) => {
    if (key !== value) onChange(key)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-flex items-center gap-3">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`
          flex items-center gap-2 px-3 py-2 min-w-[190px] rounded-xl text-sm font-semibold
          border transition-all duration-150 select-none bg-white border-gray-200 shadow-sm
          ${disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
          }
        `}
        style={{ color: meta?.text ?? "#374151" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: meta?.dot ?? "#9CA3AF" }}
        />
        <span className="flex-1 text-left truncate">
          {meta?.label ?? value}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Active pill badge */}
      {meta && (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
          style={{
            backgroundColor: meta.pill,
            color: meta.text,
            borderColor: meta.dot + "55",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: meta.dot }}
          />
          {meta.label}
        </span>
      )}

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 min-w-[220px]"
          role="listbox"
        >
          {STATUS_GROUPS.map((group, gi) => (
            <React.Fragment key={group.label}>
              {gi > 0 && (
                <div className="my-1.5 border-t border-gray-100" />
              )}
              <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {group.label}
              </p>
              {group.keys.map((key) => {
                const m = STATUS_META[key]
                if (!m) return null
                const isSelected = key === value
                return (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(key)}
                    className={`
                      w-[calc(100%-8px)] mx-1 flex items-center gap-2.5 px-3 py-2 text-sm text-left
                      rounded-xl transition-colors duration-100 hover:bg-gray-50
                      ${isSelected ? "font-semibold" : "font-normal text-gray-700"}
                    `}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: m.dot }}
                    />
                    <span className="flex-1">{m.label}</span>
                    {isSelected && (
                      <Check
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: m.dot }}
                      />
                    )}
                  </button>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */

const ApplicantsEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const queryClient = useQueryClient()

  const {
    userInfo: authUserInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
  } = userAuth()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")
  const [dialogTitle, setDialogTitle] = useState("")
  const [actionType, setActionType] = useState("")
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [isImageZoomed, setIsImageZoomed] = useState(false)

  const [formData, setFormData] = useState<ApplicantFormProps>({
    id: 0,
    full_name: "",
    email: "",
    phone: "",
    position: "",
    job_number: "",
    status: "",
    attachment_url: "",
    portfolio: "",
    portfolio_link: "",
    remarks: "",
  })

  const { data: applicantInfoResponse, isLoading } = useQuery({
    queryKey: ["applicant-detail", id],
    queryFn: () => getInformationApplicant(String(id)),
    enabled: !!id,
  })

  const { mutateAsync: deleteApplicant, isPending: isDeleting } = useMutation({
    mutationFn: deleteApplicants,
  })

  const { mutateAsync: sendInterviewInvitations } = useMutation({
    mutationFn: sendInterviewInvitation,
  })

  const { mutateAsync: updateApplicantStatus, isPending: isUpdatingStatus } =
    useMutation({ mutationFn: applicantUpdateStatus })

  const applicantDetails = applicantInfoResponse?.data

  useEffect(() => {
    if (applicantDetails) {
      setFormData({
        id: applicantDetails.id || 0,
        full_name: applicantDetails.full_name || "",
        email: applicantDetails.email || "",
        phone: applicantDetails.phone || "",
        position: applicantDetails.position || "",
        job_number: applicantDetails.job_number || "",
        status: applicantDetails.status || "",
        attachment_url: applicantDetails.attachment_url || "",
        portfolio: applicantDetails.portfolio || "",
        portfolio_link: applicantDetails.portfolio_link,
        remarks: applicantDetails?.remarks || "",
      })
    }
  }, [applicantDetails])

  const handleChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBack = () => {
    const backTo = location.state?.backTo
    navigate(backTo || -1)
  }

  const handleDownload = (attachment_url: any) => {
    if (!attachment_url) {
      setSnackBarMessage("No file available to download")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
    downloadFileDesktop(attachment_url, {
      filename:
        attachment_url.split("/").pop() || `${formData.full_name}.pdf`,
      onError: () => {
        setSnackBarMessage("Failed to download file. Please try again.")
        setSnackBarType("error")
        setSnackBarOpen(true)
      },
    })
  }

  const handleEmailSubmit = async (emailData: {
    location: string
    time: string
    date: string
    schedule: string
    format: string
  }) => {
    const payload = {
      id: formData.id,
      name: formData.full_name,
      position: formData.position,
      email: formData.email,
      location: emailData.location,
      time: emailData.time,
      date: emailData.date,
      schedule_details: emailData.schedule,
      format: emailData.format,
      duration: "60",
      user_id: authUserInfo?.id,
    }
    try {
      const response = await sendInterviewInvitations(payload)
      if (response?.success) {
        setSnackBarMessage("Interview invitation sent successfully!")
        setSnackBarType("success")
        setSnackBarOpen(true)
        queryClient.invalidateQueries({ queryKey: ["applicant-detail", id] })
      }
    } catch (error: any) {
      const raw =
        error?.response?.data?.message ||
        "Failed to update position. Please try again."
      setSnackBarMessage(String(raw).replace(/^error:\s*/i, ""))
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  const handleDelete = () => {
    setActionType("delete")
    setDialogTitle("Confirm Delete")
    setDialogMessage(
      "Are you sure you want to delete this applicant? This action cannot be undone."
    )
    setDialogOpen(true)
  }

  const updateStatus = async (status: string, remarks?: string) => {
    try {
      const response = await updateApplicantStatus({
        id: Number(formData.id),
        status,
        remarks: remarks?.trim() || undefined,
        user_id: authUserInfo?.id,
      })
      if (response?.success) {
        setFormData((prev) => ({
          ...prev,
          status,
          remarks:
            status === "REJECTED" ? remarks?.trim() || prev.remarks : "",
        }))
        setDialogOpen(false)
        setActionType("")
        setSnackBarMessage("Applicant status updated successfully")
        setSnackBarType("success")
        setSnackBarOpen(true)
        const keys = [
          "applicant-detail", "all-applicant", "short-listed", "rejected",
          "new-applicant", "hired", "closed", "applicant-mode", "interview-list",
        ]
        keys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: [key] })
        )
      }
    } catch (error: any) {
      const raw =
        error?.response?.data?.message || "Failed to update applicant status."
      setSnackBarMessage(String(raw).replace(/^error:\s*/i, ""))
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  const handleStatusChange = (nextStatus: string) => {
    if (!nextStatus || nextStatus === formData.status) return
    if (nextStatus === "REJECTED") {
      setActionType("status-rejected")
      setDialogTitle("Reject Applicant")
      setDialogMessage(
        "Please provide a remark before marking this applicant as rejected."
      )
      setDialogOpen(true)
      return
    }
    updateStatus(nextStatus)
  }

  const handleConfirmAction = async (remarks?: string) => {
    try {
      if (actionType === "status-rejected") {
        await updateStatus("REJECTED", remarks)
        return
      }
      if (actionType === "delete") {
        const response = await deleteApplicant({
          ids: [formData.id],
          user_id: authUserInfo?.id,
        })
        if (response?.success) {
          setDialogOpen(false)
          setSnackBarMessage("Applicant deleted successfully")
          setSnackBarType("success")
          setSnackBarOpen(true)
          navigate(-1)
        }
      }
    } catch {
      setSnackBarMessage("Action failed. Please try again.")
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  /* ── Loading ────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-yellow-400 mx-auto" />
          <p className="mt-4 text-gray-500 font-medium text-sm">
            Loading applicant details…
          </p>
        </div>
      </div>
    )
  }

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Dialogs */}
        <AlertDialogRejected
          open={dialogOpen}
          title={dialogTitle}
          message={dialogMessage}
          onClose={() => { setDialogOpen(false); setActionType("") }}
          onSubmit={handleConfirmAction}
          isLoading={isDeleting || isUpdatingStatus}
          showRemarks={actionType === "status-rejected"}
          remarksRequired={actionType === "status-rejected"}
          remarksLabel="Rejection Note"
          remarksPlaceholder="Why is this applicant rejected?"
        />
        <ApplicantsDialog
          open={emailDialogOpen}
          onClose={() => setEmailDialogOpen(false)}
          onSubmit={handleEmailSubmit}
          applicantName={formData.full_name}
          applicantEmail={formData.email}
        />

        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              {
                label: "Careers",
                href: "/beesee/job-posting",
                icon: <User2 className="w-4 h-4" />,
              },
              {
                label: "Applicant Details",
                isActive: true,
                icon: <FilePenLine className="w-4 h-4" />,
              },
            ]}
          />
        </div>

        {/* ── Header card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <h1 className="text-3xl font-bold text-gray-900 truncate">
                  {formData.full_name}
                </h1>
                {applicantDetails?.applicants_interview_status && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Scheduled
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-0.5">
                <span className="font-semibold text-gray-700">Position:</span>{" "}
                {formData.position}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">
                  Job Reference:
                </span>{" "}
                {formData.job_number}
              </p>

              {/* Interview info bar */}
              {(applicantDetails?.scheduled_by ||
                applicantDetails?.schedule_date ||
                applicantDetails?.time) && (
                <div className="mt-3 inline-flex flex-wrap items-center gap-x-4 gap-y-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600">
                  {applicantDetails?.scheduled_by && (
                    <span>
                      <span className="font-semibold text-gray-800">
                        Scheduled by:
                      </span>{" "}
                      {applicantDetails.scheduled_by}
                    </span>
                  )}
                  {applicantDetails?.schedule_date && (
                    <span>
                      <span className="font-semibold text-gray-800">
                        Date:
                      </span>{" "}
                      {applicantDetails.schedule_date}
                    </span>
                  )}
                  {applicantDetails?.time && (
                    <span>
                      <span className="font-semibold text-gray-800">
                        Time:
                      </span>{" "}
                      {applicantDetails.time}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                title="Send Schedule"
                onClick={() => setEmailDialogOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#FCD000] hover:bg-[#f0c400] text-gray-900 transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.97]"
              >
                <CalendarClock className="w-4 h-4" />
                Schedule
              </button>

              {formData.status === "REJECTED" && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all duration-150 active:scale-[0.97]"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}

              <button
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-150 active:scale-[0.97]"
              >
                Back
              </button>
            </div>
          </div>

          {/* ── Status row ──────────────────────────────────────────────── */}
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Status
            </span>
            <StatusDropdown
              value={formData.status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
            />
            {isUpdatingStatus && (
              <span className="text-xs text-gray-400 animate-pulse">
                Updating…
              </span>
            )}
          </div>
        </div>

        {/* ── Body grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

          {/* Contact card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">
              Contact Information
            </h2>
            <p className="text-sm text-gray-500 mb-5">Personal details</p>

            <div className="space-y-4">
              <Field label="Full Name">
                <CustomTextField
                  name="full_name"
                  placeholder="Full name"
                  value={formData.full_name}
                  onChange={handleChangeInput}
                  disabled
                  rows={1}
                  multiline={false}
                  type="text"
                  icon={<User2 className="w-4 h-4" />}
                />
              </Field>

              <Field label="Email Address">
                <CustomTextField
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChangeInput}
                  disabled
                  rows={1}
                  multiline={false}
                  type="email"
                  icon={<Email className="w-4 h-4" />}
                />
              </Field>

              <Field label="Phone Number">
                <CustomTextField
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChangeInput}
                  disabled
                  rows={1}
                  multiline={false}
                  type="text"
                  icon={<Phone className="w-4 h-4" />}
                />
              </Field>

              <Field label="Position Applied">
                <CustomTextField
                  name="position"
                  placeholder="Position"
                  value={formData.position}
                  onChange={handleChangeInput}
                  disabled
                  rows={1}
                  multiline={false}
                  type="text"
                  icon={<UserRoundCog className="w-4 h-4" />}
                />
              </Field>

              {formData.portfolio_link && (
                <Field label="Portfolio Link">
                  <CustomTextField
                    name="portfolio_link"
                    placeholder="Portfolio Link"
                    value={formData.portfolio_link}
                    onChange={handleChangeInput}
                    disabled
                    rows={1}
                    multiline={false}
                    type="text"
                    icon={<Link className="w-4 h-4" />}
                  />
                </Field>
              )}
            </div>

            {/* Rejection remarks */}
            {formData.remarks && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                        Rejection Remarks
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Review note recorded for this applicant.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    Rejected
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-[120px_1fr] gap-y-1 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-gray-400">
                    Rejected By
                  </span>
                  <span className="font-semibold text-gray-900">
                    {applicantDetails?.rejected_by || "Not specified"}
                  </span>
                </div>

                <div className="mt-3 rounded-lg border border-red-100 bg-white p-3">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                    {formData.remarks}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resume + Portfolio */}
          <div className="space-y-6">
            <FileCard
              title="Resume / CV"
              subtitle="Applicant's resume"
              onDownload={() => handleDownload(formData.attachment_url)}
              url={formData.attachment_url}
              isImage={applicantDetails?.file_type?.startsWith("image/")}
              isImageZoomed={isImageZoomed}
              onZoomToggle={() => setIsImageZoomed((z) => !z)}
              previewTitle="Resume Preview"
              emptyLabel="No resume uploaded"
            />

            {formData.portfolio && (
              <FileCard
                title="Portfolio"
                subtitle="Applicant's portfolio"
                onDownload={() => handleDownload(formData.portfolio)}
                url={formData.portfolio}
                isImage={applicantDetails?.file_type?.startsWith("image/")}
                isImageZoomed={isImageZoomed}
                onZoomToggle={() => setIsImageZoomed((z) => !z)}
                previewTitle="Portfolio Preview"
                emptyLabel="No portfolio uploaded"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Field helper ───────────────────────────────────────────────────────── */

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
      {label}
    </label>
    {children}
  </div>
)

/* ─── FileCard helper ────────────────────────────────────────────────────── */

interface FileCardProps {
  title: string
  subtitle: string
  onDownload: () => void
  url?: string
  isImage?: boolean
  isImageZoomed: boolean
  onZoomToggle: () => void
  previewTitle: string
  emptyLabel: string
}

const FileCard: React.FC<FileCardProps> = ({
  title,
  subtitle,
  onDownload,
  url,
  isImage,
  isImageZoomed,
  onZoomToggle,
  previewTitle,
  emptyLabel,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <button
        onClick={onDownload}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.97]"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
    </div>

    {url ? (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        {isImage ? (
          <div
            className={`relative w-full flex items-center justify-center p-4 bg-white cursor-pointer group transition-all duration-300 ${
              isImageZoomed ? "h-auto" : "h-[500px]"
            }`}
            onClick={onZoomToggle}
          >
            <img
              src={url}
              alt={previewTitle}
              className={`transition-all duration-300 ${
                isImageZoomed
                  ? "w-full cursor-zoom-out"
                  : "max-w-full max-h-full object-contain cursor-zoom-in"
              }`}
            />
            <div className="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
              {isImageZoomed ? (
                <><ZoomOut className="w-3.5 h-3.5" /> Zoom out</>
              ) : (
                <><ZoomIn className="w-3.5 h-3.5" /> Zoom in</>
              )}
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-[500px]"
            title={previewTitle}
          />
        )}
      </div>
    ) : (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-400 font-medium">{emptyLabel}</p>
      </div>
    )}
  </div>
)

export default ApplicantsEmail