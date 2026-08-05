import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertColor } from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { userAuth } from "../../hooks/userAuth";
import { loginWebsiteConfigurationUser } from "../../services/WebsiteConfiguration/websiteConfigurationServices";
import AdminLoginLayout from "../../components/auth/AdminLoginLayout";

interface LoginForm {
  email: string;
  password: string;
}

interface FormError {
  email?: string;
  password?: string;
}

const DESTINATION = "/beesee/website-configuration/dashboard";

const WebsiteConfigurationLogin = () => {
  const navigate = useNavigate();
  const { login, token, userInfo, activateSession } = userAuth();
  const [checked, setChecked] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });
  const [formError, setFormError] = useState<FormError>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("error");

  useEffect(() => {
    activateSession('websiteConfiguration');
  }, [activateSession]);

  const { mutateAsync: loginUser, isPending } = useMutation({
    mutationFn: loginWebsiteConfigurationUser,
  });

  useEffect(() => {
    if (token !== undefined) setChecked(true);
  }, [token]);

  useEffect(() => {
    if (!token || !userInfo) return;
    const hasWebsiteConfigurationAccess =
      userInfo.url_permission === "website_configuration" ||
      userInfo.url_permission === "website_configuration_url" ||
      userInfo.url?.startsWith("/beesee/website-configuration");
    if (hasWebsiteConfigurationAccess) navigate(DESTINATION, { replace: true });
  }, [token, userInfo, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFormError((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: FormError = {};
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.password.trim()) errors.password = "Password is required";
    setFormError(errors);
    if (Object.keys(errors).length) return;

    try {
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });
      const payload = response?.data ?? response;
      const apiUser = payload?.userInfo ?? payload?.user;

      if (!payload?.token || !apiUser) throw new Error("Incomplete login response");

      login({
        token: payload.token,
        userInfo: {
          id: apiUser.id,
          full_name: apiUser.full_name,
          email: apiUser.email,
          role: apiUser.role,
          positions_id: apiUser.positions_id,
          permissions: apiUser.permissions ?? [],
          status: apiUser.status,
          url_permission: "website_configuration",
          url: DESTINATION,
        },
      }, "websiteConfiguration");
      navigate(DESTINATION, { replace: true });
    } catch (error: any) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 400
          ? "Invalid email or password, please try again."
          : "Unable to sign in right now. Please try again later.",
      );
      setSnackbarOpen(true);
    }
  };

  if (!checked) return <div className="flex min-h-screen items-center justify-center text-gray-500" />;

  return (
    <AdminLoginLayout
      title="Website Configuration Login"
      formData={formData}
      formError={formError}
      isPending={isPending}
      snackbarOpen={snackbarOpen}
      snackbarMessage={snackbarMessage}
      snackbarSeverity={snackbarSeverity}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCloseSnackbar={() => setSnackbarOpen(false)}
      // footer={(
      //   <button
      //     type="button"
      //     onClick={() => navigate("/ecom/sign-in")}
      //     className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-900 hover:underline"
      //   >
      //     Ecommerce administrator login
      //   </button>
      // )}
    />
  );
};

export default WebsiteConfigurationLogin;
