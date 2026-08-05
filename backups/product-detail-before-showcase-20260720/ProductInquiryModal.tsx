import React, { useEffect, useState } from "react";
import { CheckCircle, Building2, Mail, Phone, Send, User2, X } from "lucide-react";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import TextsmsIcon from "@mui/icons-material/Textsms";
import CustomTextField from "../../../../components/Fields/CustomTextField";
import { createConsultation } from "../../../../services/Technician/inquiriesServices";

type InquiryForm = {
  name: string;
  email: string;
  company: string;
  position: string;
  contact_number: string;
  subject: string;
  description: string;
};

type FormErrors = Partial<Record<keyof InquiryForm, string>>;

interface ProductInquiryModalProps {
  open: boolean;
  productName: string;
  productPid: string;
  selectedVariant?: string;
  onClose: () => void;
}

const ProductInquiryModal: React.FC<ProductInquiryModalProps> = ({
  open,
  productName,
  productPid,
  selectedVariant,
  onClose,
}) => {
  const subject = selectedVariant
    ? `Product Inquiry: ${productName} (${productPid}) - ${selectedVariant}`
    : `Product Inquiry: ${productName} (${productPid})`;
  const [form, setForm] = useState<InquiryForm>({
    name: "",
    email: "",
    company: "",
    position: "",
    contact_number: "",
    subject,
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm((current) => ({ ...current, subject }));
    setErrors({});
    setSubmitted(false);
  }, [open, subject]);

  const updateField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "Invalid email format.";
    if (!form.company.trim()) nextErrors.company = "Company is required.";
    if (!form.position.trim()) nextErrors.position = "Role is required.";
    if (!form.contact_number.trim()) nextErrors.contact_number = "Phone number is required.";
    else if (!/^09\d{9}$/.test(form.contact_number)) nextErrors.contact_number = "Phone number must start with 09 and be 11 digits long.";
    if (!form.description.trim()) nextErrors.description = "Message is required.";
    return nextErrors;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      // Uses the exact same inquiry endpoint and payload as the public inquiry page.
      await createConsultation({ ...form, subject });
      setSubmitted(true);
    } catch {
      setErrors({ description: "We could not send your inquiry. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.78)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, #151515, #090909)", border: "1px solid rgba(253,204,0,.38)", boxShadow: "0 30px 90px rgba(0,0,0,.55)" }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-inquiry-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="bee-body-sm mb-1" style={{ color: "var(--beesee-gold)" }}>PRODUCT INQUIRY</p>
            <h2 id="product-inquiry-title" className="bee-title-sm" style={{ color: "#fff" }}>{productName}</h2>
            {selectedVariant && (
              <p className="bee-body-sm mt-2" style={{ color: "rgba(255,255,255,.72)" }}>
                Selected variant: {selectedVariant}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-white transition hover:bg-white/10" aria-label="Close inquiry form">
            <X size={24} />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center">
            <CheckCircle className="mx-auto mb-4" size={48} color="var(--beesee-gold)" />
            <h3 className="bee-title-sm mb-3 text-white">Inquiry sent</h3>
            <p className="bee-body mb-6 text-white/80">Our team will receive your inquiry and contact you by email.</p>
            <button type="button" className="beesee-button" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <CustomTextField name="name" placeholder="Enter your name" value={form.name} onChange={updateField} icon={<User2 />} rows={1} maxLength={100} type="text" multiline={false} error={!!errors.name} helperText={errors.name} />
              <CustomTextField name="email" placeholder="Enter your email" value={form.email} onChange={updateField} icon={<Mail />} rows={1} maxLength={100} type="email" multiline={false} error={!!errors.email} helperText={errors.email} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <CustomTextField name="company" placeholder="Enter company name" value={form.company} onChange={updateField} icon={<Building2 />} rows={1} maxLength={100} type="text" multiline={false} error={!!errors.company} helperText={errors.company} />
              <CustomTextField name="position" placeholder="Enter your position" value={form.position} onChange={updateField} icon={<ManageAccountsIcon />} rows={1} maxLength={100} type="text" multiline={false} error={!!errors.position} helperText={errors.position} />
            </div>
            <CustomTextField name="contact_number" placeholder="09XXXXXXXXX" value={form.contact_number} onChange={updateField} icon={<Phone />} rows={1} maxLength={11} type="tel" multiline={false} error={!!errors.contact_number} helperText={errors.contact_number} />
            <CustomTextField name="subject" placeholder="Inquiry subject" value={subject} onChange={updateField} rows={1} maxLength={150} type="text" multiline={false} disabled />
            <CustomTextField name="description" placeholder="Tell us about your requirements..." value={form.description} onChange={updateField} icon={<TextsmsIcon />} rows={4} maxLength={2550} type="text" multiline error={!!errors.description} helperText={errors.description} />
            <button type="submit" disabled={isSubmitting} className="beesee-button w-full disabled:cursor-not-allowed disabled:opacity-60">
              <Send size={20} /> {isSubmitting ? "Sending..." : "Submit Inquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductInquiryModal;
