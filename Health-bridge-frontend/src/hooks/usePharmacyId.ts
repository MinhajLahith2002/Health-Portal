"use client";

import { useEffect, useState } from "react";
import { getAllActivePharmacies } from "@/services/pharmacyService";

const CACHE_KEY = "current_pharmacy_id";

export function usePharmacyId() {
    const [pharmacyId, setPharmacyId] = useState<string | null>(() =>
        typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null
    );
    const [loading, setLoading] = useState(!pharmacyId);

    useEffect(() => {
        if (pharmacyId) return;

        let cancelled = false;
        getAllActivePharmacies()
            .then((list) => {
                const pharmacies = list as { id: string }[];
                if (!cancelled && pharmacies.length > 0) {
                    const id = pharmacies[0].id;
                    localStorage.setItem(CACHE_KEY, id);
                    setPharmacyId(id);
                }
            })
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [pharmacyId]);

    return { pharmacyId, loading };
}