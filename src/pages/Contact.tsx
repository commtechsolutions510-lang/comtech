import { motion } from 'framer-motion';
import { SectionHeading } from '../components/SectionHeading';
import { ContactForm } from '../components/ContactForm';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { company } from '../data/company';

export function Contact() {
  return (
    <div>
      <section className="bg-[#F5F7FA] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-white text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              Contact
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F3A] tracking-tight">
              Contact Commtech Solutions
            </h1>
            <p className="mt-6 text-lg text-[#172033] max-w-3xl leading-relaxed">
              Have a question or need assistance? Reach out to us through any of the channels below.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <SectionHeading
                title="Send Us a Message"
                subtitle="Fill out the form and we will get back to you as soon as possible."
                align="left"
              />
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
            <div>
              <SectionHeading
                title="Get In Touch"
                subtitle="You can also reach us directly through the following channels."
                align="left"
              />
              <div className="mt-8 space-y-6">
                <div className="flex items-start bg-white p-6 rounded-xl shadow-sm">
                  <svg className="w-6 h-6 text-commtech-600 mr-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Phone</h3>
                    <p className="mt-1 text-gray-600">{company.phone}</p>
                  </div>
                </div>

                <div className="flex items-start bg-white p-6 rounded-xl shadow-sm">
                  <svg className="w-6 h-6 text-commtech-600 mr-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Email</h3>
                    <p className="mt-1 text-gray-600">{company.email}</p>
                  </div>
                </div>

                <div className="flex items-start bg-white p-6 rounded-xl shadow-sm">
                  <svg className="w-6 h-6 text-commtech-600 mr-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Address</h3>
                    <p className="mt-1 text-gray-600">{company.address}</p>
                    <a href="https://www.ghanapostgps.com/map/#GE2707367" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-sm text-[#1677FF] hover:text-[#0f6ae7]">
                      View on Map (GE-270-7367)
                    </a>
                  </div>
                </div>

                <div className="pt-4">
                  <WhatsAppButton phone={company.whatsapp} size="lg">
                    Chat on WhatsApp
                  </WhatsAppButton>
                </div>
              </div>

              <div className="mt-8 relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                <ImageWithFallback
                  src="/images/company/whatsapp-5.jpeg"
                  alt="Commtech Solutions contact"
                  className="w-full h-full object-cover"
                  fallback="/images/company/placeholder.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
