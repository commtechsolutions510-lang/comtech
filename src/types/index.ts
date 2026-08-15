export interface Company {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  image: string;
  featured?: boolean;
  variants?: ProductVariant[];
  keywords?: string[];
}

export interface ProductVariant {
  label: string;
  value: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  hours: string;
  mapUrl: string;
  image: string;
  type: 'head-office' | 'retail';
}
