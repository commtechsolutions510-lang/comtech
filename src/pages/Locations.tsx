import { motion } from 'framer-motion';
import { LocationCard } from '../components/LocationCard';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { api } from '../lib/api';
import { useEffect, useState } from 'react';
import type { Location } from '../types';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await api.get<Location[]>('/locations');
        setLocations(data);
      } catch {
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div>
      <section className="bg-[#F5F7FA] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-3 py-1.5 mb-4 text-[10px] sm:text-xs font-semibold tracking-wider uppercase bg-white text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
                Locations
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F3A] tracking-tight">
                Our Locations
              </h1>
              <p className="mt-6 text-lg text-[#172033] max-w-3xl leading-relaxed">
                Visit any of our retail outlets or contact our head office for all your technology and service needs.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg"
            >
              <ImageWithFallback
                src="/images/company/locations-location-1.jpeg"
                alt="Commtech Solutions location"
                className="w-full h-full object-cover"
                fallback="/images/company/placeholder.jpg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-gray-500">Loading locations...</div>
          ) : locations.length === 0 ? (
            <div className="text-center text-gray-500">No locations available yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location, index) => (
                <motion.div key={location.id} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <LocationCard location={location} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
