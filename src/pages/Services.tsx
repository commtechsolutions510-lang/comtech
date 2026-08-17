import { motion } from 'framer-motion';
import { ServiceCard } from '../components/ServiceCard';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { SectionHeading } from '../components/SectionHeading';
import { services } from '../data/services';
import { CTASection } from '../components/CTASection';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export function Services() {
  return (
    <div>
      <section className="bg-[#F5F7FA] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-white text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              Services
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F3A] tracking-tight">
              Our Services
            </h1>
            <p className="mt-6 text-lg text-[#172033] max-w-3xl leading-relaxed">
              Commtech Solutions provides a comprehensive range of services beyond product retail, including IT solutions, telecommunications, and agency banking.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div key={service.id} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Our Work"
            title="Services in Action"
            subtitle="A look at our operations and customer service environment."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              '/images/company/services-service-1.jpeg',
              '/images/company/services-service-2.jpeg',
              '/images/company/services-service-3.jpeg',
              '/images/company/services-service-4.jpeg',
              '/images/company/services-service-5.jpeg',
              '/images/company/whatsapp-8.jpeg',
            ].map((src, index) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm"
              >
                <ImageWithFallback
                  src={src}
                  alt={`Commtech Solutions service ${index + 1}`}
                  className="w-full h-full object-cover"
                  fallback="/images/company/placeholder.jpg"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
