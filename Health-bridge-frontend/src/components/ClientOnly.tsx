"use client";

import { useEffect, useState, ReactNode, useRef } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [mounted, setMounted] = useState(false);
  const isMounted = useRef(true);
  const hasChecked = useRef(false);

  // ✅ Fix: Use setTimeout to break synchronous setState
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const timer = setTimeout(() => {
      if (isMounted.current) {
        setMounted(true);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      isMounted.current = false;
    };
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;