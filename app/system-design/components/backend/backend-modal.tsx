"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

interface APIModalProps {
  node: any;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

interface Header {
  name: string;
  value: string;
  type: string;
  required?: boolean;
}

interface ErrorInfo {
  type: string;
  description: string;
  message?: string;
  variable?: string;
  key1?: string;
  key2?: string;
  text1?: string;
  text2?: string;
}

export function APIModal({
  node,
  isOpen,
  onClose,
  userRole = "admin",
}: APIModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "request" | "response" | "errors"
  >("overview");
  const [expandedErrors, setExpandedErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  if (!isOpen || !node) return null;

  const errorResponses = Object.entries(node.responses || {})
    .filter(([status]) => !status.startsWith("2"))
    .map(([status, data]: [string, any]) => ({
      status,
      description: data.description,
      schema: data.schema,
      examples: data.examples,
    }));

  const successResponse = Object.entries(node.responses || {}).find(
    ([status]) => status.startsWith("2")
  )?.[1] as any;

  const getAllowedRoles = () => {
    if (!node.allowedRoles) return ["admin", "developer", "user"];
    return node.allowedRoles;
  };

  const allowedRoles = getAllowedRoles();

  const formatRequestBody = (requestBody: any) => {
    if (!requestBody || Object.keys(requestBody).length === 0) return null;

    const formatted: any = {};
    Object.keys(requestBody).forEach((key) => {
      const field = requestBody[key];
      if (typeof field === "object" && field !== null) {
        formatted[key] = {
          type: field.type || "any",
          required: field.required !== undefined ? field.required : true,
          description: field.description || `The ${key} parameter`,
          example: field.example || getExampleValue(field.type),
        };
      } else {
        formatted[key] = {
          type: typeof field === "string" ? field : "any",
          required: true,
          description: `The ${key} parameter`,
          example: getExampleValue(typeof field === "string" ? field : "any"),
        };
      }
    });

    return formatted;
  };

  const getExampleValue = (type: string) => {
    switch (type) {
      case "string":
        return "example_value";
      case "number":
        return 123;
      case "boolean":
        return true;
      case "object":
        return { key: "value" };
      case "array":
        return ["item1", "item2"];
      default:
        return "example";
    }
  };

  const groupErrors = (errors: ErrorInfo[]) => {
    const grouped: { [key: string]: ErrorInfo[] } = {};

    errors?.forEach((error) => {
      const type = error.type || "unknown";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(error);
    });

    return grouped;
  };

  const formattedRequestBody = formatRequestBody(node.requestBody);
  const formattedHeaders = node.headers || [];
  const groupedErrors = groupErrors(node.errors);

  const bgPrimary = isDarkMode ? "bg-slate-900" : "bg-white";
  const bgSecondary = isDarkMode ? "bg-slate-800" : "bg-slate-50";
  const bgTertiary = isDarkMode ? "bg-slate-700" : "bg-blue-50";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-slate-300" : "text-gray-600";
  const borderColor = isDarkMode ? "border-slate-700" : "border-slate-200";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className={`${bgPrimary} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border ${borderColor} transition-colors duration-300`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-start p-6 ${
            isDarkMode ? "border-slate-700" : "border-slate-200"
          } border-b shrink-0 gap-4 ${
            isDarkMode
              ? "bg-slate-800"
              : "bg-gradient-to-r from-white to-blue-50"
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span
                className="text-3xl animate-bounce"
                style={{ animationDuration: "2s" }}
              >
                {node.emoji}
              </span>
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {node.title}
              </h2>
              {node.type !== "service" && (
                <>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all duration-200 ${
                      node.method === "GET"
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : node.method === "POST"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : node.method === "PUT"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : node.method === "DELETE"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-slate-500 hover:bg-slate-600"
                    }`}
                  >
                    {node.method || "GROUP"}
                  </span>
                  <code
                    className={`text-sm ${
                      isDarkMode
                        ? "bg-slate-700 text-blue-300"
                        : "bg-slate-100 text-blue-700"
                    } px-3 py-1.5 rounded-lg border ${borderColor} font-mono font-medium truncate transition-colors duration-200`}
                  >
                    /api{node.path || "/multiple"}
                  </code>
                  {node.requiresAuth && (
                    <span
                      className={`text-xs px-3 py-1.5 ${
                        isDarkMode
                          ? "bg-slate-700 text-yellow-300"
                          : "bg-yellow-100 text-yellow-800"
                      } rounded-full font-semibold shrink-0 border ${borderColor} transition-colors duration-200`}
                    >
                      🔐 Auth Required
                    </span>
                  )}
                </>
              )}
            </div>
            <p className={`text-sm ${textSecondary}`}>{node.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? "bg-slate-700 text-yellow-400 hover:bg-slate-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg text-2xl flex-shrink-0 transition-all duration-200 hover:scale-110 ${
                isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-slate-700"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              }`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex gap-0 ${
            isDarkMode ? "border-slate-700" : "border-slate-200"
          } border-b shrink-0`}
        >
          {["overview", "request", "response", "errors"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-300 ease-out ${
                activeTab === tab
                  ? isDarkMode
                    ? "border-blue-400 text-blue-400 bg-slate-800"
                    : "border-blue-600 text-blue-600 bg-blue-50"
                  : isDarkMode
                  ? "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div
            className={`p-7 space-y-6 ${
              isDarkMode ? "bg-slate-900" : "bg-white"
            } transition-colors duration-300`}
          >
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Access Control */}
                <div className="animate-fadeIn">
                  <h3
                    className={`text-xs font-bold uppercase ${
                      isDarkMode ? "text-slate-400" : "text-slate-700"
                    } mb-4 tracking-widest`}
                  >
                    Access Control
                  </h3>
                  <div
                    className={`border ${borderColor} p-5 rounded-xl ${bgTertiary} transition-all duration-200`}
                  >
                    <div className="flex items-center gap-6 flex-wrap text-sm">
                      <div>
                        <div
                          className={`text-xs ${textSecondary} font-semibold uppercase tracking-wide`}
                        >
                          Your Role
                        </div>
                        <div
                          className={`font-bold ${textPrimary} mt-1.5 text-lg capitalize`}
                        >
                          {userRole}
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {allowedRoles.map((role: string) => (
                          <span
                            key={role}
                            className={`px-3.5 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-300 transform hover:scale-105 ${
                              role === userRole
                                ? isDarkMode
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-600 text-white"
                                : isDarkMode
                                ? "bg-slate-700 text-slate-200 border border-slate-600 hover:border-slate-500"
                                : "bg-white text-slate-700 border-2 border-slate-300 hover:border-blue-300"
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    {!allowedRoles.includes(userRole as any) && (
                      <div
                        className={`mt-4 p-4 ${
                          isDarkMode
                            ? "bg-red-900/30 border border-red-700"
                            : "bg-red-50 border border-red-300"
                        } rounded-lg text-sm ${
                          isDarkMode ? "text-red-300" : "text-red-900"
                        } font-semibold transition-all duration-200`}
                      >
                        ⚠️ Not accessible with your current role
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {(node.type === "service" || node.type === "group") && (
                  <div
                    className="animate-fadeIn"
                    style={{ animationDelay: "100ms" }}
                  >
                    <h3
                      className={`text-xs font-bold uppercase ${
                        isDarkMode ? "text-slate-400" : "text-slate-700"
                      } mb-4 tracking-widest`}
                    >
                      Description
                    </h3>
                    <p
                      className={`text-sm ${textSecondary} leading-relaxed ${bgSecondary} p-5 rounded-xl border ${borderColor} transition-all duration-200`}
                    >
                      {node.detailedDescription || node.description}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Request Tab */}
            {activeTab === "request" && (
              <>
                {formattedHeaders.length > 0 ||
                (formattedRequestBody &&
                  Object.keys(formattedRequestBody).length > 0) ? (
                  <div className="space-y-7">
                    {/* Headers */}
                    {formattedHeaders.length > 0 && (
                      <div className="animate-fadeIn">
                        <h3
                          className={`text-xs font-bold uppercase ${
                            isDarkMode ? "text-slate-400" : "text-slate-700"
                          } mb-4 tracking-widest`}
                        >
                          Headers
                        </h3>
                        <div className="space-y-3">
                          {formattedHeaders.map(
                            (header: Header, index: number) => (
                              <div
                                key={index}
                                className={`${bgSecondary} border ${borderColor} p-4 rounded-xl transition-all duration-300 hover:shadow-md hover:border-slate-300 transform hover:-translate-y-0.5`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                  <code
                                    className={`font-mono font-bold ${textPrimary} text-sm`}
                                  >
                                    {header.name}
                                  </code>
                                  {header.required && (
                                    <span className="text-red-500 text-xs font-bold uppercase tracking-wide">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <div className={`text-sm ${textSecondary}`}>
                                  {header.value}
                                </div>
                                <div
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-slate-500"
                                      : "text-slate-500"
                                  } mt-1.5 font-medium`}
                                >
                                  {header.type}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Parameters */}
                    {formattedRequestBody &&
                      Object.keys(formattedRequestBody).length > 0 && (
                        <div
                          className="animate-fadeIn"
                          style={{
                            animationDelay:
                              formattedHeaders.length > 0 ? "100ms" : "0ms",
                          }}
                        >
                          <h3
                            className={`text-xs font-bold uppercase ${
                              isDarkMode ? "text-slate-400" : "text-slate-700"
                            } mb-4 tracking-widest`}
                          >
                            Parameters
                          </h3>
                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(formattedRequestBody).map(
                              ([key, value]: [string, any]) => (
                                <div
                                  key={key}
                                  className={`${bgSecondary} border ${borderColor} p-4 rounded-xl transition-all duration-300 hover:shadow-md hover:border-slate-300 transform hover:-translate-y-0.5`}
                                >
                                  <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
                                    <code
                                      className={`font-mono font-bold ${textPrimary} text-sm`}
                                    >
                                      {key}
                                    </code>
                                    <div className="flex gap-2.5 items-center">
                                      <span
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                          isDarkMode
                                            ? "bg-slate-600 text-blue-300"
                                            : "bg-blue-100 text-blue-700"
                                        } transition-colors duration-200`}
                                      >
                                        {value.type}
                                      </span>
                                      {value.required && (
                                        <span className="text-red-500 font-bold text-xs">
                                          ●
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p
                                    className={`text-sm ${textSecondary} mb-3`}
                                  >
                                    {value.description}
                                  </p>
                                  {value.example && (
                                    <div
                                      className={`text-xs ${
                                        isDarkMode
                                          ? "bg-slate-800 text-slate-200"
                                          : "bg-slate-100 text-slate-700"
                                      } p-3 rounded-lg border ${borderColor} font-mono overflow-x-auto transition-colors duration-200`}
                                    >
                                      {JSON.stringify(value.example)}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div
                    className={`text-sm ${textSecondary} text-center py-12 animate-pulse`}
                  >
                    No request parameters
                  </div>
                )}
              </>
            )}

            {/* Response Tab */}
            {activeTab === "response" && (
              <>
                {node.id === "lobby-serverStarted" && (
                  <div className="animate-fadeIn mb-6">
                    <h3
                      className={`text-xs font-bold uppercase ${
                        isDarkMode ? "text-slate-400" : "text-slate-700"
                      } mb-4 tracking-widest`}
                    >
                      Example Response
                    </h3>
                    <picture>
                      <img
                        src="/serverStartedResopnse.png"
                        alt="Server Started Example"
                        className="rounded-xl border"
                      />
                    </picture>
                  </div>
                )}
                {successResponse && (
                  <div className="animate-fadeIn">
                    <h3
                      className={`text-xs font-bold uppercase ${
                        isDarkMode ? "text-slate-400" : "text-slate-700"
                      } mb-4 tracking-widest`}
                    >
                      ✅ Success Response
                    </h3>
                    <div
                      className={`${bgSecondary} border ${borderColor} p-5 rounded-xl transition-all duration-200 hover:shadow-md`}
                    >
                      <p
                        className={`text-sm ${textPrimary} mb-4 font-semibold`}
                      >
                        {successResponse.description}
                      </p>
                      {successResponse.examples &&
                        successResponse.examples.length > 0 && (
                          <pre
                            className={`text-xs overflow-auto max-h-48 ${
                              isDarkMode
                                ? "bg-slate-800 text-slate-200"
                                : "bg-slate-50 text-slate-700"
                            } p-4 rounded-lg border ${borderColor} font-mono leading-relaxed transition-colors duration-200`}
                          >
                            {JSON.stringify(
                              successResponse.examples[0],
                              null,
                              2
                            )}
                          </pre>
                        )}
                    </div>
                  </div>
                )}

                {!successResponse && (
                  <div
                    className={`text-sm ${textSecondary} text-center py-12 animate-pulse`}
                  >
                    No success response defined
                  </div>
                )}
              </>
            )}

            {/* Errors Tab */}
            {activeTab === "errors" && (
              <>
                {errorResponses.length > 0 && (
                  <div className="animate-fadeIn">
                    <h3
                      className={`text-xs font-bold uppercase ${
                        isDarkMode ? "text-slate-400" : "text-slate-700"
                      } mb-4 tracking-widest`}
                    >
                      Error Responses
                    </h3>
                    <div className="space-y-3">
                      {errorResponses.map((error, index) => (
                        <div
                          key={index}
                          className={`${bgSecondary} border ${borderColor} p-4 rounded-xl transition-all duration-300 hover:shadow-md`}
                        >
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span
                              className={`px-3 py-1.5 ${
                                isDarkMode
                                  ? "bg-red-900/40 text-red-300"
                                  : "bg-red-100 text-red-800"
                              } font-bold rounded-lg text-xs font-mono transition-colors duration-200`}
                            >
                              {error.status}
                            </span>
                            <span
                              className={`font-bold ${textPrimary} text-sm`}
                            >
                              {error.description}
                            </span>
                          </div>
                          {error.examples && error.examples.length > 0 && (
                            <pre
                              className={`text-xs overflow-auto max-h-32 ${
                                isDarkMode
                                  ? "bg-slate-800 text-slate-200"
                                  : "bg-slate-50 text-slate-700"
                              } p-3 rounded-lg border ${borderColor} font-mono leading-tight transition-colors duration-200`}
                            >
                              {JSON.stringify(error.examples[0], null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Patterns */}
                {node.errors && node.errors.length > 0 && (
                  <div
                    className="animate-fadeIn"
                    style={{
                      animationDelay:
                        errorResponses.length > 0 ? "100ms" : "0ms",
                    }}
                  >
                    <h3
                      className={`text-xs font-bold uppercase ${
                        isDarkMode ? "text-slate-400" : "text-slate-700"
                      } mb-4 tracking-widest`}
                    >
                      Error Patterns
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(groupedErrors).map(
                        ([errorType, errors]) => (
                          <div
                            key={errorType}
                            className={`border ${borderColor} rounded-xl overflow-hidden transition-all duration-300 ${
                              isDarkMode ? "bg-slate-800" : "bg-slate-50"
                            }`}
                          >
                            <button
                              onClick={() =>
                                setExpandedErrors((prev) => ({
                                  ...prev,
                                  [errorType]: !prev[errorType],
                                }))
                              }
                              className={`w-full flex items-center justify-between gap-3 p-4 transition-all duration-300 ${
                                isDarkMode
                                  ? "hover:bg-slate-700"
                                  : "hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span
                                  className={`text-sm font-bold ${textPrimary} capitalize`}
                                >
                                  {errorType}
                                </span>
                                <span
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "bg-slate-700 text-slate-300"
                                      : "bg-slate-200 text-slate-700"
                                  } px-2.5 py-1 rounded-full font-bold transition-colors duration-200`}
                                >
                                  {errors.length}
                                </span>
                              </div>
                              <span
                                className={`text-xs ${
                                  isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-600"
                                } transition-transform shrink-0 duration-300 ${
                                  expandedErrors[errorType] ? "rotate-180" : ""
                                }`}
                              >
                                ▼
                              </span>
                            </button>
                            {expandedErrors[errorType] && (
                              <div
                                className={`border-t ${borderColor} p-4 space-y-3 ${
                                  isDarkMode ? "bg-slate-900" : "bg-white"
                                } transition-all duration-300`}
                              >
                                {errors.slice(0, 3).map((error, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-sm ${bgSecondary} p-3.5 rounded-lg border ${borderColor} transition-all duration-200 hover:shadow-sm`}
                                  >
                                    <div
                                      className={`font-semibold ${textPrimary}`}
                                    >
                                      {error.description}
                                    </div>
                                    {error.message && (
                                      <div
                                        className={`${textSecondary} text-xs mt-2 flex items-center gap-2`}
                                      >
                                        → {error.message}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {errors.length > 3 && (
                                  <div
                                    className={`text-xs ${
                                      isDarkMode
                                        ? "text-slate-500"
                                        : "text-slate-500"
                                    } px-1 py-1 font-medium`}
                                  >
                                    +{errors.length - 3} more
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {!errorResponses.length && !node.errors?.length && (
                  <div
                    className={`text-sm ${textSecondary} text-center py-12 animate-pulse`}
                  >
                    No errors defined
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-5 ${
            isDarkMode
              ? "border-slate-700 bg-slate-800"
              : "border-slate-200 bg-slate-50"
          } border-t flex justify-between items-center shrink-0 transition-colors duration-300`}
        >
          <div className="flex gap-4 flex-wrap">
            {node.type && (
              <span
                className={`text-sm ${textSecondary} font-semibold capitalize`}
              >
                {node.type}
              </span>
            )}
            {node.category && (
              <span className={`text-sm ${textSecondary}`}>
                📁 {node.category}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
