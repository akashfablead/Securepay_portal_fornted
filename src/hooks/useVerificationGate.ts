import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "@/services/authService";

interface VerificationGateState {
  loading: boolean;
  canTransact: boolean;
  kycStatus: string;
  bankStatus: string;
  bank?: Record<string, unknown> | null;
  kyc?: Record<string, unknown> | null;
  error: string | null;
}

export const useVerificationGate = () => {
  const [state, setState] = useState<VerificationGateState>({
    loading: true,
    canTransact: false,
    kycStatus: "pending",
    bankStatus: "pending",
    bank: null,
    kyc: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await getDashboard();
      const kycStatus = data?.kyc?.status || "pending";
      const bankStatus = data?.bank?.verificationStatus || "pending";
      setState({
        loading: false,
        error: null,
        // KYC is now optional - only bank verification is required for transactions
        canTransact: bankStatus === "verified",
        kycStatus,
        bankStatus,
        bank: data?.bank || null,
        kyc: data?.kyc || null,
      });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        "Unable to verify account status";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
        canTransact: false,
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
};