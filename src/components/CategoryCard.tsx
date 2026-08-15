import type { Category } from '../types';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  category: Category;
}

export function CategoryCard({ category }: Props) {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={category.image}
          alt={category.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-commtech-700 transition-colors">
          {category.name}
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-1">
          {category.description}
        </p>
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-commtech-700 group-hover:text-commtech-800">
          View Products
          <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
