import React from 'react';
import { FileText, Calendar, User, Shield } from 'lucide-react';

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
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
                    Welcome to Shop Scanner ("we," "our," or "us"). These Terms of Service ("Terms") 
                    govern your use of our mobile application and web platform (collectively, the "Service") 
                    operated by Shop Scanner LLC.
                  </p>
                  <p>
                    By accessing or using our Service, you agree to be bound by these Terms. If you 
                    disagree with any part of these terms, then you may not access the Service.
                  </p>
                </div>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Shop Scanner provides product authenticity verification and price comparison services. 
                    Our Service includes:
                  </p>
                  <ul>
                    <li>Barcode scanning and product identification</li>
                    <li>Authenticity scoring based on store analysis</li>
                    <li>Price comparison across multiple platforms</li>
                    <li>Wishlist and product tracking features</li>
                    <li>Premium subscription services</li>
                  </ul>
                </div>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    To access certain features of the Service, you must register for an account. When you 
                    create an account, you must provide information that is accurate, complete, and current 
                    at all times.
                  </p>
                  <p>
                    You are responsible for safeguarding the password and for all activities that occur 
                    under your account. You must immediately notify us of any unauthorized uses of your 
                    account or any other breaches of security.
                  </p>
                </div>
              </section>

              {/* Subscription Services */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription Services</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Some parts of the Service are offered for a fee on a subscription basis ("Premium Services"). 
                    You will be billed in advance on a recurring basis (monthly or annually).
                  </p>
                  <p>
                    A valid payment method is required to process the payment for your subscription. 
                    You shall provide accurate and complete billing information including name, address, 
                    telephone number, and valid payment method information.
                  </p>
                  <p>
                    Subscriptions automatically renew unless cancelled before the renewal date. You may 
                    cancel your subscription at any time through your account settings.
                  </p>
                </div>
              </section>

              {/* Free Tier Limitations */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Free Tier Limitations</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Free accounts are subject to usage limitations including but not limited to:
                  </p>
                  <ul>
                    <li>Limited number of product scans per month</li>
                    <li>Limited access to advanced authenticity features</li>
                    <li>Basic price comparison functionality</li>
                    <li>Standard customer support</li>
                  </ul>
                  <p>
                    We reserve the right to modify these limitations at any time with reasonable notice.
                  </p>
                </div>
              </section>

              {/* User Conduct */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Conduct</h2>
                <div className="prose prose-gray max-w-none">
                  <p>You agree not to use the Service to:</p>
                  <ul>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others</li>
                    <li>Transmit any harmful or malicious content</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use automated tools to scrape or access the Service</li>
                    <li>Interfere with the proper functioning of the Service</li>
                  </ul>
                </div>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    The Service and its original content, features, and functionality are and will remain the 
                    exclusive property of Shop Scanner LLC and its licensors. The Service is protected by 
                    copyright, trademark, and other laws.
                  </p>
                  <p>
                    You may not reproduce, distribute, modify, or create derivative works of our content 
                    without our express written permission.
                  </p>
                </div>
              </section>

              {/* Data and Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data and Privacy</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Your privacy is important to us. Please review our Privacy Policy, which also governs 
                    your use of the Service, to understand our practices.
                  </p>
                  <p>
                    By using our Service, you consent to the collection and use of information in accordance 
                    with our Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    The information provided by Shop Scanner is for general informational purposes only. 
                    While we strive to provide accurate authenticity scores and price information, we make 
                    no representations or warranties of any kind, express or implied, about the completeness, 
                    accuracy, reliability, or suitability of the information.
                  </p>
                  <p>
                    THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES 
                    OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    IN NO EVENT SHALL SHOP SCANNER LLC, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE 
                    FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
                    WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES.
                  </p>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    We may terminate or suspend your account and bar access to the Service immediately, 
                    without prior notice or liability, under our sole discretion, for any reason whatsoever 
                    and without limitation, including but not limited to a breach of the Terms.
                  </p>
                  <p>
                    If you wish to terminate your account, you may simply discontinue using the Service 
                    or contact us to request account deletion.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any 
                    time. If a revision is material, we will provide at least 30 days notice prior to any 
                    new terms taking effect.
                  </p>
                  <p>
                    What constitutes a material change will be determined at our sole discretion. By 
                    continuing to access or use our Service after any revisions become effective, you 
                    agree to be bound by the revised terms.
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    These Terms shall be interpreted and governed by the laws of the State of California, 
                    without regard to its conflict of law provisions. Our failure to enforce any right or 
                    provision of these Terms will not be considered a waiver of those rights.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="space-y-2">
                      <p><strong>Shop Scanner LLC</strong></p>
                      <p>Email: legal@shopscanner.com</p>
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
                  Legal Notice
                </h3>
                <p className="text-sm text-primary-700">
                  These Terms of Service constitute a legally binding agreement between you and Shop Scanner LLC. 
                  Please read them carefully and contact us if you have any questions before using our Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}