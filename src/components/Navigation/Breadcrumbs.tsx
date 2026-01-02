import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onClick }) => {
  return (
    <div
      role="presentation"
      onClick={onClick}
      style={{ overflowX: "auto" }} // allows horizontal scroll if text too long on mobile
    >
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          "& .MuiTypography-root, & .MuiLink-root": {
            fontSize: {
              xs: "0.8rem",  // 👈 small text for mobile
              sm: "0.9rem",
              md: "1rem",    // 👈 default desktop
            },
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
          },
        }}
      >
        {items.map((item, index) =>
          item.isActive ? (
            <Typography
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              {item.icon && (
                <span style={{ marginRight: 4, display: "flex" }}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              underline="hover"
              color="inherit"
              href={item.href || "#"}
              sx={{
                display: "flex",
                alignItems: "center",
                "&:hover": { color: "#000000" },
              }}
            >
              {item.icon && (
                <span style={{ marginRight: 4, display: "flex" }}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </Link>
          )
        )}
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;
