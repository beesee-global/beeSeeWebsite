import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { interviewAction } from "../../../services/Technician/applicantServices";
import { useMutation, useQuery } from "@tanstack/react-query";

type IconVariant = "confirmed" | "cancelled" | "info" | "loading";

const icons = {
  confirmed: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--tw-color, currentColor)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  cancelled: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  info: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#fcd000]">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const iconBg: Record<IconVariant, string> = {
  confirmed: "bg-green-50",
  cancelled: "bg-red-50",
  info: "bg-[#2a2100]",
  loading: "bg-[#1a1a1a]",
};

const formatScheduleDate = (value: unknown) => {
  if (!value) return "Not specified";
  const raw = String(value).split("T")[0];
  const [year, month, day] = raw.split("-").map(Number);
  if (!year || !month || !day) return String(value);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const Badge = ({ variant, label }: { variant: "green" | "red" | "blue"; label: string }) => {
  const styles = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-4 ${variant === "blue" ? "bg-[#2a2100] text-[#fcd000]" : styles[variant]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

const resolveState = (data: any, isLoading: boolean, isError: boolean, type: string | null) => {
  if (isLoading) return { state: "loading" as const };
  if (isError || !data?.success) return { state: "error" as const };

  if (type === "reschedule" && data.requires_reschedule_details) {
    return {
      state: "reschedule-form" as const,
      currentDate: data.current_date,
      currentTime: data.current_time,
    };
  }

  // Already responded — derive message from current status
  if (data.responded) {
    return {
      state: "already" as const,
      status: data.status as "Confirmed" | "Cancelled" | "Reschedule Requested",
    };
  }

  // Fresh response
  return {
    state: "fresh" as const,
    action: type === "confirm" ? "confirmed" : type === "reschedule" ? "reschedule" : "cancelled",
  };
};

const InterviewAction = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const option = searchParams.get("option");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [rescheduleSubmitted, setRescheduleSubmitted] = useState(false);

  const rescheduleMutation = useMutation({
    mutationFn: () => interviewAction("reschedule", String(token), null, requestedDate, requestedTime),
    onSuccess: () => setRescheduleSubmitted(true),
  });

  const { data, isError, isLoading } = useQuery({
    queryKey: ["interview-action", type, option, token],
    queryFn: () => interviewAction(String(type), String(token), option),
    enabled: !!type && !!token,
    retry: false,
  });

  const resolved = resolveState(data, isLoading, isError, type);
  const submitReschedule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestedDate || !requestedTime) {
      setSubmitError("Please choose both a requested date and time.");
      return;
    }
    setSubmitError("");
    try {
      await rescheduleMutation.mutateAsync();
    } catch {
      // The mutation error is shown below the form.
    }
  };

  const renderContent = () => {
    if (resolved.state === "loading") {
      return (
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full ${iconBg.loading} flex items-center justify-center mx-auto mb-6`}>
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Processing your response</p>
            <p className="text-sm text-gray-400">Please wait a moment...</p>
        </div>
      );
    }

    if (resolved.state === "error") {
      return (
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full ${iconBg.cancelled} flex items-center justify-center mx-auto mb-6`}>
            {icons.cancelled}
          </div>
          <p className="text-lg font-medium text-white mb-2">Something went wrong</p>
          <p className="text-sm text-gray-400">This link may be invalid or expired.</p>
        </div>
      );
    }

    if (resolved.state === "reschedule-form") {
      if (rescheduleSubmitted) {
        return (
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full ${iconBg.info} flex items-center justify-center mx-auto mb-6`}>{icons.info}</div>
            <Badge variant="blue" label="Reschedule requested" />
            <p className="text-lg font-medium text-white mb-2">Date change requested</p>
            <p className="text-sm text-gray-400">Your requested date and time were sent to the recruiter for approval.</p>
          </div>
        );
      }
      return (
        <div>
          <div className={`w-16 h-16 rounded-full ${iconBg.info} flex items-center justify-center mx-auto mb-6`}>
            {icons.info}
          </div>
          <div className="text-center">
            <Badge variant="blue" label="Reschedule request" />
            <p className="font-bebas text-3xl uppercase tracking-wide text-white mb-2">Request a new interview schedule</p>
            <p className="text-sm text-gray-400 mb-6">
              Current schedule: {formatScheduleDate(resolved.currentDate)} at {resolved.currentTime || "Not specified"}. The recruiter must approve your requested schedule.
            </p>
          </div>
          <form onSubmit={submitReschedule} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#d7c98a]">
              Requested date
              <input
                type="date"
                value={requestedDate}
                onChange={(event) => setRequestedDate(event.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="mt-2 w-full rounded-lg border border-[#5a4a00] bg-[#171717] px-3 py-3 text-sm text-white outline-none focus:border-[#fcd000]"
                required
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#d7c98a]">
              Requested time
              <input
                type="time"
                value={requestedTime}
                onChange={(event) => setRequestedTime(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[#5a4a00] bg-[#171717] px-3 py-3 text-sm text-white outline-none focus:border-[#fcd000]"
                required
              />
            </label>
            {submitError && <p className="text-sm text-red-400">{submitError}</p>}
            {rescheduleMutation.isError && <p className="text-sm text-red-400">Unable to send the request. Please try again.</p>}
            <button
              type="submit"
              disabled={rescheduleMutation.isPending}
              className="w-full rounded-lg bg-[#fcd000] px-4 py-3 text-sm font-bold text-black shadow-[0_0_22px_rgba(252,208,0,0.22)] disabled:opacity-60"
            >
              {rescheduleMutation.isPending ? "Sending request..." : "Submit reschedule request"}
            </button>
          </form>
        </div>
      );
    }

    if (resolved.state === "already") {
      const isConfirmed = resolved.status === "Confirmed";
      const isRescheduleRequested = resolved.status === "Reschedule Requested";
      return (
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full ${iconBg.info} flex items-center justify-center mx-auto mb-6`}>
            {icons.info}
          </div>
          <Badge variant="blue" label="Already responded" />
          <p className="text-lg font-medium text-white mb-2">Response already submitted</p>
          <p className="text-sm text-gray-400">
            You've already {isRescheduleRequested ? "requested a date change for" : isConfirmed ? "confirmed" : "cancelled"} this interview. No further action is needed.
          </p>
        </div>
      );
    }

    // fresh confirmed or cancelled
    const isConfirmed = resolved.action === "confirmed";
    const isReschedule = resolved.action === "reschedule";
    return (
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full ${isConfirmed ? iconBg.confirmed : isReschedule ? iconBg.info : iconBg.cancelled} flex items-center justify-center mx-auto mb-6`}>
          {isConfirmed ? icons.confirmed : isReschedule ? icons.info : icons.cancelled}
        </div>
        <Badge variant={isConfirmed ? "green" : isReschedule ? "blue" : "red"} label={isConfirmed ? "Confirmed" : isReschedule ? "Reschedule requested" : "Cancelled"} />
        <p className="text-lg font-medium text-white mb-2">
          {isConfirmed ? "Interview confirmed" : isReschedule ? "Date change requested" : "Interview cancelled"}
        </p>
        <p className="text-sm text-gray-400">
          {isConfirmed
            ? "Your attendance has been recorded. You'll receive a reminder closer to the schedule."
            : isReschedule
              ? "Your request has been sent to the recruiter. They will contact you with a new schedule."
              : "Your cancellation has been recorded. The recruiter will be notified."}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-5 sm:p-8 text-white">
      <div className="relative bg-[#121212] border border-[#4f4100] shadow-[0_0_45px_rgba(252,208,0,0.12)] rounded-2xl p-7 sm:p-10 max-w-md w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fcd000]" />
        {renderContent()}
        <hr className="my-6 border-[#2d2d2d]" />
        <div className="text-center">
          <a href="/" className="text-sm text-[#fcd000] hover:underline">Back to home</a>
        </div>
      </div>
    </div>
  );
};

export default InterviewAction;
