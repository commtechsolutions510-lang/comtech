import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { api } from '../lib/api';
import type { Category, Product } from '../types';
import { products as staticProducts } from '../data/products';

type SortOption = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name';

export function Shop() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const limit = 12;

  useEffect(() => {
    api.get('/categories')
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', limit.toString());
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy === 'price_asc') params.set('sort', 'price_asc');
    else if (sortBy === 'price_desc') params.set('sort', 'price_desc');
    else if (sortBy === 'name') params.set('sort', 'name');

    api.get(`/products?${params.toString()}`)
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.pages);
      })
      .catch(() => {
        const filtered = staticProducts.filter((p) => {
          if (selectedCategory && p.categorySlug !== selectedCategory) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.shortDescription.toLowerCase().includes(q)
            );
          }
          return true;
        });
        const sorted = [...filtered];
        if (sortBy === 'price_asc') sorted.sort((a, b) => ((a.salePrice ?? a.basePrice) || 0) - ((b.salePrice ?? b.basePrice) || 0));
        else if (sortBy === 'price_desc') sorted.sort((a, b) => ((b.salePrice ?? b.basePrice) || 0) - ((a.salePrice ?? a.basePrice) || 0));
        else if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(sorted);
        setTotal(sorted.length);
        setTotalPages(1);
      })
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery, sortBy, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const filteredCount = useMemo(() => {
    if (!searchQuery && !selectedCategory) return total;
    return products.length;
  }, [searchQuery, selectedCategory, products, total]);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-[#F5F7FA] text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              Shop
            </span>
            <h1 className="text-[clamp(2rem,8vw,3rem)] font-bold text-[#0B1F3A] tracking-tight leading-tight">
              Our Products
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#172033] max-w-2xl leading-relaxed">
              Browse our complete catalogue of technology products, accessories, and everyday electronics.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[#172033] font-medium">
              Showing {filteredCount} product{filteredCount !== 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter & Sort
            </button>
          </div>

          {showFilters && (
            <div className="lg:hidden mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <FilterPanel
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={(slug) => {
                  setSelectedCategory(slug);
                  setShowFilters(false);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                productCount={filteredCount}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24 border border-[#E5E7EB]">
                <FilterPanel
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  productCount={filteredCount}
                />
              </div>
            </aside>

            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  title="No products found"
                  description="Try adjusting your search or filter to find what you are looking for."
                  actionText="View All Products"
                  actionTo="/products"
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <span className="text-sm text-gray-600 px-4">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FilterPanelProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
}

function FilterPanel({ categories, selectedCategory, onCategoryChange, searchQuery, onSearchChange, sortBy, onSortChange, productCount }: FilterPanelProps) {
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
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
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
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full px-4 py-3 border border-[#E5E7EB] bg-white rounded-lg text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:border-transparent"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
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
