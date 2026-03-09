import React from 'react';
import { Send, X } from 'lucide-react';

interface CustomerIssue {
    full_name: string;
    company: string;
    city: string;
    email: string;
    item_name?: string;
    contact_number: string;
    category_id: string;
    is_active: string;
    device_id: string;
    issue_id: string;
    questions: string;
    serial_number: string;
}

interface UploadedImagePreview {
    id: string;
    file: File | null;
    previewUrl?: string | null;
}

interface CustomerSupportModalProps {
    open: boolean;
    isSubmitting: boolean;
    formData: CustomerIssue;
    categoryLabel?: string;
    deviceLabel?: string;
    issueLabel?: string;
    uploadedImages: UploadedImagePreview[];
    onCancel: () => void;
    onSubmit: () => void;
}

const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
    open,
    isSubmitting,
    formData,
    categoryLabel,
    deviceLabel,
    issueLabel,
    uploadedImages,
    onCancel,
    onSubmit,
}) => {
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    if (!open) return null;

    const reviewItems = [
        { label: 'Full Name', value: formData.full_name },
        { label: 'Company / Institution', value: formData.company },
        { label: 'City', value: formData.city },
        { label: 'Email', value: formData.email },
        { label: 'Phone Number', value: formData.contact_number },
        { label: 'Device Type', value: categoryLabel || formData.category_id },
        ...(formData.is_active === 'false'
            ? [
                  { label: 'Model', value: deviceLabel || formData.device_id },
                  { label: 'Issue Type', value: issueLabel || formData.issue_id },
              ]
            : [{ label: 'Item Name', value: formData.item_name || '' }]),
        { label: 'Serial Number', value: formData.serial_number || '-' },
        { label: 'Issue Details', value: formData.questions },
    ];

    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.88)',
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.3s ease-out',
            }}
            onClick={onCancel}
        >
            <div
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-10"
                style={{
                    position: 'relative',
                    zIndex: 10000,
                    background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.98), rgba(20, 20, 20, 0.98))',
                    border: '1px solid rgba(253, 204, 0, 0.35)',
                    boxShadow: '0 30px 90px rgba(253, 204, 0, 0.25)',
                    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h3 className="bee-title-sm mb-2" style={{ color: 'var(--text-light)' }}>
                            Review Your Information
                        </h3> 
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:bg-white/10 hover:rotate-90"
                        style={{ color: 'var(--muted)' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div 
                    className="space-y-3 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(253, 204, 0, 0.2)' }}
                >
                    {reviewItems.map((item) => (
                        <div 
                            key={item.label} 
                            className={`flex ${item.label === 'Issue Details' ? "flex-col" : ""} gap-2`}
                        >
                            <p className="bee-body-sm font-semibold" style={{ color: 'var(--muted)' }}>
                                {item.label}:
                            </p>
                            <p className="bee-body-sm break-words" style={{ color: 'var(--text-light)' }}>
                                {item.value || '-'}
                            </p>
                        </div>
                    ))}

                    <div className="">
                        <p className="bee-body-sm font-semibold" style={{ color: 'var(--muted)' }}>
                            Uploaded Files
                        </p>
                        {uploadedImages.length === 0 ? (
                            <p className="bee-body-sm" style={{ color: 'var(--text-light)' }}>
                                No files uploaded
                            </p>
                        ) : (
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {uploadedImages.map((image) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        // onClick={() => setSelectedImage(image.previewUrl || null)}
                                        className="overflow-hidden rounded-lg border border-[rgba(253,204,0,0.35)] hover:opacity-90 transition"
                                    >
                                        <img
                                            src={image.previewUrl || ''}
                                            alt={image.file?.name || 'Uploaded image'}
                                            className="w-full h-24 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 flex gap-3 justify-end">
                    <div className=' flex space-x-2 w-60'>
                        <button
                            onClick={onCancel}
                            className="px-5 py-2 rounded-lg transition-all hover:bg-white/10"
                            style={{ color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={isSubmitting} 
                            onClick={onSubmit} 
                            className={`beesee-button ${isSubmitting ? 'beesee-button--disabled cursor-not-allowed' : ''}`}
                        >
                            <Send size={18} />
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ zIndex: 10002, background: 'rgba(0,0,0,0.9)' }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes slideUp {
                  from { opacity: 0; transform: translateY(30px); }
                  to { opacity: 1; transform: translateY(0); }
                }

                .overflow-y-auto::-webkit-scrollbar {
                  width: 8px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 10px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                  background: rgba(253, 204, 0, 0.3);
                  border-radius: 10px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                  background: rgba(253, 204, 0, 0.5);
                }
            `}</style>
        </div>
    );
};

export default CustomerSupportModal;
