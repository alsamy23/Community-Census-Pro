import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Plus, 
  Trash2, 
  Phone, 
  Briefcase, 
  Calendar,
  User,
  ArrowLeft,
  Filter,
  X,
  Search,
  Download,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import { Village, Member } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function VillageDetail() {
  const { role } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [village, setVillage] = useState<Village | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'stats'>('directory');
  
  const [newMember, setNewMember] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    phone: '',
    occupation: '',
    address: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [villageData, membersData] = await Promise.all([
        dataService.getVillage(id),
        dataService.getMembers(id)
      ]);
      setVillage(villageData);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.addMember({ ...newMember, village_id: id, age: Number(newMember.age) });
      fetchData();
      setShowAddModal(false);
      setNewMember({ full_name: '', age: '', gender: 'Male', phone: '', occupation: '', address: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMember = async (mid: string) => {
    if (role !== 'admin') return;
    if (confirm('Delete this member?')) {
      await dataService.deleteMember(mid);
      fetchData();
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  const genderData = [
    { name: 'Male', value: members.filter(m => m.gender === 'Male').length },
    { name: 'Female', value: members.filter(m => m.gender === 'Female').length },
    { name: 'Other', value: members.filter(m => m.gender === 'Other').length },
  ].filter(d => d.value > 0);

  const ageGroups = [
    { name: '0-18', value: members.filter(m => m.age <= 18).length },
    { name: '19-35', value: members.filter(m => m.age > 18 && m.age <= 35).length },
    { name: '36-60', value: members.filter(m => m.age > 35 && m.age <= 60).length },
    { name: '60+', value: members.filter(m => m.age > 60).length },
  ].filter(d => d.value > 0);

  const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b'];

  const handleMessage = (phone: string, name?: string) => {
    if (!phone) {
      alert("No phone number available for this member.");
      return;
    }
    // Format phone number (remove non-digits)
    const formattedPhone = phone.replace(/\D/g, '');
    const message = name ? `Hello ${name}, this is from CensusPro.` : 'Hello, this is from CensusPro.';
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessageAll = () => {
    const phones = members.map(m => m.phone).filter(p => !!p);
    if (phones.length === 0) {
      alert("No members have phone numbers in this village.");
      return;
    }
    
    // In a real app, this might open a bulk messaging portal.
    // For now, we'll inform the user and maybe provide a copy-list.
    const phoneList = phones.join(', ');
    if (confirm(`Messaging ${phones.length} members. (Note: Multi-recipient WhatsApp requires a business API). \n\nRecipients: ${phoneList}\n\nDo you want to copy the numbers to clipboard?`)) {
      navigator.clipboard.writeText(phoneList);
      alert("Phone numbers copied to clipboard.");
    }
  };

  const downloadCSV = () => {
    const headers = ['Full Name', 'Age', 'Gender', 'Phone', 'Occupation', 'Address'];
    const rows = members.map(m => [
      m.full_name,
      m.age,
      m.gender,
      m.phone,
      m.occupation,
      m.address.replace(/,/g, ' ')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${village.name}_census_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center">Loading village details...</div>;
  if (!village) return <div className="p-8 text-center">Village not found.</div>;

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate('/villages')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Villages</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
              <MapPin size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{village.name}</h1>
              <p className="text-slate-500 mt-1">{village.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-sm font-semibold">
                  <Users size={16} />
                  {members.length} Members
                </div>
                <div className="text-slate-400 text-sm">
                  Created on {new Date(village.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleMessageAll}
              className="flex items-center justify-center gap-2 border border-brand-200 text-brand-600 px-6 py-3 rounded-2xl font-bold transition-all hover:bg-brand-50"
            >
              <MessageSquare size={20} />
              <span>Message All</span>
            </button>
            <button 
              onClick={downloadCSV}
              className="flex items-center justify-center gap-2 border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold transition-all hover:bg-slate-50"
            >
              <Download size={20} />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand-200"
            >
              <Plus size={20} />
              <span>Add Member</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('directory')}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${
            activeTab === 'directory' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Member Directory
          {activeTab === 'directory' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${
            activeTab === 'stats' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Village Insights
          {activeTab === 'stats' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
          )}
        </button>
      </div>

      {activeTab === 'directory' ? (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, occupation..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-bold bg-brand-50 px-4 py-2 rounded-xl transition-all"
              >
                <Plus size={18} />
                <span>New Member</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <User size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleMessage(member.phone, member.full_name)}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                      title="Send WhatsApp Message"
                    >
                      <MessageCircle size={18} />
                    </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900">{member.full_name}</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={14} />
                    <span>{member.age} years • {member.gender}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} />
                    <span>{member.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase size={14} />
                    <span>{member.occupation || 'Unspecified'}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Address</p>
                  <p className="text-sm text-slate-600 line-clamp-1">{member.address || 'No address provided.'}</p>
                </div>
              </motion.div>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No members found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <PieChartIcon className="text-brand-600" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Gender Distribution</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <BarChartIcon className="text-brand-600" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Age Demographics</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageGroups}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
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
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Add New Member</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                  <input 
                    required
                    type="number" 
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Age"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                  <select 
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="+1 234 567 890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Occupation</label>
                  <input 
                    type="text" 
                    value={newMember.occupation}
                    onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Job title"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                  <textarea 
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[80px]"
                    placeholder="Detailed address..."
                  />
                </div>
                
                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
                  >
                    Save Member
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
