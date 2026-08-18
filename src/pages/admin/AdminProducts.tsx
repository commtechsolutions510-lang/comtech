import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Archive,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Save,
  Settings2,
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import type { AdminProduct, PaginatedResponse } from '../../types';

type SortField = 'name' | 'price' | 'stock' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface ProductFormData {
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  salePrice: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  image: string;
  description: string;
  sku: string;
}

interface OptionForm {
  id: string;
  name: string;
  values: { id: string; value: string }[];
}

interface VariantForm {
  id: string;
  sku: string;
  price: number;
  salePrice: number;
  stock: number;
  isActive: boolean;
  optionValueIds: string[];
}

const emptyForm: ProductFormData = {
  name: '',
  category: '',
  categorySlug: '',
  price: 0,
  salePrice: 0,
  stock: 0,
  status: 'active',
  featured: false,
  image: '',
  description: '',
  sku: '',
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function AdminProducts() {
  const [products, setProducts] = useState<PaginatedResponse<AdminProduct> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [options, setOptions] = useState<OptionForm[]>([]);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      params.set('sort', sortField);
      params.set('order', sortOrder);
      params.set('page', page.toString());
      const data = await adminApi.get<PaginatedResponse<AdminProduct>>(`/products?${params.toString()}`);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, sortField, sortOrder, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const buildVariantsFromOptions = (opts: OptionForm[]): VariantForm[] => {
    if (opts.length === 0) return [];
    const result: VariantForm[] = [];
    const recurse = (index: number, currentOptionValues: { optionId: string; optionValueId: string }[]) => {
      if (index === opts.length) {
        result.push({
          id: generateId(),
          sku: '',
          price: formData.price,
          salePrice: formData.salePrice,
          stock: 0,
          isActive: true,
          optionValueIds: currentOptionValues.map(cov => cov.optionValueId),
        });
        return;
      }
      const opt = opts[index];
      for (const val of opt.values) {
        recurse(index + 1, [...currentOptionValues, { optionId: opt.id, optionValueId: val.id }]);
      }
    };
    recurse(0, []);
    return result;
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setOptions([]);
    setVariants([]);
    setModalOpen(true);
  };

  const openEditModal = async (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      categorySlug: product.categorySlug,
      price: product.price,
      salePrice: product.salePrice || 0,
      stock: product.stock,
      status: product.status,
      featured: product.featured,
      image: product.image,
      description: product.description,
      sku: '',
    });
    const detail = await adminApi.get<any>(`/products/${product.id}`);
    const opts: OptionForm[] = (detail.options || []).map((o: any) => ({
      id: o.id,
      name: o.name,
      values: o.values.map((v: any) => ({ id: v.id, value: v.value })),
    }));
    setOptions(opts);
    const vars: VariantForm[] = (detail.variants || []).map((v: any) => ({
      id: v.id,
      sku: v.sku || '',
      price: v.price || 0,
      salePrice: v.salePrice || 0,
      stock: v.stock || 0,
      isActive: v.isActive !== false,
      optionValueIds: v.optionValues.map((ov: any) => ov.id),
    }));
    setVariants(vars);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        category: formData.category,
        categorySlug: formData.categorySlug,
        price: formData.price,
        salePrice: formData.salePrice || undefined,
        stock: formData.stock,
        status: formData.status,
        featured: formData.featured,
        image: formData.image,
        description: formData.description,
        sku: formData.sku || undefined,
      };

      if (options.length > 0) {
        payload.options = options.map(o => ({
          name: o.name,
          displayOrder: 0,
          values: o.values.map(v => ({ value: v.value, displayOrder: 0 })),
        }));
      }

      if (variants.length > 0) {
        payload.variants = variants.map(v => {
          const optionValues = v.optionValueIds.map(ovId => {
            for (const opt of options) {
              const val = opt.values.find(val => val.id === ovId);
              if (val) return { optionName: opt.name, value: val.value };
            }
            return null;
          }).filter(Boolean);

          return {
            sku: v.sku || undefined,
            price: v.price,
            salePrice: v.salePrice || undefined,
            stock: v.stock,
            isActive: v.isActive,
            displayOrder: 0,
            optionValues,
          };
        });
      }

      if (editingProduct) {
        await adminApi.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await adminApi.post('/products', payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await adminApi.patch(`/products/${id}/archive`);
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive product');
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const addOption = () => {
    setOptions([...options, { id: generateId(), name: '', values: [] }]);
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
  };

  const updateOption = (id: string, field: 'name' | 'values', value: any) => {
    setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const addOptionValue = (optionId: string) => {
    setOptions(options.map(o => {
      if (o.id !== optionId) return o;
      return { ...o, values: [...o.values, { id: generateId(), value: '' }] };
    }));
  };

  const removeOptionValue = (optionId: string, valueId: string) => {
    setOptions(options.map(o => {
      if (o.id !== optionId) return o;
      return { ...o, values: o.values.filter(v => v.id !== valueId) };
    }));
  };

  const updateOptionValue = (optionId: string, valueId: string, value: string) => {
    setOptions(options.map(o => {
      if (o.id !== optionId) return o;
      return { ...o, values: o.values.map(v => v.id === valueId ? { ...v, value } : v) };
    }));
  };

  const regenerateVariants = () => {
    const newVariants = buildVariantsFromOptions(options);
    const merged = newVariants.map(nv => {
      const existing = variants.find(v => v.optionValueIds.sort().join(',') === nv.optionValueIds.sort().join(','));
      return existing || nv;
    });
    setVariants(merged);
  };

  useEffect(() => {
    if (options.length > 0 && variants.length === 0) {
      regenerateVariants();
    }
  }, [options.length]);

  const updateVariant = (id: string, field: keyof VariantForm, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('price')}>Price <SortIcon field="price" /></th>
                <th className="px-4 py-3">Variants</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('stock')}>Stock <SortIcon field="stock" /></th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : products?.data.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
              ) : (
                products?.data.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">GH₵{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{product.variants?.length || 0} variants</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(product)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-slate-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleArchive(product.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-orange-600">
                          <Archive className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {products && products.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {products.page} of {products.totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(products.totalPages, p + 1))}
                disabled={page === products.totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Slug</label>
                    <input
                      type="text"
                      required
                      value={formData.categorySlug}
                      onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (GH₵)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (GH₵)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 text-slate-900 rounded border-gray-300 focus:ring-slate-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Options (e.g. Storage, Length, Voltage)</label>
                    <button type="button" onClick={addOption} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Plus className="w-4 h-4" /> Add Option
                    </button>
                  </div>
                  <div className="space-y-3">
                    {options.map((option) => (
                      <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="Option name (e.g. Storage)"
                            value={option.name}
                            onChange={(e) => updateOption(option.id, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                          />
                          <button type="button" onClick={() => removeOption(option.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {option.values.map((val) => (
                            <div key={val.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Value (e.g. 128GB)"
                                value={val.value}
                                onChange={(e) => updateOptionValue(option.id, val.id, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                              />
                              <button type="button" onClick={() => removeOptionValue(option.id, val.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addOptionValue(option.id)} className="text-sm text-slate-900 font-medium hover:underline">
                            + Add Value
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variants */}
                {variants.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">Variants</label>
                      <button type="button" onClick={regenerateVariants} className="text-sm text-slate-900 font-medium hover:underline flex items-center gap-1">
                        <Settings2 className="w-4 h-4" /> Regenerate
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                              {options.map(o => (
                                <th key={o.id} className="px-3 py-2 text-left">{o.name || 'Option'}</th>
                              ))}
                              <th className="px-3 py-2 text-left">SKU</th>
                              <th className="px-3 py-2 text-left">Price</th>
                              <th className="px-3 py-2 text-left">Sale Price</th>
                              <th className="px-3 py-2 text-left">Stock</th>
                              <th className="px-3 py-2 text-left">Active</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {variants.map((variant) => (
                              <tr key={variant.id}>
                                {variant.optionValueIds.map((ovId, idx) => {
                                  const opt = options[idx];
                                  const val = opt?.values.find(v => v.id === ovId);
                                  return (
                                    <td key={ovId} className="px-3 py-2">
                                      <input
                                        type="text"
                                        value={val?.value || ''}
                                        onChange={(e) => {
                                          const newOptions = [...options];
                                          const o = newOptions[idx];
                                          const v = o.values.find(v => v.id === ovId);
                                          if (v) { v.value = e.target.value; setOptions(newOptions); }
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                      />
                                    </td>
                                  );
                                })}
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={variant.sku}
                                    onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={variant.price}
                                    onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={variant.salePrice}
                                    onChange={(e) => updateVariant(variant.id, 'salePrice', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={variant.stock}
                                    onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={variant.isActive}
                                    onChange={(e) => updateVariant(variant.id, 'isActive', e.target.checked)}
                                    className="w-4 h-4 text-slate-900 rounded border-gray-300 focus:ring-slate-500"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
