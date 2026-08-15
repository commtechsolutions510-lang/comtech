import { Button } from './Button';
import { WhatsAppButton } from './WhatsAppButton';
import { company } from '../data/company';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryText?: string;
  primaryTo?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryTo?: string;
  showWhatsApp?: boolean;
}

export function CTASection({
  title = 'Ready to get started?',
  subtitle = 'Contact Commtech Solutions today for all your technology, telecommunications, and banking needs.',
  primaryText = 'Contact Us',
  primaryTo = '/contact',
  primaryHref,
  secondaryText = 'Explore Products',
  secondaryTo = '/products',
  showWhatsApp = true,
}: CTASectionProps) {
  return (
    <section className="bg-commtech-900 text-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
        <p className="mt-4 text-lg text-commtech-100 max-w-2xl mx-auto">{subtitle}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryHref ? (
            <Button href={primaryHref} variant="primary" size="lg" external>
              {primaryText}
            </Button>
          ) : (
            <Button to={primaryTo} variant="primary" size="lg">
              {primaryText}
            </Button>
          )}
          <Button to={secondaryTo} variant="outline" size="lg" className="border-white bg-transparent text-white hover:bg-white/10">
            {secondaryText}
          </Button>
          {showWhatsApp && (
            <WhatsAppButton phone={company.whatsapp} variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Chat on WhatsApp
            </WhatsAppButton>
          )}
        </div>
      </div>
    </section>
  );
}
