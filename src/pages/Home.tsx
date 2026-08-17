import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, Headphones, CreditCard } from 'lucide-react';
import { api } from '../lib/api';
import { SectionHeading } from '../components/SectionHeading';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ServiceCard } from '../components/ServiceCard';
import { LocationCard } from '../components/LocationCard';
import { CTASection } from '../components/CTASection';
import { Button } from '../components/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useEffect, useState } from 'react';
import type { Category, Service, Location, Product, Settings, Company } from '../types';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, servicesData, locationsData, productsData, settingsData] = await Promise.all([
          api.get<Category[]>('/categories'),
          api.get<Service[]>('/services'),
          api.get<Location[]>('/locations'),
          api.get<{ data: Product[] }>('/products?limit=20'),
          api.get<Settings>('/settings'),
        ]);
        setCategories(categoriesData || []);
        setServices(servicesData || []);
        setLocations(locationsData || []);
        setFeaturedProducts((productsData?.data || []).filter((p) => p.featured).slice(0, 6));
        setCompany(settingsData?.company || null);
      } catch {
        setCategories([]);
        setServices([]);
        setLocations([]);
        setFeaturedProducts([]);
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
      <section className="relative overflow-hidden bg-[#0B1F3A]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(22,119,255,0.20),_transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="order-2 lg:order-1">
              <span className="inline-block px-3 py-1.5 mb-4 text-[10px] sm:text-xs font-semibold tracking-wider uppercase bg-white/10 text-[#DDEBFF] rounded-full border border-white/10">
                Welcome to Commtech Solutions
              </span>
              <h1 className="text-[clamp(2.1rem,7vw,3.5rem)] font-bold text-white tracking-tight leading-[1.08] max-w-xl">
                Technology, Connectivity & <span className="text-[#1677FF]">Everyday Solutions</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
                {company?.description || 'Your one-stop shop for technology products and everyday solutions.'}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button to="/products" size="lg" className="w-full sm:w-auto shadow-lg shadow-[#1677FF]/25 py-3.5 sm:py-4">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button to="/contact" variant="primary" size="lg" className="w-full sm:w-auto bg-[#1677FF] text-white hover:bg-[#0f6ae7] shadow-lg shadow-[#1677FF]/25 py-3.5 sm:py-4">
                  Contact Us
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-1 lg:order-2"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <ImageWithFallback
                  src="/images/company/whatsapp-1.jpeg"
                  alt="Commtech Solutions - Technology and connectivity"
                  className="w-full h-full object-cover"
                  fallback="/images/company/placeholder.jpg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <SectionHeading
                label="About Commtech"
                title="Technology and connectivity made accessible."
                subtitle="Commtech Solutions is a trusted provider of IT, telecommunications, electronics, accessories, and financial agency services. We are committed to delivering quality products and reliable services to individuals and businesses."
              />
              <p className="mt-6 text-gray-600 leading-relaxed">
                From storage and memory to networking equipment, gaming consoles to agency banking, we provide a comprehensive range of technology products and services under one roof.
              </p>
              <div className="mt-8">
                <Button to="/about">Learn More About Us</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Our Range"
            title="Product Categories"
            subtitle="Explore our wide selection of technology products and accessories."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div key={category.id} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button to="/products">View All Products</Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Featured"
            title="Featured Products"
            subtitle="Handpicked products from our catalogue."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div key={product.id} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button to="/products">Explore All Products</Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="What We Offer"
            title="Our Services"
            subtitle="More than just products. Commtech Solutions provides technology, telecommunications, and financial services."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service, index) => (
              <motion.div key={service.id} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button to="/services">View All Services</Button>
          </div>
        </div>
      </section>

      {/* Why Choose Commtech */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Why Us"
            title="Why Choose Commtech Solutions"
            subtitle="We are committed to providing quality products, reliable services, and a convenient customer experience."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Wide Product Range', description: 'A comprehensive selection of technology products and accessories.' },
              { icon: Shield, title: 'Trusted Quality', description: 'We source quality products you can rely on for personal and business use.' },
              { icon: Headphones, title: 'Customer-Focused Service', description: 'Dedicated support to help you find the right solutions.' },
              { icon: CreditCard, title: 'Agency Banking', description: 'Convenient financial services through multiple banking partners.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                custom={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-commtech-50 text-commtech-700 rounded-xl mb-4">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Image Section */}
      <section className="py-16 md:py-24 bg-commtech-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl"
            >
              <ImageWithFallback
                src="/images/company/whatsapp-4.jpeg"
                alt="Commtech Solutions store interior"
                className="w-full h-full"
                fallback="/images/company/placeholder.jpg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Technology and connectivity made accessible.
              </h2>
              <p className="mt-6 text-commtech-100 leading-relaxed">
                From the latest smartphones and laptop chargers to networking equipment and agency banking services, Commtech Solutions is your one-stop destination for technology products and everyday solutions.
              </p>
              <p className="mt-4 text-commtech-100 leading-relaxed">
                Visit any of our retail outlets or get in touch with us to explore our full catalogue.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <WhatsAppButton phone={company?.whatsapp || ''} variant="secondary">
                  Chat on WhatsApp
                </WhatsAppButton>
                <Button to="/locations" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Find a Location
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Visit Us"
            title="Our Locations"
            subtitle="Find a Commtech Solutions outlet near you."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <motion.div key={location.id} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <LocationCard location={location} />
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button to="/locations">View All Locations</Button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <CTASection />
    </div>
  );
}