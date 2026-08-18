import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, Package, ArrowUpDown, X, Save } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import type { AdminProduct } from '../../types';

interface InventoryRow {
  productId: string;
  productName: string;
  category: string;
  image: string;
  variantId?: string;
  variantLabel?: string;
  stock: number;
  status: string;
}

export function AdminInventory() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState<InventoryRow | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const productsData = await adminApi.get<{ data: AdminProduct[] }>('/products?limit=100');
      const inventoryRows: InventoryRow[] = [];
      for (const p of productsData.data) {
        if (p.variants && p.variants.length > 0) {
          for (const v of p.variants) {
            const optionValues = v.optionValues || [];
            const label = optionValues.map(ov => `${ov.option.name}: ${ov.value}`).join(', ') || 'Default';
            const stock = v.stock || 0;
            const status = v.isActive === false ? 'inactive' : stock === 0 ? 'out_of_stock' : stock < 10 ? 'low_stock' : 'active';
            inventoryRows.push({
              productId: p.id,
              productName: p.name,
              category: p.category,
              image: p.image,
              variantId: v.id,
              variantLabel: label,
              stock,
              status,
            });
          }
        } else {
          const status = p.status === 'inactive' ? 'inactive' : p.stock === 0 ? 'out_of_stock' : p.stock < 10 ? 'low_stock' : 'active';
          inventoryRows.push({
            productId: p.id,
            productName: p.name,
            category: p.category,
            image: p.image,
            stock: p.stock,
            status,
          });
        }
      }
      setRows(inventoryRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const lowStockRows = rows.filter(r => r.status === 'low_stock' || r.status === 'out_of_stock');
  const filteredRows = rows.filter(r =>
    r.productName.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    (r.variantLabel && r.variantLabel.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRow) return;
    setSaving(true);
    try {
      await adminApi.post(`/inventory/adjust`, {
        productId: selectedRow.productId,
        variantId: selectedRow.variantId,
        quantity: parseInt(adjustmentQuantity) || 0,
        reason: adjustmentReason,
      });
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      setSelectedRow(null);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="mt-1 text-sm text-gray-500">Track and manage stock levels</p>
      </div>

      {lowStockRows.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStockRows.slice(0, 10).map((row) => (
              <div key={`${row.productId}-${row.variantId || 'base'}`} className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-100">
                <div className="flex items-center gap-3">
                  <img src={row.image} alt={row.productName} className="w-8 h-8 rounded object-cover bg-gray-100" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{row.productName}</p>
                    <p className="text-xs text-gray-500">{row.variantLabel || row.category}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${row.stock === 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                  {row.stock === 0 ? 'Out of Stock' : `${row.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or variants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
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
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No inventory found</td></tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={`${row.productId}-${row.variantId || 'base'}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={row.image} alt={row.productName} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <p className="font-medium text-gray-900">{row.productName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.variantLabel || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.category}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${row.stock === 0 ? 'text-red-600' : row.stock < 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {row.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 'active' ? 'bg-green-100 text-green-800' :
                        row.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                        row.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setSelectedRow(row); setAdjustmentQuantity(''); setAdjustmentReason(''); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {selectedRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedRow(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-xl shadow-xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Adjust Stock</h2>
                <button onClick={() => setSelectedRow(null)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedRow.productName}</p>
                    <p className="text-sm text-gray-500">{selectedRow.variantLabel || selectedRow.category} — Current stock: {selectedRow.stock}</p>
                  </div>
                </div>
                <form onSubmit={handleAdjustStock} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Adjustment</label>
                    <input
                      type="number"
                      value={adjustmentQuantity}
                      onChange={(e) => setAdjustmentQuantity(e.target.value)}
                      required
                      placeholder="Enter quantity (positive or negative)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      type="text"
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      required
                      placeholder="e.g., restock, sale, return"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Adjust Stock'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
