import React from 'react';
import { Shield, Calendar, User, Eye, Lock, Database } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: January 15, 2025</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Shop Scanner LLC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Shop Scanner LLC ("we," "our," or "us") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                    information when you use our mobile application and web platform (the "Service").
                  </p>
                  <p>
                    Please read this Privacy Policy carefully. If you do not agree with the terms of 
                    this Privacy Policy, please do not access the Service.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="h-6 w-6 text-primary-600 mr-2" />
                  2. Information We Collect
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                    <div className="prose prose-gray max-w-none">
                      <p>We may collect personally identifiable information, such as:</p>
                      <ul>
                        <li>Name and email address</li>
                        <li>Phone number (optional)</li>
                        <li>Billing and payment information</li>
                        <li>Account preferences and settings</li>
                        <li>Profile information you choose to provide</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Usage Information</h3>
                    <div className="prose prose-gray max-w-none">
                      <p>We automatically collect certain information about your device and usage:</p>
                      <ul>
                        <li>Device information (model, operating system, unique identifiers)</li>
                        <li>Usage statistics and analytics</li>
                        <li>Log data (IP address, browser type, access times)</li>
                        <li>Location data (with your permission)</li>
                        <li>Camera access for barcode scanning</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Product and Scanning Data</h3>
                    <div className="prose prose-gray max-w-none">
                      <p>When you use our scanning features, we collect:</p>
                      <ul>
                        <li>Barcode and product information</li>
                        <li>Scan history and frequency</li>
                        <li>Wishlist items and preferences</li>
                        <li>Price tracking and alert settings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-6 w-6 text-primary-600 mr-2" />
                  3. How We Use Your Information
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Provide and maintain our Service</li>
                    <li>Process transactions and manage subscriptions</li>
                    <li>Authenticate users and prevent fraud</li>
                    <li>Provide customer support</li>
                    <li>Send service-related communications</li>
                    <li>Improve and optimize our Service</li>
                    <li>Conduct analytics and research</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                  <p>
                    We may also use your information to send you marketing communications, but only 
                    with your explicit consent. You can opt out of these communications at any time.
                  </p>
                </div>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
                <div className="prose prose-gray max-w-none">
                  <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">Service Providers</h4>
                      <p>We work with third-party service providers who assist us in operating our Service, such as:</p>
                      <ul>
                        <li>Payment processors (Stripe)</li>
                        <li>Analytics services (Google Analytics, Mixpanel)</li>
                        <li>Cloud hosting providers</li>
                        <li>Customer support platforms</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800">Legal Compliance</h4>
                      <p>We may disclose your information if required by law or in response to valid legal processes.</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800">Business Transfers</h4>
                      <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-6 w-6 text-primary-600 mr-2" />
                  5. Data Security
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    We implement appropriate technical and organizational security measures to protect 
                    your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <p>Our security measures include:</p>
                  <ul>
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security audits and assessments</li>
                    <li>Access controls and authentication</li>
                    <li>Secure payment processing</li>
                    <li>Regular software updates and patches</li>
                  </ul>
                  <p>
                    However, no method of transmission over the internet is 100% secure. While we 
                    strive to protect your information, we cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    We retain your personal information only for as long as necessary to fulfill the 
                    purposes outlined in this Privacy Policy, unless a longer retention period is 
                    required or permitted by law.
                  </p>
                  <p>When we no longer need your personal information, we will securely delete or anonymize it.</p>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
                <div className="prose prose-gray max-w-none">
                  <p>Depending on your location, you may have certain rights regarding your personal information:</p>
                  <ul>
                    <li><strong>Access:</strong> Request access to your personal information</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                    <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
                    <li><strong>Restriction:</strong> Request restriction of processing</li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us at privacy@shopscanner.com. We will 
                    respond to your request within 30 days.
                  </p>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    We use cookies and similar tracking technologies to collect and track information 
                    about your usage of our Service. Cookies are small data files stored on your device.
                  </p>
                  <p>We use cookies for:</p>
                  <ul>
                    <li>Authentication and session management</li>
                    <li>User preferences and settings</li>
                    <li>Analytics and performance monitoring</li>
                    <li>Security and fraud prevention</li>
                  </ul>
                  <p>
                    You can control cookies through your browser settings. However, disabling cookies 
                    may affect the functionality of our Service.
                  </p>
                </div>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
                <div className="prose prose-gray max-w-none">
                  <p>Our Service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties.</p>
                  <p>Third-party services we use include:</p>
                  <ul>
                    <li>Stripe for payment processing</li>
                    <li>Google Analytics for usage analytics</li>
                    <li>Cloud storage providers</li>
                    <li>Social media platforms (for sharing features)</li>
                  </ul>
                  <p>Please review the privacy policies of these third-party services before using them.</p>
                </div>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Your information may be transferred to and processed in countries other than your 
                    country of residence. These countries may have different data protection laws than 
                    your country.
                  </p>
                  <p>
                    When we transfer your information internationally, we ensure appropriate safeguards 
                    are in place to protect your privacy and rights.
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Children's Privacy</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Our Service is not intended for children under the age of 13. We do not knowingly 
                    collect personal information from children under 13. If we become aware that we 
                    have collected personal information from a child under 13, we will take steps to 
                    delete such information.
                  </p>
                  <p>
                    If you are a parent or guardian and believe your child has provided us with personal 
                    information, please contact us immediately.
                  </p>
                </div>
              </section>

              {/* Changes to Privacy Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    changes by posting the new Privacy Policy on this page and updating the "Last 
                    updated" date.
                  </p>
                  <p>
                    For material changes, we will provide more prominent notice, such as email 
                    notification or in-app notices.
                  </p>
                  <p>
                    You are advised to review this Privacy Policy periodically for any changes. 
                    Changes to this Privacy Policy are effective when they are posted on this page.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    If you have any questions about this Privacy Policy or our privacy practices, 
                    please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="space-y-2">
                      <p><strong>Shop Scanner LLC</strong></p>
                      <p><strong>Privacy Officer</strong></p>
                      <p>Email: privacy@shopscanner.com</p>
                      <p>Address: 123 Tech Street, San Francisco, CA 94105</p>
                      <p>Phone: (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 p-6 bg-primary-50 rounded-xl border border-primary-200">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-primary-900 mb-1">
                  Your Privacy Matters
                </h3>
                <p className="text-sm text-primary-700">
                  We are committed to protecting your privacy and being transparent about our data practices. 
                  If you have any questions or concerns about how we handle your information, please don't 
                  hesitate to contact our privacy team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}