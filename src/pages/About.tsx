import { motion } from 'framer-motion';
import { SectionHeading } from '../components/SectionHeading';
import { ImageGallery } from '../components/ImageGallery';
import { CTASection } from '../components/CTASection';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Button } from '../components/Button';
import { locations } from '../data/locations';
import { company } from '../data/company';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#F5F7FA] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-white text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F3A] tracking-tight">
              About Commtech Solutions
            </h1>
            <p className="mt-6 text-lg text-[#172033] leading-relaxed max-w-3xl">
              {company.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <SectionHeading
                title="What Commtech Solutions does"
                subtitle="We provide a comprehensive range of technology products, telecommunications solutions, electronics, accessories, and financial agency services."
              />
              <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Commtech Solutions is dedicated to making technology and connectivity accessible to everyone. Whether you need storage and memory products, cables and adapters, power and charging solutions, audio and video equipment, or networking devices, we have you covered.
                </p>
                <p>
                  Beyond retail, we also provide IT and telecommunications solutions, as well as agency banking services through multiple trusted banking partners. Our goal is to be your one-stop destination for all technology and everyday needs.
                </p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-[#F5F7FA]">
              <ImageWithFallback
                src="/images/company/whatsapp-3.jpeg"
                alt="Commtech Solutions team"
                className="w-full h-full object-cover"
                fallback="/images/company/placeholder.jpg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center">
              <div className="overflow-hidden rounded-xl bg-[#F5F7FA] aspect-square">
                <ImageWithFallback
                  src="/images/company/whatsapp-4.jpeg"
                  alt="Commtech Solutions team"
                  className="w-full h-full object-cover"
                  fallback="/images/company/placeholder.jpg"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1677FF]">Leadership</p>
                <h3 className="mt-2 text-2xl font-bold text-[#0B1F3A]">Driven by service, powered by innovation</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Our leadership and team are committed to delivering dependable technology, trusted service, and long-term customer relationships across every Commtech location.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we do sections */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: 'Technology & Electronics',
                description: 'From SanDisk memory cards and laptop chargers to Anycast dongles, Android TV boxes, gaming consoles, and phone accessories, we stock a wide range of electronics for everyday use.',
              },
              {
                title: 'Telecommunications & Networking',
                description: 'We provide WiFi adapters, Bluetooth dongles, LAN cables, HDMI cables, and other connectivity products to keep you connected.',
              },
              {
                title: 'Customer Service',
                description: 'Our team is focused on helping you find the right products and solutions. We provide guidance, support, and reliable after-sales service.',
              },
              {
                title: 'Agency Banking',
                description: 'Through our agency banking services, we offer convenient financial services including cash deposits, withdrawals, and bill payments through trusted banking partners.',
              },
            ].map((item, index) => (
              <motion.div key={item.title} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Gallery"
            title="Our Spaces"
            subtitle="A glimpse into our retail environment."
          />
          <div className="mt-12">
            <ImageGallery
              images={[
                { src: '/images/company/whatsapp-1.jpeg', alt: 'Commtech Solutions store' },
                { src: '/images/company/whatsapp-2.jpeg', alt: 'Commtech Solutions interior' },
                { src: '/images/company/whatsapp-4.jpeg', alt: 'Commtech Solutions team' },
                { src: '/images/company/whatsapp-6.jpeg', alt: 'Commtech Solutions business' },
                { src: '/images/company/whatsapp-7.jpeg', alt: 'Commtech Solutions operations' },
                { src: '/images/company/locations-location-1.jpeg', alt: 'Commtech Solutions location' },
                { src: '/images/company/locations-location-2.jpeg', alt: 'Commtech Solutions outlet' },
                { src: '/images/company/locations-location-3.jpeg', alt: 'Commtech Solutions retail outlet' },
              ]}
              columns={3}
            />
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Locations"
            title="Where to Find Us"
            subtitle="Visit any of our retail outlets or contact our head office."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <motion.div key={location.id} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="bg-white p-6 rounded-xl shadow-sm h-full">
                  <h3 className="text-lg font-bold text-gray-900">{location.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{location.address}</p>
                  <p className="mt-2 text-sm text-gray-600">{location.phone}</p>
                  <div className="mt-4">
                    <Button to={`/locations/${location.slug}`} variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
