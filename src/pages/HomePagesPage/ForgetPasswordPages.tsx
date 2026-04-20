import React, { useState, useRef } from "react"
import CustomTextField from "../../components/Fields/CustomTextField"
import {  motion } from 'framer-motion' 
import { Email } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import Snackbar from '../../components/feedback/SnackbarTechnician'
import { Lock } from "lucide-react"; ;
import { 
  changePassword,
  forgetPassword
} from '../../services/Technician/userServices'
import { useMutation } from "@tanstack/react-query"
import { userAuth } from '../../hooks/userAuth' 

interface FormErrorEmail {
  email?: string
}

interface password {
  new_password: string,
  confirm_password: string,
}

interface FormErrorPassword {
  new_password?: string,
  confirm_password?: string,
}

const ForgetPasswordPages = () => {
  const navigate = useNavigate();

  const {
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
    snackBarMessage,
    snackBarOpen,
    snackBarType
  } = userAuth()
  
  const [formErrorEmail, setFormErrorEmail] = useState<FormErrorEmail>({})
  const [formErrorPassword, setFormErrorPassword] = useState<FormErrorPassword>({})

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
 
  const [showVerifyOtp, setShowVerifyOtp] = useState<boolean>(false)
  const [otpValue, setOtpValue] = useState<string>("")
  const [showSetupPassword, setShowSetupPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false);


  const [formPassword, setFormPassword] = useState<password>({
    new_password: "",
    confirm_password: ''
  })

  const [formData, setFormData] = useState({
    email: ""
  });

  const {
    mutateAsync: ForgetPassword, 
  } = useMutation({
    mutationFn: forgetPassword
  });

  const {
    mutateAsync: ChangePassword,
  } = useMutation({
    mutationFn: changePassword
  })

  const handleInputPassword = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value} = e.target;

    // update form data
    setFormPassword((prev) => ({
      ...prev,
      [name] : value
    }));

    // remove the specific error for this field
    setFormErrorPassword((prev) => ({
      ...prev,
      [name] : undefined
    }));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // update form data
    setFormData((prev) => ({
      ...prev,
      [name] : value
    }));

    // remove the specific error for this field
    setFormErrorEmail((prev) => ({
      ...prev,
      [name] : undefined
    }))
  }

  const validateForm = (): FormErrorEmail => {
    const errors : FormErrorEmail = {}
    if (!formData.email.trim()) errors.email = "Email is required."
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format."

    return errors
  }

  const validateFormPassword = (): FormErrorPassword => {
    const errors : FormErrorPassword = {}
    if (!formPassword.new_password.trim()) {
      errors.new_password = "New password is required."
    } else if (formPassword.new_password.length < 8) {
        errors.new_password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(formPassword.new_password)) {
        errors.new_password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(formPassword.new_password)) {
        errors.new_password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(formPassword.new_password)) {
        errors.new_password = 'Password must contain at least one number.';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formPassword.new_password)) {
        errors.new_password = 'Password must contain at least one special character.';
    }

    if (formPassword.confirm_password !== formPassword.new_password)
      errors.confirm_password = 'Passwords do not match.';
    return errors;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const errors = validateForm();
      setFormErrorEmail(errors);
      setLoading(true)

      if (Object.keys(errors).length === 0) {
        const generatedOtp = handleGeneratedOtp()

        const form = new FormData();
        form.append("email", formData.email);
        form.append("otp", generatedOtp)

        const response = await ForgetPassword(form);

        if (response?.success) {
          setSnackBarMessage("Your Authentication code has been sent successfully!")
          setSnackBarType("success")
          setShowVerifyOtp(true)
          setSnackBarOpen(true)
        }
      }
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || "Something went wrong while updating serial number.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");
      
      setSnackBarMessage(cleanMessage)
      setSnackBarType("error")
      setSnackBarOpen(true)
    } finally{
      setLoading(false)
    }
  }

  const handleSubmitPassword = async(e: React.FormEvent) => {
    e.preventDefault();
    try {
      const errors = validateFormPassword();
      setFormErrorPassword(errors)      
      setLoading(true)

      if (Object.keys(errors).length === 0) {
        const form = new FormData();
        form.append("email", formData.email);
        form.append("password",formPassword.new_password)

        const response = await ChangePassword(form)

        if (response?.success) {
          setSnackBarMessage("Your password has been updated")
          setSnackBarType("success")
          setSnackBarOpen(true)

          formData.email = ""
          formPassword.confirm_password = ""
          formPassword.new_password = ""

          navigate("/sign-in")

        }
      } 
    } catch (error) {
      setSnackBarMessage("An error occurred. Please try again.")
      setSnackBarType("error") 
      setSnackBarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2 // delay each child by 0.2
      }
    }
  }

  // Variants for children
  const itemVariants = {
    hidden: {
      opacity: 0, y: 30
    },
    visible: {
      opacity: 1, y: 0,
      transition: {
        duration: 0.4
      }
    }
  }

    /* VERIFY OTP */
  const handleChange = (value:string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // only allow digits
    const newOtp = [...otp]; 
    newOtp[index] = value;
    setOtp(newOtp)

    // move to the next input automatically
    if (value && index < 5) inputsRef.current[index + 1]?.focus();

    if (index === 5) {
      const enteredOtp = newOtp.join("") 
      if (enteredOtp === otpValue) {
        setShowVerifyOtp(false)
        setShowSetupPassword(true)
      } else {
        setSnackBarMessage("Invalid OTP. Please try again.")
        setSnackBarType("error")
        setSnackBarOpen(true)
      }
    }
    console.log("otp", otp)
    console.log("value", value, index)
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1 ]?.focus()
    }
  }

  const handleGeneratedOtp = (): string => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setOtpValue(generatedOtp)
    return generatedOtp
  }

  const handleVerify = () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setSnackBarMessage("Please enter the complete 6-digit verification code")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    } else {
      // checking of logic verify code
      setShowVerifyOtp(false)
      setShowSetupPassword(true);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <Snackbar 
        open={snackBarOpen}
        type={snackBarType}
        message={snackBarMessage}
        onClose={() => setSnackBarOpen(false)}
      />

      {showVerifyOtp ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-600 mb-5"
          >
            Verify your Authentication
          </motion.h2>

          <motion.p className="text-left text-gray-600 mb-6 text-sm md:text-[16px]">
            Please enter the 6-digit code we sent to your email.
          </motion.p>

          <motion.div
            variants={itemVariants} 
            className="flex justify-center gap-5 mb-6"
          >
            {otp.map((value, index) => (
              <input 
                type="text" 
                key={index}
                maxLength={1}
                value={value}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e => handleChange(e.target.value, index))}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center border border-gray-300 rounded-md 
                focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 
                outline-none transition text-black"
              />
            ))}
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-center text-gray-600 text-sm md:text-[16px] mb-4"
          >
              A one-time password (OTP) has been sent to your email.
          </motion.p>

          <motion.button 
            variants={itemVariants}
            onClick={handleVerify} 
            className="w-full text-white mt-5 mb-5 py-3 px-4 rounded-md font-semibold beesee-button  text-sm sm:text-base"
          >
            Verify
          </motion.button>

          <motion.button
            onClick={() => navigate("/sign-in")}
            variants={itemVariants}
            className="py-3 px-4 border border-gray-300 rounded-md w-full font-semibold bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </motion.button>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-2 mt-6 text-sm md:text-[16px] text-gray-600"
          >
            Didn't recieve the email? {" "}
            <br />
            <div className="flex gap-1 text-sm md:text-[16px]">
              <p className="text-gray-600 ">Check your spam or</p>
              <button
                onClick={handleSubmit} 
                className="text-blue-500 hover:underline"
              >
                resend OTP
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : showSetupPassword ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-[550px] p-8"
        >
          <motion.h2
            variants={itemVariants}
            className={`text-center text-3xl font-bold text-gray-800 mb-3`}
          >
            Setup Your Password
          </motion.h2>

           <motion.p
              variants={itemVariants}
              className="text-center text-sm md:text-[16px] text-gray-600 mb-6"
            >
              Create a strong password for your account access.
           </motion.p>

          <motion.form
            className="flex flex-col gap-4"
            variants={containerVariants}
          >
            <motion.div
              variants={itemVariants}
            >
              <CustomTextField 
                name="new_password"
                placeholder="New Password"
                value={formPassword.new_password}
                multiline={false}
                rows={1}
                type="password"
                onChange={handleInputPassword}
                maxLength={100}
                icon={<Lock className="w-4 h-4"  />}
                error={!!formErrorPassword.new_password}
                helperText={formErrorPassword.new_password}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
            >
              <CustomTextField 
                name="confirm_password"
                placeholder="Confirm password"
                value={formPassword.confirm_password}
                multiline={false}
                rows={1}
                type="password"
                onChange={handleInputPassword}
                maxLength={100}
                icon={<Lock className="w-4 h-4" />}
                error={!!formErrorPassword.confirm_password}
                helperText={formErrorPassword.confirm_password}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-2 mt-5"
            >
              <button
                onClick={handleSubmitPassword}
                className={`w-full py-3 px-4 rounded-md font-semibold text-white 
                  ${ loading 
                    ? "bg-yellow-300 cursor-not-allowed" 
                    : "beesee-button w-full py-3 text-sm sm:text-base"}`}
              >
                Save Password
              </button>

              <motion.button
                onClick={() => navigate("/sign-in")}
                variants={itemVariants}
                className="mt-3 w-full py-3 px-4 border border-gray-300 rounded-md font-semibold bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-[550px] p-8"
        >
          <motion.h2
            variants={itemVariants }
            className="text-3xl font-extrabold mb-10 text-center text-gray-800"
          >
            Reset your password
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-center text-gray-500 mb-6 text-lg"
          >
            Enter your email address below and we’ll send you instructions to
            reset your password.
          </motion.p>

          <motion.form
            variants={containerVariants}
          >
            <motion.div>
              <CustomTextField 
                name="email"
                placeholder="Email"
                value={formData.email}
                multiline={false}
                rows={1}
                type="email"
                onChange={handleInputChange}
                maxLength={100}
                icon={<Email className="w-4 h-4" />}
                error={!!formErrorEmail.email}
                helperText={formErrorEmail.email}
              />
            </motion.div>

            <motion.button
              type='submit'
              disabled={loading}
              onClick={handleSubmit}
              variants={itemVariants}
              className={`mt-10 w-full py-3 px-10 text-white font-semibold rounded-md transition
                ${ loading 
                  ? "bg-yellow-300 cursor-not-allowed"
                  : "beesee-button w-full py-3 text-sm sm:text-base"
                }`}
            >
              Verify
            </motion.button>

            <motion.button
              onClick={() => navigate("/sign-in")}
              variants={itemVariants}
              className="mt-5 w-full py-4 px-5 border border-gray-300 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </motion.button>
          </motion.form>
        </motion.div>
      ) }
    </div>
  )
}

export default ForgetPasswordPages
