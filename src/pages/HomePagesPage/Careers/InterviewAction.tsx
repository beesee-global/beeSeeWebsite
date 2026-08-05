import React from "react";
import { useSearchParams } from "react-router-dom";
import { interviewAction } from "../../../services/Technician/applicantServices";
import { useQuery } from "@tanstack/react-query";

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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const iconBg: Record<IconVariant, string> = {
  confirmed: "bg-green-50",
  cancelled: "bg-red-50",
  info: "bg-blue-50",
  loading: "bg-gray-100",
};

const Badge = ({ variant, label }: { variant: "green" | "red" | "blue"; label: string }) => {
  const styles = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-4 ${styles[variant]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

const resolveState = (data: any, isLoading: boolean, isError: boolean, type: string | null) => {
  if (isLoading) return { state: "loading" as const };
  if (isError || !data?.success) return { state: "error" as const };

  // Already responded — derive message from current status
  if (data.responded) {
    return {
      state: "already" as const,
      status: data.status as "Confirmed" | "Cancelled",
    };
  }

  // Fresh response
  return {
    state: "fresh" as const,
    action: type === "confirm" ? "confirmed" : "cancelled",
  };
};

const InterviewAction = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  const { data, isError, isLoading } = useQuery({
    queryKey: ["interview-action", type, token],
    queryFn: () => interviewAction(String(type), String(token)),
    enabled: !!type && !!token,
    retry: false,
  });

  const resolved = resolveState(data, isLoading, isError, type);
  console.log("RESOLVED", resolved)

  const renderContent = () => {
    if (resolved.state === "loading") {
      return (
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full ${iconBg.loading} flex items-center justify-center mx-auto mb-6`}>
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Processing your response</p>
          <p className="text-sm text-gray-500">Please wait a moment...</p>
        </div>
      );
    }

    if (resolved.state === "error") {
      return (
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full ${iconBg.cancelled} flex items-center justify-center mx-auto mb-6`}>
            {icons.cancelled}
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Something went wrong</p>
          <p className="text-sm text-gray-500">This link may be invalid or expired.</p>
        </div>
      );
    }

    if (resolved.state === "already") {
      const isConfirmed = resolved.status === "Confirmed";
      return (
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full ${iconBg.info} flex items-center justify-center mx-auto mb-6`}>
            {icons.info}
          </div>
          <Badge variant="blue" label="Already responded" />
          <p className="text-lg font-medium text-gray-900 mb-2">Response already submitted</p>
          <p className="text-sm text-gray-500">
            You've already {isConfirmed ? "confirmed" : "cancelled"} this interview. No further action is needed.
          </p>
        </div>
      );
    }

    // fresh confirmed or cancelled
    const isConfirmed = resolved.action === "confirmed";
    return (
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full ${isConfirmed ? iconBg.confirmed : iconBg.cancelled} flex items-center justify-center mx-auto mb-6`}>
          {isConfirmed ? icons.confirmed : icons.cancelled}
        </div>
        <Badge variant={isConfirmed ? "green" : "red"} label={isConfirmed ? "Confirmed" : "Cancelled"} />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isConfirmed ? "Interview confirmed" : "Interview cancelled"}
        </p>
        <p className="text-sm text-gray-500">
          {isConfirmed
            ? "Your attendance has been recorded. You'll receive a reminder closer to the schedule."
            : "Your cancellation has been recorded. The recruiter will be notified."}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 max-w-md w-full">
        {renderContent()}
        <hr className="my-6 border-gray-100" />
        <div className="text-center">
          <a href="/" className="text-sm text-blue-500 hover:underline">Back to home</a>
        </div>
      </div>
    </div>
  );
};

export default InterviewAction;