import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  ClipboardList,
  Send,
  FileCheck2,
  FileSearch,
  ImagePlus,
  MessageSquareText,
  BadgeCheck,
  Barcode,
  Lock,
  CircleHelp,
  Upload
} from 'lucide-react';

interface AJobOrderFlowDialogProps {
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const JobOrderFlowDialog: React.FC<AJobOrderFlowDialogProps> = ({
  open, 
  onClose, 
  isLoading = false,
}) => {
    
  const processSteps = [
    {
      title: 'Reply in Conversation',
      description: 'Send updates to the customer and keep all communication in the same thread.',
      icon: MessageSquareText,
      accent: 'text-cyan-700 bg-cyan-100',
    },
    {
      title: 'Review Ticket Details',
      description: 'Check customer details, issue type, serial number, and concern before doing actions.',
      icon: ClipboardList,
      accent: 'text-slate-700 bg-slate-100',
    },
    {
      title: 'Update Serial Number',
      description: 'Use Update Serial Number when the device serial or location needs correction before sending or revising the job order PDF.',
      icon: Barcode,
      accent: 'text-amber-700 bg-amber-100',
    },
    {
      title: 'Send Job Order PDF',
      description: 'Generate and send the job order so the service process is formally recorded.',
      icon: Send,
      accent: 'text-blue-700 bg-blue-100',
    },
    {
      title: 'View Job Order',
      description: 'Open the current job order PDF to review the latest generated document before uploading the finished version.',
      icon: FileSearch,
      accent: 'text-violet-700 bg-violet-100',
    },
    {
      title: 'Upload Finished Job Order',
      description: 'Upload the final signed or completed job order PDF after service so it can be used for completion and future reference.',
      icon: Upload,
      accent: 'text-indigo-700 bg-indigo-100',
    },
     {
      title: 'View Finished Job Order',
      description: 'View the final signed or completed job order PDF after service.',
      icon: FileCheck2,
      accent: 'text-indigo-700 bg-indigo-100',
    },
    {
      title: 'Upload Before-Service Images',
      description: 'Add photos before repair/maintenance to document the initial condition.',
      icon: ImagePlus,
      accent: 'text-orange-700 bg-orange-100',
    },
    {
      title: 'Upload After-Service Images',
      description: 'Add final photos after service. This is required before marking as completed.',
      icon: ImagePlus,
      accent: 'text-emerald-700 bg-emerald-100',
    },
    {
      title: 'Mark as Completed',
      description: 'Use Complete when work is done and all required files are uploaded.',
      icon: BadgeCheck,
      accent: 'text-green-700 bg-green-100',
    },
    {
      title: 'Mark as Closed',
      description: 'Use Close to finalize the ticket and lock further edits.',
      icon: Lock,
      accent: 'text-rose-700 bg-rose-100',
    },
  ];

  const faqs = [
    {
      question: "Why can't I complete?",
      answer: 'You need at least one after-service image and a finished job order upload.',
    },
    {
      question: 'Can I close directly?',
      answer: 'Yes if you have permission, but completing first is recommended for proper record tracking.',
    },
    {
      question: 'Can I edit after closing?',
      answer: 'No. Closed tickets should be treated as final records.',
    },
    {
      question: "Will the technician still go on-site if repair isn't possible?",
      answer: 'Yes, for assessment. If repair cannot be completed, document the reason in Remarks.',
    },
  ];
  
  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle className="font-bold" sx={{ color: 'black' }}>Job Order Process</DialogTitle>

      <DialogContent dividers className="flex flex-col gap-4">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-sm font-semibold text-blue-900">Recommended Flow</p>
          <p className="mt-1 text-sm text-blue-800">
            Follow this sequence to keep ticket status and reports consistent.
          </p>
        </div>

        <div className="space-y-3">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${step.accent}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <CircleHelp size={16} />
            Quick FAQ
          </p>
          <div className="mt-2 space-y-2">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-md border border-amber-200 bg-white/60 p-2">
                <p className="text-sm font-semibold text-amber-900">{item.question}</p>
                <p className="text-sm text-amber-800">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>

      <DialogActions className="p-5">
        <Button onClick={handleClose} color="inherit" disabled={isLoading}>
          Close
        </Button> 
      </DialogActions>
    </Dialog>
  );
};

export default JobOrderFlowDialog;
