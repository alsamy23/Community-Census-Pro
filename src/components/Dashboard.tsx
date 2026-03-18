import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Sparkles,
  ArrowRight
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

      {/* Welcome Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-brand-200"
      >
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-3">Welcome back, {role === 'admin' ? 'Administrator' : 'Community Leader'}!</h2>
          <p className="text-brand-100 text-lg leading-relaxed mb-6">
            Your community has grown by <span className="text-white font-bold">2.5%</span> this month. 
            There are currently <span className="text-white font-bold">{stats?.totalPopulation || 0}</span> active participants across <span className="text-white font-bold">{stats?.villageCounts.length || 0}</span> villages.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.href = '/villages'}
              className="bg-white text-brand-700 px-6 py-2.5 rounded-xl font-bold hover:bg-brand-50 transition-colors"
            >
              Explore Villages
            </button>
            <button 
              onClick={() => window.location.href = '/members'}
              className="bg-brand-700/30 border border-brand-400/30 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700/50 transition-colors backdrop-blur-sm"
            >
              View All Members
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
          <Activity size={300} className="translate-x-1/4 -translate-y-1/4" />
        </div>
      </motion.div>

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-brand-100 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-brand-100/50"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles size={160} />
            </div>
            <div className="flex items-center gap-3 text-brand-600 font-bold mb-6 text-xl">
              <div className="p-2 bg-brand-50 rounded-lg">
                <Sparkles size={24} />
              </div>
              <h3>AI Community Analysis</h3>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed bg-brand-50/50 p-6 rounded-2xl border border-brand-50">
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

      {/* Recent Activity Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity size={24} className="text-brand-600" />
            Recent Activity
          </h3>
          <button className="text-brand-600 text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="space-y-6">
          {[
            { id: 1, type: 'member_added', name: 'Rahul Sharma', location: 'Green Valley', time: '2 hours ago' },
            { id: 2, type: 'village_added', name: 'Sunshine Puram', location: 'New Entry', time: '5 hours ago' },
            { id: 3, type: 'member_deleted', name: 'Elena Gilbert', location: 'Blue River', time: '1 day ago' },
          ].map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 group">
              <div className={cn(
                "p-3 rounded-2xl transition-all group-hover:scale-110",
                activity.type === 'member_added' ? "bg-green-50 text-green-600" : 
                activity.type === 'village_added' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
              )}>
                {activity.type === 'member_added' ? <Users size={20} /> : 
                 activity.type === 'village_added' ? <MapPin size={20} /> : <Activity size={20} />}
              </div>
              <div className="flex-1">
                <p className="text-slate-900 font-semibold">
                  {activity.type === 'member_added' ? 'New member added: ' : 
                   activity.type === 'village_added' ? 'New village registered: ' : 'Member record removed: '}
                  <span className="text-brand-700">{activity.name}</span>
                </p>
                <p className="text-slate-500 text-sm">{activity.location} • {activity.time}</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-1" />
            </div>
          ))}
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
