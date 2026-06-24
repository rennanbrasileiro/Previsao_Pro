import { useState } from 'react';
import { Plus, Edit, Trash2, Building2, MapPin, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAPI, apiPost, apiPut, apiDelete, formatNumber } from '../hooks/useAPI';

interface Condominio {
  id: number;
  nome: string;
  cnpj?: string;
  tipo: 'residencial' | 'comercial' | 'misto';
  endereco?: string;
  area_total_m2: number;
  created_at: string;
  ativo: boolean;
}

export default function Condominios() {
  const [showModal, setShowModal] = useState(false);
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    tipo: 'comercial' as 'residencial' | 'comercial' | 'misto',
    endereco: '',
    area_total_m2: ''
  });

  const { data: condominios, loading, refetch } = useAPI<Condominio[]>('/api/condominios');

  const handleOpenCreate = () => {
    setEditingCondominio(null);
    setFormData({
      nome: '',
      cnpj: '',
      tipo: 'comercial',
      endereco: '',
      area_total_m2: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (condominio: Condominio) => {
    setEditingCondominio(condominio);
    setFormData({
      nome: condominio.nome,
      cnpj: condominio.cnpj || '',
      tipo: condominio.tipo,
      endereco: condominio.endereco || '',
      area_total_m2: condominio.area_total_m2.toString()
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        area_total_m2: parseFloat(formData.area_total_m2),
        ativo: true
      };

      if (editingCondominio) {
        await apiPut(`/api/condominios/${editingCondominio.id}`, data);
      } else {
        await apiPost('/api/condominios', data);
      }

      setShowModal(false);
      refetch();
    } catch (error) {
      console.error('Erro ao salvar condomínio:', error);
      alert('Erro ao salvar condomínio');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este condomínio? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await apiDelete(`/api/condominios/${id}`);
      refetch();
    } catch (error) {
      console.error('Erro ao excluir condomínio:', error);
      alert('Erro ao excluir condomínio');
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'residencial': return 'bg-blue-100 text-blue-800';
      case 'comercial': return 'bg-green-100 text-green-800';
      case 'misto': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Condomínios</h1>
            <p className="text-slate-600">Gerencie todos os seus condomínios</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Condomínio</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Lista de Condomínios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {condominios?.map((condominio, index) => (
            <motion.div
              key={condominio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{condominio.nome}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getTipoColor(condominio.tipo)}`}>
                      {condominio.tipo.charAt(0).toUpperCase() + condominio.tipo.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {condominio.cnpj && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <span className="font-semibold">CNPJ:</span>
                    <span>{condominio.cnpj}</span>
                  </div>
                )}

                {condominio.endereco && (
                  <div className="flex items-start space-x-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{condominio.endereco}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  <Calculator className="w-4 h-4 text-slate-600" />
                  <span className="font-semibold text-slate-900">
                    {formatNumber(condominio.area_total_m2)} m²
                  </span>
                  <span className="text-slate-500">de área total</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenEdit(condominio)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(condominio.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!loading && (!condominios || condominios.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-12 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum condomínio cadastrado</h3>
          <p className="text-slate-600 mb-6">Comece criando seu primeiro condomínio</p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Primeiro Condomínio</span>
          </button>
        </motion.div>
      )}

      {/* Modal de Criar/Editar */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {editingCondominio ? 'Editar Condomínio' : 'Novo Condomínio'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nome do Condomínio *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Edifício Souza Melo Tower"
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      required
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="residencial">Residencial</option>
                      <option value="comercial">Comercial</option>
                      <option value="misto">Misto</option>
                    </select>
                  </div>

                  {/* CNPJ */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>

                  {/* Área Total */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Área Total (m²) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.area_total_m2}
                      onChange={(e) => setFormData({ ...formData, area_total_m2: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="3511.31"
                    />
                  </div>

                  {/* Endereço */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Endereço Completo
                    </label>
                    <textarea
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Av. Eng. Domingos Ferreira, 1967 - Boa Viagem - Recife-PE"
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {editingCondominio ? 'Salvar Alterações' : 'Criar Condomínio'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
