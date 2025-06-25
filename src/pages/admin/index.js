import React, { useState, useEffect } from "react";
import {
  Save,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Trash2,
  Eye,
} from "lucide-react";
import { useRouter } from "next/router";

const AdminPage = () => {
  const [excelLink1, setExcelLink1] = useState("");

  const [isLoading, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [storedLinks, setStoredLinks] = useState({ link1: "", link2: "" });
const router = useRouter()
  // Load existing links from sessionStorage on component mount
  useEffect(() => {
    const link1 = sessionStorage.getItem("excelLink1");
   

    if (link1) {
      setExcelLink1(link1);
      setStoredLinks((prev) => ({ ...prev, link1 }));
    }
   
  }, []);

  // Validate URL format
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate if it's likely an Excel file URL
  const isExcelUrl = (url) => {
    const excelExtensions = [".xlsx", ".xls", ".csv"];
    const lowerUrl = url.toLowerCase();
    return (
      excelExtensions.some((ext) => lowerUrl.includes(ext)) ||
      lowerUrl.includes("sheets.google.com") ||
      lowerUrl.includes("onedrive.live.com") ||
      lowerUrl.includes("sharepoint.com")
    );
  };

  // Validate inputs
  const validateInputs = () => {
    const newErrors = {};

    if (!excelLink1.trim()) {
      newErrors.link1 = "Excel Link 1 is required";
    } else if (!isValidUrl(excelLink1)) {
      newErrors.link1 = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save to sessionStorage
  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    setSaving(true);
    setShowSuccess(false);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store in sessionStorage
      sessionStorage.setItem("excelLink1", excelLink1.trim());
      // Update stored links state
      setStoredLinks({
        link1: excelLink1.trim()
      });

      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/")
      }, 1000);
    } catch (error) {
      console.error("Error saving links:", error);
    } finally {
      setSaving(false);
    }
  };

  // Clear all data
  const handleClear = () => {
    setExcelLink1("");

    setErrors({});
    sessionStorage.removeItem("excelLink1");
  
    setStoredLinks({ link1: "" });
  };

  // Open link in new tab
  const openLink = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage Excel sheet links</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 ">
        {/* Success Notification */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-in slide-in-from-top duration-300">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-green-800 font-medium">Success!</p>
              <p className="text-green-700 text-sm">
                Excel links have been saved successfully.
              </p>
            </div>
          </div>
        )}

        <div className=" gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Excel Links Configuration
              </h2>
              <p className="text-gray-600">
                Enter the URLs for your Excel sheets below.
              </p>
            </div>

            <div className="space-y-6">
              {/* Excel Link 1 */}
              <div>
                <label
                  htmlFor="excelLink1"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Excel Link
                </label>
                <div className="relative text-black">
                  <input
                    type="url"
                    id="excelLink1"
                    value={excelLink1}
                    onChange={(e) => {
                      setExcelLink1(e.target.value);
                      if (errors.link1) {
                        setErrors((prev) => ({ ...prev, link1: null }));
                      }
                    }}
                    placeholder="https://example.com/spreadsheet1.xlsx"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                      errors.link1
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {excelLink1 && !errors.link1 && (
                    <button
                      onClick={() => openLink(excelLink1)}
                      className="absolute right-3 top-3 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Open link"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {errors.link1 && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.link1}</span>
                  </div>
                )}
              </div>

              {/* Excel Link 2 */}
              {/* <div>
                <label
                  htmlFor="excelLink2"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  UI Excel Link
                </label>
                <div className="relative text-black">
                  <input
                    type="url"
                    id="excelLink2"
                    value={excelLink2}
                    onChange={(e) => {
                      setExcelLink2(e.target.value);
                      if (errors.link2) {
                        setErrors((prev) => ({ ...prev, link2: null }));
                      }
                    }}
                    placeholder="https://example.com/spreadsheet2.xlsx"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                      errors.link2
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {excelLink2 && !errors.link2 && (
                    <button
                      onClick={() => openLink(excelLink2)}
                      className="absolute right-3 top-3 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Open link"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {errors.link2 && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.link2}</span>
                  </div>
                )}
              </div> */}

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={` flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  <Save
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span>{isLoading ? "Saving..." : "Save Links"}</span>
                </button>

                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Supported formats:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {/* <li>• Excel files (.xlsx, .xls)</li>
                <li>• CSV files (.csv)</li> */}
                <li>• Google Sheets links</li>
                {/* <li>• OneDrive/SharePoint links</li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
