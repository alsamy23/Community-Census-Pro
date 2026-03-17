import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Sparkles
} from 'lucide-react';
// ... rest of imports
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Stats } from '../types';
import { getCommunityInsights } from '../services/aiService';
import { dataService } from '../services/dataService';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dataService.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    if (!stats || role !== 'admin') return;
    setGeneratingInsights(true);
    const text = await getCommunityInsights(stats);
    setInsights(text || '');
    setGeneratingInsights(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Community Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time overview of your community census data.</p>
        </div>
        {role === 'admin' && (
          <button 
            onClick={generateAIInsights}
            disabled={generatingInsights}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-brand-200 disabled:opacity-50"
          >
            {generatingInsights ? (
              <Activity className="animate-spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            <span>{generatingInsights ? 'Analyzing...' : 'Get AI Insights'}</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Population" 
          value={stats?.totalPopulation || 0} 
          icon={Users} 
          trend="+2.5%" 
          trendUp={true}
          color="brand"
        />
        <StatCard 
          title="Villages" 
          value={stats?.villageCounts.length || 0} 
          icon={MapPin} 
          trend="Active" 
          trendUp={true}
          color="blue"
        />
        <StatCard 
          title="Avg. Household" 
          value="4.2" 
          icon={TrendingUp} 
          trend="-0.4%" 
          trendUp={false}
          color="amber"
        />
        <StatCard 
          title="Growth Rate" 
          value="1.8%" 
          icon={Activity} 
          trend="+0.2%" 
          trendUp={true}
          color="violet"
        />
      </div>

      {/* AI Insights Section */}
      <AnimatePresence>
        {insights && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-50 border border-brand-100 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={120} />
            </div>
            <div className="flex items-center gap-2 text-brand-700 font-bold mb-3">
              <Sparkles size={20} />
              <h3>AI Community Insights</h3>
            </div>
            <div className="prose prose-sm max-w-none text-brand-900/80">
              <Markdown>{insights}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Village Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-brand-600" />
            Village Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.villageCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender & Age Distribution */}
        <div className="grid grid-cols-1 gap-8">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Gender Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.genderStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="gender"
                  >
                    {stats?.genderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {stats?.genderStats.map((entry, index) => (
                  <div key={entry.gender} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                    <span className="text-sm text-slate-600">{entry.gender} ({entry.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  const colorClasses: any = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", colorClasses[color])}>
          <Icon size={24} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trendUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
        )}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
    </motion.div>
  );
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
