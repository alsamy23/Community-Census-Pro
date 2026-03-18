import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Search, ChevronRight, Trash2, Users, Map } from 'lucide-react';
import { Village } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';

const STATES = [
  'Maharashtra',
  'Tamil Nadu',
  'Karnataka',
  'Gujarat',
  'Delhi',
  'Kerala'
];

export default function VillageList() {
  const { role } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVillage, setNewVillage] = useState({ state: 'Maharashtra', name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All');

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      const data = await dataService.getVillages();
      setVillages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.addVillage(newVillage);
      fetchVillages();
      setShowAddModal(false);
      setNewVillage({ state: 'Maharashtra', name: '', description: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (role !== 'admin') return;
    if (confirm('Are you sure you want to delete this village? All member data will be lost.')) {
      await dataService.deleteVillage(id);
      fetchVillages();
    }
  };

  const filteredVillages = selectedStateFilter === 'All' 
    ? villages 
    : villages.filter(v => v.state === selectedStateFilter);

  const uniqueStates = ['All', ...Array.from(new Set(villages.map(v => v.state)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Villages</h1>
          <p className="text-slate-500">Manage community villages and their populations.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
        >
          <Plus size={20} />
          <span>Add Village</span>
        </button>
      </div>

      {/* State Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {uniqueStates.map(state => (
            <button
              key={state}
              onClick={() => setSelectedStateFilter(state)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedStateFilter === state 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">
          Total Population: <span className="text-brand-600">{filteredVillages.reduce((acc, v) => acc + v.member_count, 0)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVillages.map((village) => (
          <motion.div 
            key={village.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <MapPin size={24} />
              </div>
              <button 
                onClick={() => handleDelete(village.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                <Map size={12} />
                {village.state || 'Unknown State'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{village.name}</h3>
            <p className="text-slate-500 text-sm mt-1 line-clamp-2 min-h-[40px]">
              {village.description || 'No description provided.'}
            </p>
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Users size={18} />
                <span className="text-sm font-semibold">{village.member_count} Members</span>
              </div>
              <Link 
                to={`/villages/${village.id}`}
                className="flex items-center gap-1 text-brand-600 font-bold text-sm hover:gap-2 transition-all"
              >
                View Details
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}
        
        {filteredVillages.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No villages found in this state.</p>
          </div>
        )}
      </div>

      {/* Add Village Modal */}
      <AnimatePresence>
        {showAddModal && role === 'admin' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative z-10"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Village</h2>
              <form onSubmit={handleAddVillage} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                  <select 
                    value={newVillage.state}
                    onChange={(e) => setNewVillage({ ...newVillage, state: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  >
                    {STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Village Name</label>
                  <input 
                    required
                    type="text" 
                    value={newVillage.name}
                    onChange={(e) => setNewVillage({ ...newVillage, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="e.g. Green Valley"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea 
                    value={newVillage.description}
                    onChange={(e) => setNewVillage({ ...newVillage, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[100px]"
                    placeholder="Brief description of the village..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all shadow-sm shadow-brand-200"
                  >
                    Create Village
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
