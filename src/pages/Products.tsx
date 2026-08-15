import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { ProductFilter } from '../components/ProductFilter';
import { EmptyState } from '../components/EmptyState';
import { products } from '../data/products';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = !selectedCategory || product.categorySlug === selectedCategory;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query) ||
        (product.keywords && product.keywords.some((k) => k.toLowerCase().includes(query)));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-[#F5F7FA] text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              Products
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

      {/* Products Grid */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[#172033] font-medium">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold shadow-sm"
            >
              Filter & Sort
            </button>
          </div>

          {showFilters && (
            <div className="lg:hidden mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <ProductFilter
                selectedCategory={selectedCategory}
                onCategoryChange={(slug) => {
                  handleCategoryChange(slug);
                  setShowFilters(false);
                }}
                searchQuery={searchQuery}
                onSearchChange={(query) => setSearchQuery(query)}
                productCount={filteredProducts.length}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24 border border-[#E5E7EB]">
                <ProductFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  productCount={filteredProducts.length}
                />
              </div>
            </aside>

            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <EmptyState
                  title="No products found"
                  description="Try adjusting your search or filter to find what you are looking for."
                  actionText="View All Products"
                  actionTo="/products"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product, index) => (
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
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
