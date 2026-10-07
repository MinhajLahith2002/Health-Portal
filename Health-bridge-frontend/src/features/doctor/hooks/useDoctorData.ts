"use client";

import { useCallback, useEffect, useState } from "react";

export function useDoctorData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await loader()); }
    catch { setError("We could not load this information. Please try again."); }
    finally { setLoading(false); }
  }, [loader]);

  useEffect(() => {
    let active = true;
    loader()
      .then((result) => { if (active) setData(result); })
      .catch(() => { if (active) setError("We could not load this information. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loader]);
  return { data, setData, loading, error, refresh };
}
