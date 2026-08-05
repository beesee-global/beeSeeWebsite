import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertColor } from "@mui/material/Alert";
import CustomTextField from "../Fields/CustomTextField";
import Snackbar from "../feedback/SnackbarTechnician";
import { useState } from "react";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

interface AdminLoginLayoutProps {
  title: string;
  formData: LoginFormValues;
  formError: LoginFormErrors;
  isPending: boolean;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: AlertColor;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCloseSnackbar: () => void;
  footer?: ReactNode;
}

const AdminLoginLayout: React.FC<AdminLoginLayoutProps> = ({
  title,
  formData,
  formError,
  isPending,
  snackbarOpen,
  snackbarMessage,
  snackbarSeverity,
  onChange,
  onSubmit,
  onCloseSnackbar,
  footer,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        type={snackbarSeverity}
        onClose={onCloseSnackbar}
      />

      <div className="flex w-full max-w-md items-center justify-center p-4 sm:p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex w-full flex-col"
        >
          <motion.div variants={itemVariants} className="mb-6 flex justify-center sm:mb-8">
            <img src="/beeSeeGold.png" alt="BeeSee Logo" className="h-20 w-auto sm:h-24" />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="mb-3 text-center text-4xl text-[var(--beesee-gold)] sm:mb-6 sm:text-5xl"
          >
            {title}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mb-4 text-center text-sm text-gray-600 sm:mb-6 sm:text-base"
          >
            Welcome back! Please enter your details
          </motion.p>

          <motion.form onSubmit={onSubmit} className="space-y-5 sm:space-y-7">
            <motion.div variants={itemVariants}>
              <CustomTextField
                name="email"
                placeholder="Email"
                value={formData.email}
                multiline={false}
                rows={1}
                type="email"
                autoComplete="off"
                onChange={onChange}
                maxLength={100}
                icon={<Mail className="h-4 w-4" />}
                error={Boolean(formError.email)}
                helperText={formError.email}
                disabled={isPending}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <CustomTextField
                name="password"
                placeholder="Password"
                value={formData.password}
                multiline={false}
                rows={1}
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                onChange={onChange}
                maxLength={100}
                icon={
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    {showPassword ? "Hide" : <Lock className="h-4 w-4" />}
                  </button>
                }
                error={Boolean(formError.password)}
                helperText={formError.password}
                disabled={isPending}
              />
            </motion.div>

            <motion.p
              variants={itemVariants}
              onClick={() => navigate("/forget-password")}
              className="cursor-pointer text-sm text-blue-500 hover:underline sm:text-base"
            >
              Forget Password
            </motion.p>

            <motion.button
              variants={itemVariants}
              className="beesee-button w-full py-3 text-sm sm:text-base"
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </motion.form>

          {footer}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginLayout;
