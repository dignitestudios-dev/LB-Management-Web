import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const ModalMissingAttendance = ({
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
  console.log("checkInTime -- ", checkOutTime, checkInTime);
  const [formData, setFormData] = useState(
    missingAttendance?.map((item) => ({
      shiftDate: item?.shiftDate,
      reason: "",
      note: "",
      type: item?.type,
      checkInTimes: item?.checkInTime,
    }))
  );

  useEffect(() => {
    if (missingAttendance) {
      setFormData(
        missingAttendance?.map((item) => ({
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

      const res = await axios.post("/attendance/missing", payload);
      console.log("Success:", res?.data);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-6 max-h-[90vh] overflow-auto rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-lg font-semibold text-red-600 mb-4">
          Missing Attendance Detected
        </h2>
        {formData?.slice(-1)?.map((item, index) => {
          const lastIndex = formData.length - 1;
          const items = formData[lastIndex];
          useEffect(() => {
            if (
              item?.type === "checkout_missing" &&
              item?.checkInTimes &&
              !checkInTime
            ) {
              setcheckInTime(formatTime(item.checkInTimes));
            }
          }, [item?.checkInTimes, item?.type]);

          return (
            <div
              key={lastIndex}
              className="border rounded-md p-4 mb-4 bg-red-50 space-y-3"
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
                        min={
                          item?.type === "checkout_missing"
                            ? formatTimeOnly(item?.checkInTimes)
                            : checkInTime
                        }
                        onChange={(e) => {
                          const selected = e.target.value;

                          const checkInBase =
                            item?.type === "checkout_missing"
                              ? formatTimeOnly(item?.checkInTimes)
                              : checkInTime;

                          if (!selected || !checkInBase) return;

                          const [inH, inM] = checkInBase.split(":").map(Number);
                          const [outH, outM] = selected.split(":").map(Number);

                          const checkInDate = new Date(0, 0, 0, inH, inM);
                          const checkOutDate = new Date(0, 0, 0, outH, outM);
                          const isOvernightShift =
                            outH < 6 &&
                            (inH >= 18 || checkOutDate < checkInDate);

                          if (
                            !isOvernightShift &&
                            checkOutDate <= checkInDate
                          ) {
                            ErrorToast(
                              "Checkout time must be after check-in time"
                            );
                            return;
                          }

                          setcheckOutTime(selected);
                        }}
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
                <div>
                  <label className="block mb-1 font-medium">Reason</label>
                  <select
                    value={item.reason}
                    onChange={(e) => {
                      const updatedReason = e.target.value;
                      setSelectedReasons(updatedReason);
                      handleChange(lastIndex, "reason", updatedReason);
                    }}
                    className="w-full border rounded-md h-[45px] px-2"
                  >
                    <option value="">Select reason</option>
                    <option value="absent">Absent</option>
                    <option value="forgot">Forgot</option>
                    <option value="weekend">Weekend</option>
                    <option value="other">Other</option>
                  </select>
                  {errors[lastIndex]?.reason && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[lastIndex]?.reason}
                    </p>
                  )}

                  {item?.reason === "forgot" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 font-medium">
                          Check In Time
                        </label>
                        <input
                          type="time"
                          value={checkInTime || ""}
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

                      <div>
                        <button
                          disabled={
                            checkInTime === null || checkOutTime === null
                          }
                          className={` ${
                            checkInTime === null || checkOutTime === null
                              ? "bg-gray-300 cursor-not-allowed text-gray-500 "
                              : "bg-red-100 text-red-500"
                          }   rounded-md p-2  font-[500] `}
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
              item?.type === "checkout_missing" ? (
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
          {selectedReasons !== "forgot" && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-5 py-2 rounded text-white ${
                submitting ? "bg-red-300" : "bg-red-500 hover:bg-red-600"
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
