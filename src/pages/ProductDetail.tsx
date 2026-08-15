import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingCart, MessageCircle } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { api } from '../lib/api';
import type { Product } from '../types';
import { company } from '../data/company';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api.get(`/products/${slug}`)
      .then((data) => {
        setProduct(data);
        setSelectedVariant(data.variants?.[0]?.id || '');
        return api.get(`/products?category=${data.categorySlug}&limit=4`);
      })
      .then((data) => {
        const related = data.products.filter((p: Product) => p.slug !== slug).slice(0, 3);
        setRelatedProducts(related);
      })
      .catch(() => setRelatedProducts([]))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you are looking for does not exist or may have been removed.</p>
        <Button to="/products">Back to Products</Button>
      </div>
    );
  }

  const basePrice = product.basePrice ?? 0;
  const salePrice = product.salePrice ?? 0;
  const stockQuantity = product.stockQuantity ?? 0;
  const hasVariants = product.variants && product.variants.length > 0;
  const isOutOfStock = stockQuantity <= 0;
  const images = product.images && product.images.length > 0 ? product.images : [{ url: product.image }];

  const handleAddToCart = () => {
    const variantId = hasVariants ? selectedVariant : undefined;
    const event = new CustomEvent('add-to-cart', { detail: { productId: product.id, variantId } });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#F5F7FA] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Link to="/products" className="inline-flex items-center text-sm text-[#1677FF] hover:text-[#0f6ae7] mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-white text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] tracking-tight">
              {product.name}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-sm"
            >
              <img
                src={images[0]?.url || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {salePrice > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  SALE
                </span>
              )}
              {isOutOfStock && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full">
                  OUT OF STOCK
                </span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                {salePrice > 0 && (
                  <span className="text-lg font-bold text-red-500">GH₵{salePrice.toFixed(2)}</span>
                )}
              </div>
              {salePrice > 0 && (
                <p className="text-sm text-gray-400 line-through">GH₵{basePrice.toFixed(2)}</p>
              )}
              {salePrice <= 0 && basePrice > 0 && (
                <p className="text-xl font-bold text-[#1677FF] mt-1">GH₵{basePrice.toFixed(2)}</p>
              )}

              <p className="mt-4 text-sm text-gray-500">
                {isOutOfStock ? (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                ) : (
                  <span className="text-green-600 font-medium">In Stock ({stockQuantity} available)</span>
                )}
              </p>

              <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

              {hasVariants && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Select Option</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants!.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => variant.id && setSelectedVariant(variant.id)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          selectedVariant === variant.id
                            ? 'border-[#1677FF] bg-[#F3F8FF] text-[#0B1F3A]'
                            : 'border-[#E5E7EB] text-[#172033] hover:border-gray-300'
                        }`}
                      >
                        {variant.value}
                        {variant.price && <span className="ml-1 text-xs text-gray-500">(+GH₵{variant.price.toFixed(2)})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#E5E7EB] rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 hover:bg-[#F5F7FA] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-[#172033]" />
                    </button>
                    <span className="px-4 text-sm font-medium text-[#172033]">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(stockQuantity || 99, q + 1))}
                      disabled={quantity >= (stockQuantity || 99)}
                      className="p-2.5 hover:bg-[#F5F7FA] transition-colors disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-[#172033]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  size="lg"
                  className="flex-1"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <WhatsAppButton
                  phone={company.whatsapp}
                  message={`Hello Commtech Solutions, I am interested in the ${product.name}. Please provide more information and availability.`}
                  size="lg"
                  className="flex-1 justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enquire on WhatsApp
                </WhatsAppButton>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedProducts.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
