"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/context/LanguageContext";

// ---- Types ----
type NotificationPrefs = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

type PrivacyPrefs = {
  profileVisibility: "public" | "doctors_only" | "private";
  shareDataForResearch: boolean;
};

// Small reusable toggle switch
function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AccountSettingsPage() {
  const { t } = useLanguage();

  // Account status
  const [accountStatus, setAccountStatus] = useState("Active");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [savingTwoFactor, setSavingTwoFactor] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    sms: false,
    push: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Privacy
  const [privacy, setPrivacy] = useState<PrivacyPrefs>({
    profileVisibility: "doctors_only",
    shareDataForResearch: false,
  });
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    api
      .get<any>("/users/profile")
      .then((data) => {
        setAccountStatus(data.accountStatus || "Active");
        setCreatedAt(data.createdAt || null);
        setTwoFactorEnabled(!!data.twoFactorEnabled);
        setNotifications({
          email: data.notificationPrefs?.email ?? true,
          sms: data.notificationPrefs?.sms ?? false,
          push: data.notificationPrefs?.push ?? true,
        });
        setPrivacy({
          profileVisibility: data.privacyPrefs?.profileVisibility ?? "doctors_only",
          shareDataForResearch: data.privacyPrefs?.shareDataForResearch ?? false,
        });
      })
      .catch(() => setError(t("settings.error.load")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flashSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  // ---- Account status handlers ----
  const handleDeactivateClick = () => setShowDeactivateModal(true);

  const confirmDeactivate = async () => {
    setShowDeactivateModal(false);
    setUpdating(true);
    setError("");
    try {
      const data = await api.put<any>("/users/profile/deactivate");
      setAccountStatus(data.accountStatus);
      flashSuccess(t("settings.success.deactivated"));
    } catch (err) {
      console.error(err);
      setError(t("settings.error.deactivate"));
    } finally {
      setUpdating(false);
    }
  };

  const handleReactivate = async () => {
    setUpdating(true);
    setError("");
    try {
      const data = await api.put<any>("/users/profile/reactivate");
      setAccountStatus(data.accountStatus);
      flashSuccess(t("settings.success.reactivated"));
    } catch (err) {
      console.error(err);
      setError(t("settings.error.reactivate"));
    } finally {
      setUpdating(false);
    }
  };

  // ---- 2FA handler ----
  const handleToggleTwoFactor = async () => {
    const nextValue = !twoFactorEnabled;
    setSavingTwoFactor(true);
    setError("");
    try {
      await api.put("/users/profile/2fa", { enabled: nextValue });
      setTwoFactorEnabled(nextValue);
      flashSuccess(
        nextValue ? t("settings.success.twoFactorOn") : t("settings.success.twoFactorOff")
      );
    } catch (err) {
      console.error(err);
      setError(t("settings.error.twoFactor"));
    } finally {
      setSavingTwoFactor(false);
    }
  };

  // ---- Notifications handlers ----
  const handleToggleNotification = (key: keyof NotificationPrefs) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    setError("");
    try {
      await api.put("/users/profile/notifications", notifications);
      flashSuccess(t("settings.success.notifications"));
    } catch (err) {
      console.error(err);
      setError(t("settings.error.notifications"));
    } finally {
      setSavingNotifications(false);
    }
  };

  // ---- Privacy handlers ----
  const handlePrivacyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPrivacy((prev) => ({
      ...prev,
      profileVisibility: e.target.value as PrivacyPrefs["profileVisibility"],
    }));
  };

  const handleToggleDataSharing = () => {
    setPrivacy((prev) => ({
      ...prev,
      shareDataForResearch: !prev.shareDataForResearch,
    }));
  };

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    setError("");
    try {
      await api.put("/users/profile/privacy", privacy);
      flashSuccess(t("settings.success.privacy"));
    } catch (err) {
      console.error(err);
      setError(t("settings.error.privacy"));
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <DashboardLayout pageTitle={t("settings.pageTitle")}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">{t("settings.loading")}</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {t("settings.pageTitle")}
            </h1>
            {createdAt && (
              <p className="text-sm text-gray-400">
                {t("settings.memberSince")}{" "}
                {new Date(createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* ---- Login & Security ---- */}
          <section className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              {t("settings.security.title")}
            </h2>

            <div className="flex items-center justify-between border-b pb-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-800">
                  {t("settings.security.accountStatus")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("settings.security.accountStatusText")}{" "}
                  <span
                    className={
                      accountStatus === "Active"
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {accountStatus}
                  </span>
                </p>
              </div>
              {accountStatus === "Active" ? (
                <button
                  onClick={handleDeactivateClick}
                  disabled={updating}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {updating ? t("settings.security.updating") : t("settings.security.deactivate")}
                </button>
              ) : (
                <button
                  onClick={handleReactivate}
                  disabled={updating}
                  className="bg-green-50 hover:bg-green-100 text-green-600 font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {updating ? t("settings.security.updating") : t("settings.security.reactivate")}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between border-b pb-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-800">{t("settings.security.password")}</h3>
                <p className="text-sm text-gray-500">
                  {t("settings.security.passwordDesc")}
                </p>
              </div>
              <button
                onClick={() => (window.location.href = "/forgot-password")}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-lg transition"
              >
                {t("settings.security.changePassword")}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">
                  {t("settings.security.twoFactor")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("settings.security.twoFactorDesc")}
                </p>
              </div>
              <ToggleSwitch
                checked={twoFactorEnabled}
                onChange={handleToggleTwoFactor}
                disabled={savingTwoFactor}
              />
            </div>
          </section>

          {/* ---- Notification Preferences ---- */}
          <section className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              {t("settings.notifications.title")}
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{t("settings.notifications.email")}</h3>
                  <p className="text-sm text-gray-500">
                    {t("settings.notifications.emailDesc")}
                  </p>
                </div>
                <ToggleSwitch
                  checked={notifications.email}
                  onChange={() => handleToggleNotification("email")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{t("settings.notifications.sms")}</h3>
                  <p className="text-sm text-gray-500">
                    {t("settings.notifications.smsDesc")}
                  </p>
                </div>
                <ToggleSwitch
                  checked={notifications.sms}
                  onChange={() => handleToggleNotification("sms")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{t("settings.notifications.push")}</h3>
                  <p className="text-sm text-gray-500">
                    {t("settings.notifications.pushDesc")}
                  </p>
                </div>
                <ToggleSwitch
                  checked={notifications.push}
                  onChange={() => handleToggleNotification("push")}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
              >
                {savingNotifications ? t("settings.notifications.saving") : t("settings.notifications.save")}
              </button>
            </div>
          </section>

          {/* ---- Privacy ---- */}
          <section className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">{t("settings.privacy.title")}</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.privacy.visibility")}
              </label>
              <p className="text-sm text-gray-500 mb-2">
                {t("settings.privacy.visibilityDesc")}
              </p>
              <select
                value={privacy.profileVisibility}
                onChange={handlePrivacyChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="doctors_only">{t("settings.privacy.doctorsOnly")}</option>
                <option value="private">{t("settings.privacy.onlyMe")}</option>
                <option value="public">{t("settings.privacy.public")}</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">
                  {t("settings.privacy.research")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("settings.privacy.researchDesc")}
                </p>
              </div>
              <ToggleSwitch
                checked={privacy.shareDataForResearch}
                onChange={handleToggleDataSharing}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSavePrivacy}
                disabled={savingPrivacy}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
              >
                {savingPrivacy ? t("settings.privacy.saving") : t("settings.privacy.save")}
              </button>
            </div>
          </section>

          <button
            onClick={() => (window.location.href = "/profile")}
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition"
          >
            {t("settings.backToProfile")}
          </button>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDeactivateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("settings.deactivateModal.title")}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t("settings.deactivateModal.desc")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition"
              >
                {t("settings.deactivateModal.cancel")}
              </button>
              <button
                onClick={confirmDeactivate}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                {t("settings.deactivateModal.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
