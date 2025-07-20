import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <section className="pt-32 pb-16 lg:pt-[180px] lg:pb-[120px]">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-body-color text-base font-medium">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold">
                  1. Information We Collect
                </h2>
                <h3 className="mb-2 text-xl font-semibold">
                  Personal Information
                </h3>
                <ul className="mb-4 list-disc pl-6">
                  <li>Name, email address, and contact information</li>
                  <li>Account credentials and profile information</li>
                  <li>Property ownership and listing details</li>
                  <li>Documentation uploaded for verification</li>
                  <li>Communication records with our platform</li>
                </ul>

                <h3 className="mb-2 text-xl font-semibold">
                  Usage Information
                </h3>
                <ul className="mb-6 list-disc pl-6">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                  <li>Search queries and preferences</li>
                  <li>Error logs and performance data</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  2. How We Use Your Information
                </h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>
                    Provide and maintain our property transparency platform
                  </li>
                  <li>Verify property ownership and documentation</li>
                  <li>Process transactions and payments</li>
                  <li>Send notifications and updates</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and ensure platform security</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  3. Information Sharing
                </h2>
                <h3 className="mb-2 text-xl font-semibold">
                  We may share your information with:
                </h3>
                <ul className="mb-4 list-disc pl-6">
                  <li>Property verification authorities</li>
                  <li>Legal and regulatory bodies when required</li>
                  <li>Service providers who assist in platform operations</li>
                  <li>Other users as necessary for property transactions</li>
                </ul>

                <h3 className="mb-2 text-xl font-semibold">
                  We will NOT share your information with:
                </h3>
                <ul className="mb-6 list-disc pl-6">
                  <li>Third-party advertisers without consent</li>
                  <li>Unauthorized parties</li>
                  <li>For purposes other than those stated in this policy</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">4. Data Security</h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure document storage and transmission</li>
                  <li>Monitoring for suspicious activities</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">5. Your Rights</h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data in a portable format</li>
                  <li>Lodge complaints with supervisory authorities</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">6. Cookie Policy</h2>
                <p className="mb-4">
                  We use cookies and similar technologies to enhance your
                  experience on our platform.
                </p>
                <h3 className="mb-2 text-xl font-semibold">
                  Types of cookies we use:
                </h3>
                <ul className="mb-6 list-disc pl-6">
                  <li>Essential cookies for platform functionality</li>
                  <li>Analytics cookies to understand usage patterns</li>
                  <li>Preference cookies to remember your settings</li>
                  <li>Security cookies to protect against fraud</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  7. Third-Party Services
                </h2>
                <p className="mb-4">
                  Our platform may integrate with third-party services for
                  enhanced functionality.
                </p>
                <ul className="mb-6 list-disc pl-6">
                  <li>Payment processors for transactions</li>
                  <li>Document verification services</li>
                  <li>Analytics and monitoring tools</li>
                  <li>Cloud storage and hosting services</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">8. Data Retention</h2>
                <ul className="mb-6 list-disc pl-6">
                  <li>Account data is retained while your account is active</li>
                  <li>Property listings are kept for verification purposes</li>
                  <li>Documentation is retained as required by law</li>
                  <li>Deactivated accounts are retained for 30 days</li>
                  <li>Legal requirements may extend retention periods</li>
                </ul>

                <h2 className="mb-4 text-2xl font-bold">
                  9. Children's Privacy
                </h2>
                <p className="mb-6">
                  Our platform is not intended for users under 18 years of age.
                  We do not knowingly collect personal information from
                  children.
                </p>

                <h2 className="mb-4 text-2xl font-bold">
                  10. International Data Transfers
                </h2>
                <p className="mb-6">
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure appropriate
                  safeguards are in place.
                </p>

                <h2 className="mb-4 text-2xl font-bold">
                  11. Changes to This Policy
                </h2>
                <p className="mb-6">
                  We may update this privacy policy from time to time. We will
                  notify users of significant changes via email or platform
                  notifications.
                </p>

                <h2 className="mb-4 text-2xl font-bold">12. Contact Us</h2>
                <p className="mb-6">
                  If you have questions about this privacy policy, please
                  contact us at privacy@propertytransparency.com
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
