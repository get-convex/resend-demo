"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <span className="text-xl font-semibold">📧 Resend Email Testing</span>
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">
          Test Email Delivery with Resend
        </h1>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  return (
    <>
      {isAuthenticated && (
        <button
          className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          onClick={() => void signOut()}
        >
          <span className="text-lg">🚪</span>
          Sign out
        </button>
      )}
    </>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            setError(error.message);
          });
        }}
      >
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="text"
          name="name"
          placeholder="Name"
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="password"
          name="password"
          placeholder="Password"
        />
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md"
          type="submit"
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="flex flex-row gap-2">
          <span>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <span
            className="text-dark dark:text-light underline hover:no-underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </span>
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-dark dark:text-light font-mono text-xs">
              Error signing in: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

function Content() {
  const emails = useQuery(api.emails.listMyEmailsAndStatuses);
  const sendEmail = useMutation(api.emails.sendEmail);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const testEmails = [
    "delivered@resend.dev",
    "bounced@resend.dev",
    "complained@resend.dev",
  ];

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || !subject || !message) {
      alert("Please fill in all fields and select a recipient");
      return;
    }

    setIsSending(true);
    try {
      await sendEmail({
        to: selectedRecipient,
        subject: subject,
        body: message,
      });
      // Reset form
      setSelectedRecipient("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Send Email Form */}
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              🚀 Send Test Email
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Test email delivery to Resend's test addresses
            </p>
          </div>

          <form
            onSubmit={(e) => void handleSendEmail(e)}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8"
          >
            {/* Recipient Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📮</span>
                <label className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Choose Test Recipient
                </label>
              </div>
              <div className="grid gap-3">
                {testEmails.map((email) => (
                  <label
                    key={email}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedRecipient === email
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedRecipient === email}
                      onChange={() => setSelectedRecipient(email)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {email.includes("delivered")
                          ? "✅"
                          : email.includes("bounced")
                            ? "❌"
                            : email.includes("complained")
                              ? "⚠️"
                              : "👋"}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {email}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Subject Field */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📝</span>
                <label className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Subject
                </label>
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter your email subject..."
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-lg"
                required
              />
            </div>

            {/* Message Field */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💬</span>
                <label className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Message
                </label>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email message here..."
                rows={6}
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-lg resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                isSending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              } text-white`}
            >
              {isSending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending Email...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  Send Test Email
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel - Email History */}
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              📊 Email History
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Track your sent emails and their delivery status
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 h-fit">
            {emails === undefined ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  No emails sent yet
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                  Send your first test email to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {emails.map((email) => (
                  <div
                    key={email.emailId}
                    className="bg-slate-50 dark:bg-slate-700 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">📧</span>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {email.subject || "No subject"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">📮</span>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            To: <span className="font-medium">{email.to}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🕒</span>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {new Date(email.sentAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                            email.status.complained
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : email.status.status === "delivered"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : email.status.status === "bounced"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                          }`}
                        >
                          <span className="text-xs">
                            {email.status.complained
                              ? "⚠️"
                              : email.status.status === "delivered"
                                ? "✅"
                                : email.status.status === "bounced"
                                  ? "❌"
                                  : "⏳"}
                          </span>
                          {email.status.complained
                            ? "delivered (but complained)"
                            : email.status.status || "pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Useful Resources</h2>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2 w-1/2">
            <ResourceCard
              title="Convex docs"
              description="Read comprehensive documentation for all Convex features."
              href="https://docs.convex.dev/home"
            />
            <ResourceCard
              title="Resend"
              description="Resend is a modern email service that provides a simple API for sending emails."
              href="https://resend.com/"
            />
          </div>
          <div className="flex flex-col gap-2 w-1/2">
            <ResourceCard
              title="Convex Auth"
              description="Convex Auth is a modern authentication library for Convex."
              href="https://labs.convex.dev/auth/"
            />
            <ResourceCard
              title="Resend Component"
              description="Resend Component is a modern email component for Convex."
              href="https://labs.convex.dev/components/resend"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-slate-200 dark:bg-slate-800 p-4 rounded-md h-28 overflow-auto">
      <a href={href} className="text-sm underline hover:no-underline">
        {title}
      </a>
      <p className="text-xs">{description}</p>
    </div>
  );
}
