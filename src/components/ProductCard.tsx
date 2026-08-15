import type { Product } from '../types';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback';
import { Button } from './Button';
import { WhatsAppButton } from './WhatsAppButton';
import { company } from '../data/company';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  return (
    <div className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <Link to={`/products/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <span className="text-[10px] sm:text-xs font-semibold text-[#1677FF] uppercase tracking-wide mb-2">
          {product.category}
        </span>
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-base sm:text-lg font-bold text-[#0B1F3A] group-hover:text-[#1677FF] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-[#172033] line-clamp-2 flex-1 leading-relaxed">
          {product.shortDescription}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button to={`/products/${product.slug}`} variant="outline" size="sm" className="w-full sm:flex-1 text-sm sm:text-sm">
            View Product
          </Button>
          <WhatsAppButton
            phone={company.whatsapp}
            message={`Hello Commtech Solutions, I am interested in the ${product.name}. Please provide more information and availability.`}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
}
