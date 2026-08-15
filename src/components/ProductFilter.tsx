import { categories } from '../data/categories';

interface Props {
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  productCount: number;
}

export function ProductFilter({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  productCount,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-[#0B1F3A] mb-2">
          Search Products
        </label>
        <div className="relative">
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, category, or keyword..."
            className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] bg-white rounded-lg text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:border-transparent"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="mt-2 text-sm text-[#1677FF] hover:text-[#0f6ae7]"
          >
            Clear search
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0B1F3A] mb-2">
          Categories
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-[#1677FF] text-white'
                : 'text-[#172033] hover:bg-[#F5F7FA]'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-[#1677FF] text-white'
                  : 'text-[#172033] hover:bg-[#F5F7FA]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Showing {productCount} product{productCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
