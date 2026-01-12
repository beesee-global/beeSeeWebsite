import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <section className="bg-white py-20 px-6 lg:px-20">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Privacy Policy
          </h1> 
        </motion.div>

        {/* Intro */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-black leading-relaxed text-md sm:text-lg"
        >
          At <span className="font-semibold text-black">Beesee Global Technologies Inc.</span>, 
          we value your privacy and are committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your 
          information when you use our website, services, and products. Please read 
          this policy carefully to understand our practices.
        </motion.p>

        {/* Sections */}
        <div className="space-y-12">
          {/* 1. Information We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-black leading-relaxed mb-4 text-md sm:text-lg">
              We may collect the following types of information from you:
            </p>
            <ul className="list-disc pl-6 text-black space-y-2 text-md sm:text-lg">
              <li><strong>Personal Information:</strong> such as your name, email address, phone number, billing details, and shipping address.</li>
              <li><strong>Account Information:</strong> username, password, and preferences when you register with us.</li>
              <li><strong>Usage Data:</strong> information about how you use our website, apps, and services, including IP address, browser type, and device information.</li>
              <li><strong>Cookies & Tracking Data:</strong> to improve user experience and analyze traffic patterns.</li>
            </ul>
          </motion.div>

          {/* 2. How We Use Your Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-black leading-relaxed mb-4 text-md sm:text-lg">
              We use the collected information for purposes including:
            </p>
            <ul className="list-disc pl-6 text-black space-y-2 text-md sm:text-lg">
              <li>Providing and maintaining our services.</li>
              <li>Processing transactions and delivering products.</li>
              <li>Improving customer support and communication.</li>
              <li>Sending marketing, promotions, or updates (with your consent).</li>
              <li>Analyzing website and service performance.</li>
              <li>Complying with legal obligations and preventing fraud.</li>
            </ul>
          </motion.div>

          {/* 3. Sharing Your Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Sharing Your Information
            </h2>
            <p className="text-black leading-relaxed mb-4 text-md sm:text-lg">
              We do not sell or rent your personal data. However, we may share it with:
            </p>
            <ul className="list-disc pl-6 text-black space-y-2 text-md sm:text-lg">
              <li><strong>Service Providers:</strong> third parties that help us operate our business (payment processors, shipping partners, IT support).</li>
              <li><strong>Legal Compliance:</strong> when required by law, regulation, or legal request.</li>
              <li><strong>Business Transfers:</strong> in case of mergers, acquisitions, or sale of assets.</li>
            </ul>
          </motion.div>

          {/* 4. Data Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Data Security
            </h2>
            <p className="text-black leading-relaxed text-md sm:text-lg">
              We implement appropriate technical and organizational security 
              measures to protect your personal data. However, no method of 
              transmission over the internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </motion.div>

          {/* 5. Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Your Rights
            </h2>
            <p className="text-black leading-relaxed mb-4 text-md sm:text-lg">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-black space-y-2 text-md sm:text-lg">
              <li>Right to access, update, or delete your data.</li>
              <li>Right to withdraw consent at any time.</li>
              <li>Right to opt out of marketing communications.</li>
              <li>Right to request a copy of the personal data we hold about you.</li>
            </ul>
          </motion.div>

          {/* 6. Cookies Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Cookies Policy
            </h2>
            <p className="text-black leading-relaxed text-md sm:text-lg">
              Our website uses cookies to enhance user experience, analyze traffic, 
              and personalize content. You may disable cookies in your browser, but 
              some parts of our website may not function properly as a result.
            </p>
          </motion.div>

          {/* 7. Children's Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Children's Privacy
            </h2>
            <p className="text-black leading-relaxed text-md sm:text-lg">
              Our services are not directed to individuals under 13 years of age. 
              We do not knowingly collect personal data from children. If we learn 
              that we have collected information from a child, we will delete it promptly.
            </p>
          </motion.div>

          {/* 8. Changes to This Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Changes to This Privacy Policy
            </h2>
            <p className="text-black leading-relaxed text-md sm:text-lg">
              We may update this Privacy Policy from time to time to reflect 
              changes in technology, laws, or our business practices. Updates 
              will be posted on this page with a revised effective date.
            </p>
          </motion.div>

          {/* 9. Data Privacy Act of 2012 (RA 10173) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Compliance with the Data Privacy Act of 2012 (RA 10173)
            </h2>

            <p className="text-black leading-relaxed mb-4 text-md sm:text-lg">
              In compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>, 
              we are committed to protecting any personal information you provide. All data collected 
              through this website and our systems will be used solely for legitimate business, 
              verification, and administrative purposes.
            </p>

            <ul className="list-disc pl-6 text-black space-y-3 text-md sm:text-lg">
              <li>
                Your personal information is kept strictly confidential and is accessed only by
                authorized personnel.
              </li>
              <li>
                No personal data will be shared, sold, or disclosed to third parties without your
                explicit consent, unless required by law, court order, or government regulation.
              </li>
              <li>
                We implement appropriate <strong>organizational, physical, and technical security measures</strong>
                to protect your data from unauthorized access, alteration, disclosure, or loss.
              </li>
              <li>
                Your data is processed fairly and lawfully in accordance with the Data Privacy Act
                of 2012 (RA 10173) and applicable regulations of the National Privacy Commission (NPC).
              </li>
              <li>
                You will be notified in the event of a personal data breach that may compromise your
                rights or privacy, in accordance with NPC breach notification guidelines.
              </li>
              <li>
                Personal data is retained only for as long as necessary to fulfill its intended
                purpose or to comply with legal and regulatory requirements.
              </li>
            </ul>

            <p className="mt-4 text-black leading-relaxed text-md sm:text-lg">
              By using our services, you acknowledge that you understand and agree to the collection,
              processing, and storage of your personal data in accordance with the Data Privacy Act
              of 2012 (RA 10173).
            </p>
          </motion.div>


          {/* 10. Contact Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Contact Us
            </h2>
            <p className="text-black leading-relaxed text-md sm:text-lg">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-4 text-black text-md sm:text-lg">
              <strong>Beesee Global Technologies Inc.</strong> <br />
              info@beese.ph <br />
              [65-D Scout Borromeo, South Triangle, Quezon City]
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
