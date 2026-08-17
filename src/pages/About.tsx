import { motion } from 'framer-motion';
import { SectionHeading } from '../components/SectionHeading';
import { ImageGallery } from '../components/ImageGallery';
import { CTASection } from '../components/CTASection';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Button } from '../components/Button';
import { api } from '../lib/api';
import { useEffect, useState } from 'react';
import type { Location, Settings, Company } from '../types';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export function About() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsData, settingsData] = await Promise.all([
          api.get<Location[]>('/locations'),
          api.get<Settings>('/settings'),
        ]);
        setLocations(locationsData || []);
        setCompany(settingsData?.company || null);
      } catch {
        setLocations([]);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <p className="mt-6 text-lg text-[#172033] max-w-3xl leading-relaxed">
              {company?.description || 'Commtech Solutions is a trusted provider of IT, telecommunications, electronics, accessories, and financial agency services.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <SectionHeading
                label="Our Story"
                title="Committed to quality and service."
                subtitle="Commtech Solutions is a trusted provider of IT, telecommunications, electronics, accessories, and financial agency services. We are committed to delivering quality products and reliable services to individuals and businesses."
              />
              <p className="mt-6 text-gray-600 leading-relaxed">
                From storage and memory to networking equipment, gaming consoles to agency banking, we provide a comprehensive range of technology products and services under one roof.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg"
            >
              <ImageWithFallback
                src="/images/company/team.jpg"
                alt="Commtech Solutions team"
                className="w-full h-full object-cover"
                fallback="/images/company/placeholder.jpg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Leadership"
            title="Meet Our Leadership"
            subtitle="The team driving Commtech Solutions forward."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'CEO Name', role: 'Chief Executive Officer', image: '/images/company/ceo.jpg' },
              { name: 'COO Name', role: 'Chief Operating Officer', image: '/images/company/team.jpg' },
              { name: 'CFO Name', role: 'Chief Financial Officer', image: '/images/company/team.jpg' },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                custom={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <ImageWithFallback src={member.image} alt={member.name} className="w-full h-64 object-cover" fallback="/images/company/placeholder.jpg" />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
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
            title="Our Operations"
            subtitle="A glimpse into our daily operations and customer service."
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
              ]}
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