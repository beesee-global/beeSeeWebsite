import React, { useEffect, useMemo, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from "framer-motion";
import { Upload, User2, Phone, Calendar, Ruler, Weight } from "lucide-react";
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician";
import CustomTextField from "../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../components/Fields/CustomSelectField";
import { UserProfileFormData, UserProfileFormErrors } from "../../../models/user";
import barangays from "../../../store/PSGC/barangays.json";
import cities from "../../../store/PSGC/cities.json";
import provinces from "../../../store/PSGC/provinces.json";
import regions from "../../../store/PSGC/regions.json";
import { userInformation } from '../../../services/Technician/userServices'
import { useMutation } from "@tanstack/react-query";

type SnackbarType = "success" | "info" | "warning" | "error";

const MAX_IMAGE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

const initialFormData: UserProfileFormData = {
  first_name: "",
  last_name: "",
  middle_name: "",
  suffix: "",
  nick_name: "", 
  contact_number: "",
  region: "",
  province: "",
  city: "",
  barangay: "",
  street: "",
  house_no: "",
  sex: "",
  marital_status: "",
  citizen_ship: "",
  religion: "",
  place_of_birth: "",
  birth_day: "",
  age: "",
  height: "",
  weight: "",
};

// Validate required fields, file constraints, and reCAPTCHA
const validateUserForm = (
  data: UserProfileFormData,
  image: File | null,
  captchaToken: string | null
): UserProfileFormErrors => {
  const errors: UserProfileFormErrors = {};

  if (!data.first_name.trim()) errors.first_name = "First name is required.";
  if (!data.last_name.trim()) errors.last_name = "Last name is required.";
  if (!data.middle_name.trim()) errors.middle_name = "Middle name is required."; 
  if (!data.contact_number.trim()) errors.contact_number = "Contact number is required.";
  else if (!/^09\d{9}$/.test(data.contact_number)) errors.contact_number = "Contact number must start with 09 and be 11 digits.";
  if (!data.region.trim()) errors.region = "Region is required.";
  if (!data.province.trim()) errors.province = "Province is required.";
  if (!data.city.trim()) errors.city = "City is required.";
  if (!data.barangay.trim()) errors.barangay = "Barangay is required.";
  if (!data.sex) errors.sex = "Sex is required.";
  if (!data.marital_status) errors.marital_status = "Marital status is required.";
  if (!data.citizen_ship) errors.citizen_ship = "Citizenship is required.";
  if (!data.religion.trim()) errors.religion = "Religion is required.";
  if (!data.place_of_birth.trim()) errors.place_of_birth = "Place of birth is required.";
  if (!data.birth_day) errors.birth_day = "Date of birth is required.";
  if (!data.age.trim()) errors.age = "Age is required.";
  if (!data.height.trim()) errors.height = "Height is required.";
  if (!data.weight.trim()) errors.weight = "Weight is required.";

  if (!image) {
    // Require image upload before submit
    // errors.image = "Profile image is required.";
  } else {
    if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
      errors.image = "Only JPG or PNG files are allowed.";
    }
    const sizeMb = image.size / 1024 / 1024;
    if (sizeMb > MAX_IMAGE_MB) {
      errors.image = `Maximum file size is ${MAX_IMAGE_MB}MB.`;
    }
  }

  if (!captchaToken) errors.recaptcha = "Please verify the reCAPTCHA.";

  return errors;
};

type FormInputProps = {
  label: string;
  name: keyof UserProfileFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
};

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  error,
  icon,
  maxLength = 100,
  multiline = false,
  rows = 1,
  disabled = false,
}) => {
  return (
    <label className="block w-full">
      <span className="text-left block text-sm text-[#C7B897] mb-2">
        {label} {required ? "*" : ""}
      </span>
      <CustomTextField
        name={name}
        placeholder={placeholder ?? label}
        value={value}
        onChange={onChange}
        type={type}
        rows={rows}
        multiline={multiline}
        maxLength={maxLength}
        icon={icon}
        disabled={disabled}
        error={!!error}
        helperText={error}
      />
    </label>
  );
};

type SelectOption = {
  value: string;
  label: string;
};

type SelectInputProps = {
  label: string;
  name: keyof UserProfileFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  options: SelectOption[];
  required?: boolean;
  error?: string;
};

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required,
  error,
}) => {
  return (
    <label className="block w-full">
      <span className="text-left block text-sm text-[#C7B897] mb-2">
        {label} {required ? "*" : ""}
      </span>
      <CustomSelectField
        name={name}
        placeholder={`Select ${label}`}
        value={value}
        onChange={onChange}
        options={options}
        error={!!error}
        helperText={error}
      />
    </label>
  );
};

type ImageUploadProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, error }) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!value) {
      setPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(value);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  return (
    <div className="w-full mt-2"> 
      <label className="flex items-center justify-center relative w-full cursor-pointer">
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <div
          className={`w-40 h-40 rounded-full border-2 border-dashed ${
            error ? "border-red-400" : "border-[#FDCC00]/30"
          } bg-white/5 backdrop-blur-md overflow-hidden`}
        >
          <div className=" flex items-center justify-center">
            {preview ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="text-center py-10">
                <Upload className="w-10 h-10 text-[#FDCC00] mx-auto mb-2" />
                <p className="text-white font-medium">Upload your image</p> 
              </div>
            )}
          </div>
        </div>
      </label>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </div>
  );
};

type RecaptchaFieldProps = {
  value: string | null;
  onChange: (token: string | null) => void;
  error?: string;
};

const RecaptchaField: React.FC<RecaptchaFieldProps> = ({ value, onChange, error }) => {
  return (
    <div className="w-full">
      <div className="flex justify-center">
        <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY as string} onChange={onChange} />
      </div>
      {value ? null : error ? <p className="mt-2 text-sm text-red-400 text-center">{error}</p> : null}
    </div>
  );
};

const UserForm = () => {
  const [formData, setFormData] = useState<UserProfileFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<UserProfileFormErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState<SnackbarType>("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate age from birth date (YYYY-MM-DD)
  const calculateAge = (birthDay: string) => {
    if (!birthDay) return "";
    const today = new Date();
    const birth = new Date(birthDay);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age >= 0 ? String(age) : "";
  };

  // Build region options from PSGC regions list
  const regionOptions: SelectOption[] = useMemo(
    () =>
      regions.map((r: any) => ({
        value: r.code,
        label: r.name,
      })),
    []
  );

  // Filter provinces by selected region
  const provinceOptions: SelectOption[] = useMemo(
    () =>
      provinces
        .filter((p: any) => p.regionCode === formData.region)
        .map((p: any) => ({ value: p.code, label: p.name })),
    [formData.region]
  );

  // Filter cities/municipalities by selected province
  const cityOptions: SelectOption[] = useMemo(
    () =>
      cities
        .filter((c: any) => c.provinceCode === formData.province)
        .map((c: any) => ({ value: c.code, label: c.name })),
    [formData.province]
  );

  // Filter barangays by selected city/municipality
  const barangayOptions: SelectOption[] = useMemo(
    () =>
      barangays
        .filter((b: any) => b.municipalityCode === formData.city)
        .map((b: any) => ({ value: b.code, label: b.name })),
    [formData.city]
  );

  // Handle input/select change with cascading resets
  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Enforce phone number: digits only, max 11, must start with 09
    if (name === "contact_number") {
      let digits = value.replace(/\D/g, "").slice(0, 11);
      if (digits.length >= 1 && digits[0] !== "0") digits = "0" + digits.slice(1);
      if (digits.length >= 2 && digits[1] !== "9") digits = digits[0] + "9" + digits.slice(2);
      setFormData((prev) => ({ ...prev, contact_number: digits }));
      setFormErrors((prev) => ({ ...prev, contact_number: undefined }));
      return;
    }

    // Auto-calculate age when birth_day changes
    if (name === "birth_day") {
      setFormData((prev) => ({
        ...prev,
        birth_day: value,
        age: calculateAge(value),
      }));
      setFormErrors((prev) => ({ ...prev, birth_day: undefined, age: undefined }));
      return;
    }

    // Clear dependent selects on location change
    if (name === "region") {
      setFormData((prev) => ({
        ...prev,
        region: value,
        province: "",
        city: "",
        barangay: "",
      }));
      setFormErrors((prev) => ({ ...prev, region: undefined, province: undefined, city: undefined, barangay: undefined }));
      return;
    }

    if (name === "province") {
      setFormData((prev) => ({
        ...prev,
        province: value,
        city: "",
        barangay: "",
      }));
      setFormErrors((prev) => ({ ...prev, province: undefined, city: undefined, barangay: undefined }));
      return;
    }

    if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        city: value,
        barangay: "",
      }));
      setFormErrors((prev) => ({ ...prev, city: undefined, barangay: undefined }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Handle image change with local validation
  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (!file) {
      setFormErrors((prev) => ({ ...prev, image: "Profile image is required." }));
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFormErrors((prev) => ({ ...prev, image: "Only JPG or PNG files are allowed." }));
      return;
    }
    const sizeMb = file.size / 1024 / 1024;
    if (sizeMb > MAX_IMAGE_MB) {
      setFormErrors((prev) => ({ ...prev, image: `Maximum file size is ${MAX_IMAGE_MB}MB.` }));
      return;
    }
    setFormErrors((prev) => ({ ...prev, image: undefined }));
  };

  // Submit handler: validate, build FormData, and log for debugging
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateUserForm(formData, imageFile, captchaToken);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Log missing/invalid fields for quick diagnosis
      console.log("UserForm validation errors (blank/invalid fields):", errors);
      setSnackType("error");
      setSnackMessage("Please correct the highlighted fields.");
      setSnackOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
      // Build FormData payload
      const submission = new FormData();
      (Object.keys(formData) as Array<keyof UserProfileFormData>).forEach((key) => {
        submission.append(key, formData[key]);
      });
      if (imageFile) submission.append("image", imageFile);

      // Log payload content for easy debugging
      const debugEntries: Record<string, string> = {};
      submission.forEach((value, key) => {
        debugEntries[key] = value instanceof File ? value.name : String(value);
      });
      console.log("UserForm submission", debugEntries);

      await new Promise((resolve) => setTimeout(resolve, 700));
      setSnackType("success");
      setSnackMessage("Form submitted successfully.");
      setSnackOpen(true);
      setFormData(initialFormData);
      setImageFile(null);
      setCaptchaToken(null);
    } catch (error) {
      setSnackType("error");
      setSnackMessage("Please correct the highlighted fields.");
      setSnackOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/live-background/download.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-[#000000]/55" />
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.85) 5%,
                rgba(0,0,0,0.55) 25%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.08) 60%,
                rgba(0,0,0,0) 100%
              ),
              linear-gradient(
                to bottom,
                rgba(253,204,0,0.35) 0%,
                rgba(253,204,0,0.25) 15%,
                rgba(253,204,0,0.15) 35%,
                rgba(253,204,0,0.08) 55%,
                rgba(253,204,0,0.03) 75%,
                rgba(253,204,0,0) 100%
              ),
              linear-gradient(
                to top,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.85) 5%,
                rgba(0,0,0,0.55) 25%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.08) 78%,
                rgba(0,0,0,0) 100%
              )
            `,
          }}
        />
      </div>

      <div className="relative z-10">
        <SnackbarTechnician
          open={snackOpen}
          type={snackType}
          message={snackMessage}
          onClose={() => setSnackOpen(false)}
        />

        <section className="pt-20 sm:pt-10 md:pt-10 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="bee-title-lg text-[#FDCC00] leading-[0.95] tracking-wide select-none px-4 mb-6 text-center drop-shadow-md break-words">
                USER PROFILE REGISTRATION
              </h1>
              <p className="bee-body-lg text-[#C7B897] max-w-3xl mx-auto px-2 sm:px-0">
                Provide your personal details so we can create a secure and verified user profile.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="flex justify-center w-full pb-12 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="px-4 sm:px-6 w-full max-w-5xl"
          >
            <form onSubmit={handleSubmit} className="beesee-card-content p-6 sm:p-8 md:p-10 rounded-2xl border border-[#FDCC00]/20 bg-white/5 backdrop-blur-xl">
              <div className="space-y-2">
                <h3 className="text-left">Personal Information</h3>
                <hr />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 space-y-2">
                <div className="lg:col-span-1 flex items-center justify-center">
                  <ImageUpload 
                    value={imageFile} 
                    onChange={handleImageChange} 
                    error={formErrors.image} 
                  />
                </div>  

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChangeInput}
                    required
                    placeholder="Enter first name"
                    icon={<User2 className="w-4 h-4" />}
                    error={formErrors.first_name} 
                  />

                  <FormInput
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChangeInput}
                    required
                    placeholder="Enter last name"
                    icon={<User2 className="w-4 h-4" />}
                    error={formErrors.last_name} 
                  />

                  <FormInput
                    label="Middle Name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChangeInput}
                    required
                    placeholder="Enter middle name"
                    icon={<User2 className="w-4 h-4" />}
                    error={formErrors.middle_name} 
                  />

                  {/* Optional fields */}
                  <FormInput
                    label="Suffix"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleChangeInput}
                    placeholder="e.g., Jr., III" 
                  />

                  <FormInput
                    label="Nickname"
                    name="nick_name"
                    value={formData.nick_name}
                    onChange={handleChangeInput}
                    placeholder="Preferred name" 
                  /> 

                  {/* Contact Number */}
                  <FormInput
                    label="Contact Number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChangeInput}
                    required
                    placeholder="09XXXXXXXXX"
                    icon={<Phone className="w-4 h-4" />}
                    maxLength={11}
                    error={formErrors.contact_number} 
                  />
                </div>
              </div>

              {/* Demographics + personal details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <SelectInput
                    label="Sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChangeInput}
                    options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
                    required
                    error={formErrors.sex}
                  />
                  <SelectInput
                    label="Marital Status"
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChangeInput}
                    options={[
                      { value: "Single", label: "Single" },
                      { value: "Married", label: "Married" },
                      { value: "Widowed", label: "Widowed" },
                      { value: "Divorced", label: "Divorced" },
                      { value: "Seperated", label: "Seperated" },
                    ]}
                    required
                    error={formErrors.marital_status}
                  />
                  <SelectInput
                    label="Citizenship"
                    name="citizen_ship"
                    value={formData.citizen_ship}
                    onChange={handleChangeInput}
                    options={[
                      { value: "Filipino", label: "Filipino" },
                      { value: "Dual Citizen", label: "Dual Citizen" },
                      { value: "Natural Filipino", label: "Natural Filipino" },
                      { value: "Foreigner / Foreign National", label: "Foreigner / Foreign National" },
                    ]}
                    required
                    error={formErrors.citizen_ship}
                  />
                  <FormInput
                    label="Religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChangeInput}
                    required
                    placeholder="Religion"
                    error={formErrors.religion}
                  />
                  <FormInput
                    label="Place of Birth"
                    name="place_of_birth"
                    value={formData.place_of_birth}
                    onChange={handleChangeInput}
                    required
                    placeholder="Place of birth"
                    error={formErrors.place_of_birth}
                  />
                  <FormInput
                    label="Date of Birth"
                    name="birth_day"
                    value={formData.birth_day}
                    onChange={handleChangeInput}
                    required
                    type="date" 
                    error={formErrors.birth_day}
                  />
                  <FormInput
                    label="Age"
                    name="age"
                    value={formData.age}
                    required
                    type="number"
                    placeholder="Age"
                    disabled
                    error={formErrors.age}
                  />
                  <FormInput
                    label="Height (cm)"
                    name="height"
                    value={formData.height}
                    onChange={handleChangeInput}
                    required
                    type="number"
                    placeholder="Height in cm"
                    icon={<Ruler className="w-4 h-4" />}
                    error={formErrors.height}
                  />
                  <FormInput
                    label="Weight (kg)"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChangeInput}
                    required
                    type="number"
                    placeholder="Weight in kg"
                    icon={<Weight className="w-4 h-4" />}
                    error={formErrors.weight}
                  /> 
              </div>

              {/* Address section (PSGC-driven selects) */}
              <div className="space-y-1 mt-5">
                <h3 className="text-left">Address</h3>
                <hr />
              </div>

              {/* PSGC selects with cascading clears */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
                <SelectInput
                  label="Region"
                  name="region"
                  value={formData.region}
                  onChange={handleChangeInput}
                  options={regionOptions}
                  required
                  error={formErrors.region}
                />
                <SelectInput
                  label="Province"
                  name="province"
                  value={formData.province}
                  onChange={handleChangeInput}
                  options={provinceOptions}
                  required
                  error={formErrors.province}
                />
                <SelectInput
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChangeInput}
                  options={cityOptions}
                  required
                  error={formErrors.city}
                />
                <SelectInput
                  label="Barangay"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChangeInput}
                  options={barangayOptions}
                  required
                  error={formErrors.barangay}
                />

                <FormInput
                  label="Street"
                  name="street"
                  value={formData.street}
                  onChange={handleChangeInput}
                  placeholder="Street"
                />

                <FormInput
                  label="House No."
                  name="house_no"
                  value={formData.house_no}
                  onChange={handleChangeInput}
                  placeholder="House number"
                />
              </div>

              
              <div className="space-y-6 mt-5">
                <RecaptchaField 
                  value={captchaToken} 
                  onChange={setCaptchaToken} 
                  error={formErrors.recaptcha} 
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-md py-3 rounded-xl font-semibold bg-gradient-to-r from-[#FDCC00] to-[#FCD000] text-black hover:shadow-lg hover:shadow-[#FDCC00]/30 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
