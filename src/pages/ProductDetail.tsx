import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { ProductCard } from '../components/ProductCard';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { Button } from '../components/Button';
import { products } from '../data/products';
import { company } from '../data/company';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you are looking for does not exist or may have been removed.</p>
        <Button to="/products">Back to Products</Button>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
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

      {/* Product Details */}
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
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="mt-2 text-sm text-commtech-600 font-medium">{product.category}</p>
              <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

              {product.variants && product.variants.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Available Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(product.variants.map((v) => v.label))).map((label) => (
                      <span key={label} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded-lg border border-gray-200">
                        {label}: {product.variants!.filter((v) => v.label === label).map((v) => v.value).join(', ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <WhatsAppButton
                  phone={company.whatsapp}
                  message={`Hello Commtech Solutions, I am interested in the ${product.name}. Please provide more information and availability.`}
                  size="lg"
                >
                  Enquire About This Product
                </WhatsAppButton>
                <Button to="/products" variant="outline" size="lg">
                  Back to Products
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Related"
              title="You May Also Like"
              subtitle="Other products in the same category."
            />
            <div className="mt-8 overflow-x-auto pb-2">
              <div className="flex gap-4 md:gap-6 min-w-max snap-x snap-mandatory">
                {relatedProducts.map((p, index) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-[85vw] max-w-[320px] sm:w-[300px] snap-start shrink-0"
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
