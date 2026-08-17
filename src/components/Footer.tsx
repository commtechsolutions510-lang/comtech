import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { services } from '../data/services';
import { company } from '../data/company';
import { WhatsAppButton } from './WhatsAppButton';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1F3A] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-bold text-white">Commtech Solutions</h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Technology, Connectivity & Everyday Solutions. Your trusted partner for IT, telecommunications, electronics, and agency banking services.
            </p>
            <div className="mt-6">
              <WhatsAppButton phone={company.whatsapp} variant="outline" size="sm">
                Chat on WhatsApp
              </WhatsAppButton>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-slate-300 hover:text-[#1677FF] transition-colors">About Us</Link></li>
              <li><Link to="/products" className="text-sm text-slate-300 hover:text-[#1677FF] transition-colors">Products</Link></li>
              <li><Link to="/services" className="text-sm text-slate-300 hover:text-[#1677FF] transition-colors">Services</Link></li>
              <li><Link to="/locations" className="text-sm text-slate-300 hover:text-[#1677FF] transition-colors">Locations</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-300 hover:text-[#1677FF] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Products</h4>
            <ul className="space-y-3">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link to={`/products?category=${category.slug}`} className="text-sm text-slate-300 hover:text-[#1677FF] transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.id}>
                  <Link to={`/services#${service.slug}`} className="text-sm text-slate-300 hover:text-[#1677FF] transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mt-8 mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>{company.phone}</li>
              <li>{company.email}</li>
              <li>{company.address}</li>
              <li>
                <a href="https://www.ghanapostgps.com/map/#GE2707367" target="_blank" rel="noopener noreferrer" className="text-[#1677FF] hover:text-[#0f6ae7]">
                  View on Map (GE-270-7367)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} Commtech Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
