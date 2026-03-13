import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { IoLogOut } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { useLogin } from "../../hooks/api/Post";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
const ModalMissingAttendance = ({
  isOpen,
  setIsUpdate,
  missingAttendance = [],
  setModalOpen,
  setIsModalOpen,
  setShiftDate,
  setcheckInTime,
  checkInTime,
  checkOutTime,
  setcheckOutTime,
  setSelectedReasons,
  setSelectmissingType,
  selectedReasons,
}) => {
   const [logoutLoading, setLogoutLoading] = useState(false);
    const { postData, loading } = useLogin();
    const navigate = useNavigate();
  const [formData, setFormData] = useState(
    (Array.isArray(missingAttendance) ? missingAttendance : []).map((item) => ({
      shiftDate: item?.shiftDate,
      reason: "",
      note: "",
      type: item?.type,
      checkInTimes: item?.checkInTime,
    }))
  );

  useEffect(() => {
    if (Array.isArray(missingAttendance)) {
      setFormData(
        missingAttendance.map((item) => ({
          shiftDate: item?.shiftDate,
          reason: "",
          note: "",
          type: item?.type,
          checkInTimes: item?.checkInTime,
        }))
      );
    }
  }, [missingAttendance]);

  const [errors, setErrors] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const lastFormEntry = formData?.[formData.length - 1];

  useEffect(() => {
    if (
      lastFormEntry?.type === "checkout_missing" &&
      lastFormEntry?.checkInTimes &&
      !checkInTime
    ) {
      setcheckInTime(formatTime(lastFormEntry.checkInTimes));
    }
  }, [lastFormEntry?.type, lastFormEntry?.checkInTimes, checkInTime]);

  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
    const updatedErrors = [...errors];
    if (updatedErrors[index]) {
      updatedErrors[index][field] = "";
      if (field === "reason" && value !== "other") {
        updatedErrors[index]["note"] = "";
      }
    }
    setErrors(updatedErrors);
  };

  const validate = () => {
    const newErrors = formData?.map((entry) => {
      const errs = {};
      if (!entry.reason) errs.reason = "Required";
      if (entry.reason === "other" && !entry.note.trim())
        errs.note = "Required for 'other'";
      return errs;
    });

    setErrors(newErrors);
    return newErrors.every((err) => Object.keys(err).length === 0);
  };

  const handleSubmit = async () => {
    // if (!validate()) return;

    setSubmitting(true);
    try {
      const lastIndex = formData.length - 1;
      const currentEntry = formData[lastIndex];

      if (!currentEntry.reason) {
        ErrorToast("Please select a reason.");
        setSubmitting(false);
        return;
      }
      if (currentEntry.reason === "other" && !currentEntry.note.trim()) {
        ErrorToast("Please add a note for 'other'.");
        setSubmitting(false);
        return;
      }
      if (currentEntry.reason === "absent" && !currentEntry.note.trim()) {
        ErrorToast("Please add a note for 'Absent'.");
        setSubmitting(false);
        return;
      }

      const payload = {
        reason: currentEntry.reason,
        note: currentEntry.note,
        shiftDate: currentEntry.shiftDate,
      };

      // return console.log(currentEntry)
 
      if(!payload.reason){
        return ErrorToast("Please select reason")
      }
      const res = await axios.post("/attendance/missing", payload);

      SuccessToast("Submitted successfully");
      if (missingAttendance.length === 0) {
        setModalOpen(false);
      }
      setIsUpdate((prev) => !prev);
    } catch (err) {
      console.error("Submission failed:", err);
      ErrorToast("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (isoTime) => {
    if (!isoTime) return "";
    const date = new Date(isoTime);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Karachi",
    });
  };

  const formatTimeOnly = (timeStrOrISO) => {
    if (!timeStrOrISO) return "";
    const date = new Date(timeStrOrISO);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Karachi",
    });
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await postData("/auth/logout", false, null, null, (res) => {
      Cookies.remove("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      SuccessToast("Logged out successfully.");
      navigate("/auth/login");
    });
    setLogoutLoading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className={`w-[100px] top-4 right-4 flex absolute items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition z-10 ${
          logoutLoading
            ? "bg-primary/40 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90"
        } text-white`}
      >
        {logoutLoading ? (
          <>
            <FaSpinner className="animate-spin text-sm" />
            Logging out...
          </>
        ) : (
          <>
            <IoLogOut className="text-lg" />
            Logout
          </>
        )}
      </button>
      <div
        className={`relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 max-h-[90vh] overflow-auto shadow-xl transition-all duration-200 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <h2 className="text-lg font-semibold text-primary mb-4">
          Missing Attendance Detected
        </h2>
        {formData?.slice(-1)?.map((item, index) => {
          const lastIndex = formData.length - 1;

          return (
            <div
              key={lastIndex}
              className="mb-4 space-y-3 rounded-xl border border-primary/10 bg-primary/5 p-4"
            >
              <div className="font-semibold text-gray-800">
                📅{" "}
                {new Date(item?.shiftDate).toLocaleDateString("en-US", {
                  timeZone: "Asia/Karachi",
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              {item?.type === "checkout_missing" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-medium">
                        Check In Time
                      </label>

                      <input
                        disabled
                        type="time"
                        value={
                          checkInTime !== null
                            ? checkInTime
                            : item?.type === "checkout_missing"
                            ? formatTime(item?.checkInTimes)
                            : ""
                        }
                        onChange={(e) => setcheckInTime(e.target.value)}
                        className="w-full border rounded-md px-2 py-1"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">
                        Check Out Time
                      </label>
                      <input
                        type="time"
                        value={checkOutTime || ""}
                        onChange={(e) => setcheckOutTime(e.target.value)}
                        className="w-full border rounded-md px-2 py-1"
                      />
                    </div>

                    <button
                      className={`${
                        checkOutTime === null
                          ? "bg-gray-300 cursor-not-allowed text-gray-500 "
                          : "bg-red-100 text-red-500"
                      } rounded-md p-2  font-[500] `}
                      onClick={() => {
                        setShiftDate(item?.shiftDate);
                        setSelectmissingType(item?.type);
                        setIsModalOpen(true);
                      }}
                    >
                      Add Projects
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block font-medium">Reason</label>
                    <select
                      value={item.reason}
                      onChange={(e) => {
                        const updatedReason = e.target.value;
                        setSelectedReasons(updatedReason);
                        handleChange(lastIndex, "reason", updatedReason);
                      }}
                      className="h-[45px] w-full rounded-md border border-slate-300 px-2"
                    >
                      <option value="">Select reason</option>
                      <option value="absent">Absent</option>
                      <option value="forgot">Forgot</option>
                      <option value="holiday">Holiday</option>
                      <option value="other">Other</option>
                    </select>
                    {errors[lastIndex]?.reason && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[lastIndex]?.reason}
                      </p>
                    )}
                  </div>

                  {item?.reason === "forgot" && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-medium">
                          Check In Time
                        </label>
                        <input
                          type="time"
                          value={checkInTime || ""}
                          onChange={(e) => setcheckInTime(e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block font-medium">
                          Check Out Time
                        </label>
                        <input
                          type="time"
                          value={checkOutTime || ""}
                          onChange={(e) => setcheckOutTime(e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                        />
                      </div>

                      <div>
                        <button
                          disabled={checkInTime === null || checkOutTime === null}
                          className={`${
                            checkInTime === null || checkOutTime === null
                              ? "cursor-not-allowed bg-gray-300 text-gray-500"
                              : "bg-primary/10 text-primary"
                          } rounded-md p-2 font-[500]`}
                          onClick={() => {
                            setShiftDate(item?.shiftDate);
                            setIsModalOpen(true);
                          }}
                        >
                          Add Projects
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {item?.reason === "forgot" ||
              item?.type === "checkout_missing" ||
              item?.reason === "holiday" ? (
                <div></div>
              ) : (
                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    value={item?.note}
                    onChange={(e) =>
                      handleChange(lastIndex, "note", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1"
                    rows={3}
                    placeholder="Explain the reason..."
                    maxLength={100}
                  />
                  {errors[index]?.note && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[index].note}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-4 flex justify-end gap-3">
          {selectedReasons !== "forgot" &&
            lastFormEntry?.type !== "checkout_missing" && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium text-white transition ${
                  submitting
                    ? "cursor-not-allowed bg-primary/40"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ModalMissingAttendance;
