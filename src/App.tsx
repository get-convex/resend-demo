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
          className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md px-2 py-1"
          onClick={() => void signOut()}
        >
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
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Email List Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Email History</h2>
        <div className="flex flex-col gap-2">
          {emails === undefined ? (
            <p>Loading emails...</p>
          ) : emails.length === 0 ? (
            <p className="text-gray-500">No emails sent yet.</p>
          ) : (
            emails.map((email) => (
              <div
                key={email.emailId}
                className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">
                      {email.subject || "No subject"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      To: {email.to}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sent: {new Date(email.sentAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        email.status.status === "delivered"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : email.status.status === "bounced"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : email.status.complained
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }`}
                    >
                      {email.status.status || "unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send Email Form */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Send Test Email</h2>
        <form
          onSubmit={(e) => void handleSendEmail(e)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Recipient (Test Address):</label>
            <div className="flex flex-col gap-2">
              {testEmails.map((email) => (
                <label key={email} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={selectedRecipient === email}
                    onChange={() => setSelectedRecipient(email)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{email}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              rows={4}
              className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className={`bg-dark dark:bg-light text-light dark:text-dark rounded-md p-2 font-semibold ${
              isSending ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
            }`}
          >
            {isSending ? "Sending..." : "Send Email"}
          </button>
        </form>
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
