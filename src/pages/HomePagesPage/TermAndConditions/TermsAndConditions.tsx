import { motion } from "framer-motion";

export default function TermsAndConditions() {
  return (
    <section className="bg-white py-20 px-6 lg:px-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
        </motion.div>

        {/* Intro */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 text-gray-700 leading-relaxed text-md sm:text-lg"
        >
          Welcome to{" "}
          <span className="font-semibold">
            Beesee Global Technologies Inc.
          </span>
          . These Terms and Conditions (“Terms”) outline the rules, obligations,
          and rights when using our website, products, and services. By
          accessing or using our services, you accept these Terms in full. If
          you do not agree, please discontinue use immediately.
        </motion.p>

        {/* Sections */}
        <div className="space-y-12">
          {/* 1. Definitions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Definitions
            </h2>
            <p className="text-gray-700 leading-relaxed text-md sm:text-lg">
              - “Company”, “We”, “Our”, or “Us” refers to Beesee Global
              Technologies Inc. <br />
              - “You” or “User” means the individual, company, or organization
              using our services. <br />
              - “Services” refers to all digital platforms, solutions, and
              products offered by Beesee Global Technologies Inc.
            </p>
          </motion.div>

          {/* 2. Acceptance of Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-loose text-md sm:text-lg">
              By using our services, you acknowledge that you have read,
              understood, and agree to comply with these Terms and Conditions.
              If you represent an organization, you confirm that you are
              authorized to bind that entity.
            </p>
          </motion.div>

          {/* 3. User Responsibilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. User Responsibilities
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 text-md sm:text-lg">
              <li>Provide accurate and up-to-date information when registering.</li>
              <li>Maintain confidentiality of your login credentials.</li>
              <li>
                Use our services only for lawful and authorized purposes.
              </li>
              <li>Refrain from misusing, hacking, or disrupting our systems.</li>
            </ul>
          </motion.div>

          {/* 4. Purchases & Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Purchases & Payments
            </h2>
            <p className="text-gray-700 leading-relaxed text-md sm:text-lg">
              All fees, prices, and payment terms are clearly indicated at the
              time of purchase. You agree to pay all applicable charges using a
              valid payment method. Transactions are final unless otherwise
              specified in our refund policy.
            </p>
          </motion.div>

          {/* 5. Intellectual Property Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Intellectual Property Rights
            </h2>
            <p className="text-gray-700 leading-relaxed text-md sm:text-lg">
              All designs, code, trademarks, and digital assets are the
              intellectual property of Beesee Global Technologies Inc. You may
              not copy, modify, distribute, or resell our intellectual property
              without prior written consent.
            </p>
          </motion.div>

          {/* 6. Limitation of Liability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed text-md sm:text-lg">
              To the maximum extent allowed by law, Beesee Global Technologies
              Inc. is not responsible for indirect, incidental, or consequential
              damages resulting from your use of our services, including but not
              limited to financial losses, data breaches, or system downtime.
            </p>
          </motion.div>

          {/* 7. Termination of Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Termination of Access
            </h2>
            <p className="text-gray-700 leading-relaxed text-md sm:text-lg">
              We may suspend or permanently terminate your access to our
              services if you breach these Terms, engage in fraudulent
              activities, or pose a risk to our platform and other users.
            </p>
          </motion.div>

          {/* 8. Governing Law & Jurisdiction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Governing Law & Jurisdiction
            </h2>
            <p className="text-gray-700 leading-relaxed text-md sm:text-lg">
              These Terms are governed by the laws of [Insert Country /
              Jurisdiction]. Any disputes shall be resolved exclusively in the
              courts of that jurisdiction.
            </p>
          </motion.div>

          {/* 9. Updates to Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Updates to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed text-md sm:text-lg">
              We may update these Terms periodically. Any changes will be
              effective immediately upon posting on our website. Continued use
              of our services constitutes acceptance of the revised Terms.
            </p>
          </motion.div>
 
        </div>
      </div>
    </section>
  );
}
