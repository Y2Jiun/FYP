import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsAndConditions() {
  return (
    <>
      <Header />
      <section className="pt-32 pb-16 lg:pt-[180px] lg:pb-[120px]">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl dark:text-white">
                Terms and Conditions
              </h1>
              <p className="text-body-color text-base font-medium">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold">
                  1. Acceptance of Terms
                </h2>
                <p className="mb-6">
                  By accessing and using this property transparency platform,
                  you accept and agree to be bound by the terms and provision of
                  this agreement.
                </p>

                <h2 className="mb-4 text-2xl font-bold">
                  2. Account Registration
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>
                    You must provide accurate, current, and complete information
                    during registration
                  </li>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account credentials
                  </li>
                  <li>
                    You must be at least 18 years old to create an account
                  </li>
                  <li>One account per person is allowed</li>
                  <li>
                    You are responsible for all activities that occur under your
                    account
                  </li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  3. Property Listing Rules
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>All property listings must be accurate and truthful</li>
                  <li>
                    You must own or have legal authority to list the property
                  </li>
                  <li>Required documents must be uploaded for verification</li>
                  <li>Property information must be kept up to date</li>
                  <li>No duplicate listings for the same property</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  4. Verification Requirements
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>Property title deeds must be valid and current</li>
                  <li>Building permits must be obtained where required</li>
                  <li>Tax assessments must be up to date</li>
                  <li>Insurance certificates must be valid</li>
                  <li>All documents must be in clear, readable format</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  5. User Responsibilities
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>Maintain accurate and current property information</li>
                  <li>Respond to verification requests within 7 days</li>
                  <li>Report any suspicious or fraudulent activity</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect the privacy and rights of other users</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  6. Agent Responsibilities
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>Agents must be properly licensed and registered</li>
                  <li>
                    Provide accurate property information and documentation
                  </li>
                  <li>Maintain professional conduct and ethical standards</li>
                  <li>Respond to client inquiries promptly</li>
                  <li>Keep all client information confidential</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  7. Platform Usage Guidelines
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>
                    Use the platform for legitimate property transactions only
                  </li>
                  <li>
                    Do not engage in spam, harassment, or fraudulent activities
                  </li>
                  <li>Respect intellectual property rights</li>
                  <li>Do not attempt to circumvent security measures</li>
                  <li>Report technical issues promptly</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  8. Dispute Resolution
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>Users must attempt to resolve disputes amicably</li>
                  <li>
                    Platform mediation is available for unresolved disputes
                  </li>
                  <li>Legal action may be pursued for serious violations</li>
                  <li>Disputes will be resolved according to local laws</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  9. Termination Policy
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>Accounts may be suspended for policy violations</li>
                  <li>
                    Serious violations may result in permanent account
                    termination
                  </li>
                  <li>Users may terminate their account at any time</li>
                  <li>
                    Data retention policies apply after account termination
                  </li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  10. Limitation of Liability
                </h2>
                <p className="mb-6">
                  The platform is provided "as is" without warranties. We are
                  not liable for any damages arising from the use of our
                  services.
                </p>

                <h2 className="mb-4 text-2xl font-bold">
                  11. Changes to Terms
                </h2>
                <p className="mb-6">
                  We reserve the right to modify these terms at any time. Users
                  will be notified of significant changes.
                </p>

                <h2 className="mb-4 text-2xl font-bold">
                  12. Contact Information
                </h2>
                <p className="mb-6">
                  For questions about these terms, please contact us at
                  support@propertytransparency.com
                </p>

                <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <Link href="/signup" className="text-primary hover:underline">
                    ← Back to Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </>
  );
}
