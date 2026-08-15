import type { Location } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { Button } from './Button';

interface Props {
  location: Location;
}

export function LocationCard({ location }: Props) {
  return (
    <div className="flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={location.image}
          alt={location.name}
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col flex-1 p-6">
        <span className="text-xs font-semibold text-commtech-600 uppercase tracking-wide mb-2">
          {location.type === 'head-office' ? 'Head Office' : 'Retail Outlet'}
        </span>
        <h3 className="text-xl font-bold text-gray-900">{location.name}</h3>
        <p className="mt-2 text-sm text-gray-600 flex-1">{location.description}</p>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location.address}
          </p>
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {location.phone}
          </p>
        </div>
        <div className="flex gap-3 mt-5">
          <Button href={location.mapUrl} variant="outline" size="sm" external className="flex-1">
            Get Directions
          </Button>
          <Button to={`/locations/${location.slug}`} variant="primary" size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
