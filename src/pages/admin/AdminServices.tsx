import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import type { AdminService } from '../../types';

interface ServiceFormData {
  title: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  features: string[];
}

const emptyForm: ServiceFormData = {
  title: '',
  slug: '',
  description: '',
  icon: '',
  image: '',
  features: [],
};

export function AdminServices() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.get<AdminService[]>('/services');
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (service: AdminService) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      slug: service.slug,
      description: service.description,
      icon: service.icon,
      image: service.image || '',
      features: service.features,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingService) {
        await adminApi.patch(`/services/${editingService.id}`, formData);
      } else {
        await adminApi.post('/services', formData);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await adminApi.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your services</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors">
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No services found</td></tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                          <span className="text-lg">{service.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{service.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{service.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(service)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-slate-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-red-600">
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
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">{editingService ? 'Edit Service' : 'Add Service'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                    <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.features.join(', ')}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value.split(',').map(f => f.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
