import { useEffect, useState } from "react";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = matchMedia("(hover: none)").matches;
    setIsMobile(check);
  }, []);

  return isMobile;
}
