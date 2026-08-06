import { useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { AlertColor } from "@mui/material/Alert";
import { Eye, EyeOff, Home } from "lucide-react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician";

const storageKey = "beesee-homepage-navigation";
const controls = [
  { id: "about", label: "About", description: "Company introduction link" },
  { id: "products", label: "Products", description: "Product catalogue link" },
  { id: "services", label: "Services", description: "Solutions and services link" },
  { id: "inquiries", label: "Inquiries", description: "Customer inquiries link" },
  { id: "faqs", label: "FAQs", description: "Frequently asked questions link" },
  { id: "support", label: "Support", description: "Customer support link" },
];

const sectionControls = [
  { id: "homeHero", label: "Hero showcase", description: "Opening homepage product showcase" },
  { id: "homeExplore", label: "Explore products", description: "Featured products and supporting homepage content" },
];

const allControls = [...controls, ...sectionControls];

const readSettings = () => {
  try {
    return { ...Object.fromEntries(allControls.map(({ id }) => [id, true])), ...JSON.parse(localStorage.getItem(storageKey) || "{}") } as Record<string, boolean>;
  } catch {
    return Object.fromEntries(allControls.map(({ id }) => [id, true])) as Record<string, boolean>;
  }
};

const HomepageControls = () => {
  const [settings, setSettings] = useState<Record<string, boolean>>(readSettings);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<AlertColor>("success");

  const updateSetting = (control: { id: string; label: string }, enabled: boolean) => {
    setSettings((current) => ({ ...current, [control.id]: enabled }));
    setSnackbarType("success");
    setSnackbarMessage(`${control.label} ${enabled ? "enabled" : "disabled"}.`);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    window.dispatchEvent(new Event("beesee-homepage-navigation-change"));
  }, [settings]);

  return (
    <div className="bo-main-content p-4 md:p-7">
      <SnackbarTechnician
        open={snackbarOpen}
        type={snackbarType}
        message={snackbarMessage}
        onClose={() => setSnackbarOpen(false)}
      />
      <Breadcrumb items={[{ label: "Homepage", isActive: true, icon: <Home className="w-4 h-4" /> }]} />
      <div className="mt-6 max-w-4xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-7">
          <p className="text-xs font-bold tracking-[.16em] text-[#A88100]">HOMEPAGE</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">Navigation visibility</h1>
          <p className="mt-2 text-sm text-gray-600">Choose which links visitors can see in the public website navigation.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {controls.map((control) => {
            const enabled = settings[control.id] !== false;
            return (
              <div key={control.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${enabled ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{enabled ? <Eye size={19} /> : <EyeOff size={19} />}</span>
                  <div><h2 className="font-semibold text-gray-900">{control.label}</h2><p className="text-sm text-gray-500">{control.description}</p></div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2 pl-3">
                  <span className={`text-xs font-bold ${enabled ? "text-emerald-600" : "text-red-600"}`}>{enabled ? "Enabled" : "Disabled"}</span>
                  <Switch checked={enabled} onChange={(_, checked) => updateSetting(control, checked)} inputProps={{ "aria-label": `Toggle ${control.label} navigation link` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 border-t border-gray-100 pt-7">
          <p className="text-xs font-bold tracking-[.16em] text-[#A88100]">HOMEPAGE CONTENT</p>
          <p className="mt-1 text-sm text-gray-600">Control the main public sections without removing their content from the code.</p>
          <div className="mt-3 divide-y divide-gray-100">
            {sectionControls.map((control) => {
              const enabled = settings[control.id] !== false;
              return (
                <div key={control.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${enabled ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{enabled ? <Eye size={19} /> : <EyeOff size={19} />}</span>
                    <div><h2 className="font-semibold text-gray-900">{control.label}</h2><p className="text-sm text-gray-500">{control.description}</p></div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2 pl-3">
                    <span className={`text-xs font-bold ${enabled ? "text-emerald-600" : "text-red-600"}`}>{enabled ? "Enabled" : "Disabled"}</span>
                    <Switch checked={enabled} onChange={(_, checked) => updateSetting(control, checked)} inputProps={{ "aria-label": `Toggle ${control.label}` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageControls;
