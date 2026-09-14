import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axiosClient from '../api/axiosClient';
import { toast } from 'sonner';
import { Loader2, Users, ShieldCheck, Activity, HardDrive, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

export default function AdminDashboard() {
  useDocumentTitle('แดชบอร์ด - ผู้ดูแลระบบ');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(7);

  useEffect(() => {
    fetchStats(chartDays);
  }, [chartDays]);

  const fetchStats = async (days = 7) => {
    try {
      const res = await axiosClient.get(`/admin/dashboard-stats?days=${days}`);
      if (res.data.status === 'success') {
        setStats(res.data.data);
      } else {
        toast.error('ไม่สามารถดึงข้อมูลสถิติได้');
      }
    } catch (err) {
      toast.error('ไม่สามารถดึงข้อมูลสถิติได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
        <p className="text-[#cccccc] text-sm animate-pulse">กำลังโหลดข้อมูลเชิงลึก...</p>
      </div>
    );
  }

  const { 
    total_users = 0, 
    total_admins = 0, 
    downloads_chart = [], 
    documents_category_chart = [], 
    storage_category_chart = [] 
  } = stats || {};

  const totalDownloads = downloads_chart.reduce((acc, curr) => acc + (parseInt(curr.downloads) || 0), 0);
  const totalDocuments = documents_category_chart.reduce((acc, curr) => acc + (parseInt(curr.documents) || 0), 0);
  const totalStorage = storage_category_chart.reduce((acc, curr) => acc + (parseFloat(curr.size_mb) || 0), 0).toFixed(2);

  const COLORS = ['#2997ff', '#32d74b', '#ff9f0a', '#ff375f', '#bf5af2'];

  const chartConfig = {
    downloads: { label: "ดาวน์โหลด (ครั้ง)", color: "#2997ff" }, 
    documents: { label: "เอกสาร (ไฟล์)", color: "#32d74b" }, 
    storage: { label: "พื้นที่", color: "#ff9f0a" }, 
    size_mb: { label: "ขนาด (MB)", color: "#ff9f0a" },
    skyBlue: { label: "Sky Blue", color: "#2997ff" },
    green: { label: "Green", color: "#32d74b" },
    orange: { label: "Orange", color: "#ff9f0a" },
    pink: { label: "Pink", color: "#ff375f" },
    purple: { label: "Purple", color: "#bf5af2" },
  };

  const renderCustomLegend = (props) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-2 sm:pt-4 w-full px-2">
        {payload.map((entry, index) => (
          <div key={`legend-item-${index}`} className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px]" style={{ backgroundColor: entry.color }} />
            <span className="text-[10px] sm:text-xs md:text-sm text-[#cccccc] whitespace-nowrap">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#000000] min-h-screen pb-24 text-white font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl pt-16 md:pt-24 space-y-8 md:space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 md:gap-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">Overview</h1>
          <p className="text-[#cccccc] text-base md:text-lg">สถิติและภาพรวมของระบบคลังเอกสารในรอบ {chartDays} วันที่ผ่านมา</p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <Card className="bg-[#272729] border border-[#333333] shadow-none rounded-2xl min-w-0 outline-none focus:outline-none focus:ring-0">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 md:p-8 pb-2 space-y-0">
              <CardTitle className="text-sm font-medium tracking-tight text-[#cccccc]">ผู้ใช้งานทั้งหมด</CardTitle>
              <Users className="w-5 h-5 md:w-6 md:h-6 text-[#2997ff]" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 md:p-8 pt-0 sm:pt-0 md:pt-0">
              <div className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{total_users}</div>
              <p className="text-xs md:text-sm text-[#cccccc] mt-1 md:mt-2">บัญชีในระบบทั้งหมด</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#272729] border border-[#333333] shadow-none rounded-2xl min-w-0 outline-none focus:outline-none focus:ring-0">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 md:p-8 pb-2 space-y-0">
              <CardTitle className="text-sm font-medium tracking-tight text-[#cccccc]">ผู้ดูแลระบบ (Admin)</CardTitle>
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-[#2997ff]" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 md:p-8 pt-0 sm:pt-0 md:pt-0">
              <div className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{total_admins}</div>
              <p className="text-xs md:text-sm text-[#cccccc] mt-1 md:mt-2">สิทธิ์ระดับผู้ดูแลระบบ</p>
            </CardContent>
          </Card>

          <Card className="bg-[#272729] border border-[#333333] shadow-none rounded-2xl min-w-0 sm:col-span-2 md:col-span-1 outline-none focus:outline-none focus:ring-0">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 md:p-8 pb-2 space-y-0">
              <CardTitle className="text-sm font-medium tracking-tight text-[#cccccc]">ยอดดาวน์โหลดล่าสุด</CardTitle>
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-[#2997ff]" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 md:p-8 pt-0 sm:pt-0 md:pt-0">
              <div className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{totalDownloads}</div>
              <p className="text-xs md:text-sm text-[#cccccc] mt-1 md:mt-2">รวมในช่วง {chartDays} วันที่ผ่านมา</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          
          {/* Downloads Line Chart */}
          <Card className="bg-[#272729] border border-[#333333] shadow-none rounded-2xl col-span-1 lg:col-span-2 min-w-0 flex flex-col overflow-hidden outline-none focus:outline-none focus:ring-0">
            <CardHeader className="p-4 sm:p-6 md:p-8 border-b border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white">สถิติการดาวน์โหลด</CardTitle>
                <div className="inline-flex rounded-lg border border-[#444444] overflow-hidden shrink-0">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setChartDays(d)}
                      className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                        chartDays === d
                          ? 'bg-[#2997ff] text-white'
                          : 'bg-transparent text-[#cccccc] hover:bg-white/10'
                      } ${d !== 7 ? 'border-l border-[#444444]' : ''}`}
                    >
                      {d} วัน
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{totalDownloads}</span>
                <span className="text-sm md:text-base text-[#cccccc]">ครั้ง</span>
              </div>
              <CardDescription className="text-[#cccccc] mt-1 md:mt-2 text-sm md:text-base">ความเคลื่อนไหวการดาวน์โหลดเอกสารในรอบ {chartDays} วัน</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] sm:min-h-[400px] md:min-h-[450px] h-[300px] sm:h-[400px] md:h-[450px] p-4 sm:p-6 md:p-8 w-full min-w-0 min-h-0">
              <ChartContainer config={chartConfig} className="h-full w-full min-w-0 min-h-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none focus:outline-none">
                <AreaChart data={downloads_chart} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-downloads)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-downloads)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="full_date" 
                    stroke="#cccccc" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={12}
                    fontSize={11}
                    tickFormatter={(val) => {
                      if (!val) return '';
                      const date = new Date(val + 'T00:00:00');
                      if (isNaN(date.getTime())) return val;
                      if (chartDays === 7) {
                        return date.toLocaleDateString('th-TH', { weekday: 'short' });
                      }
                      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
                    }}
                  />
                  <YAxis 
                    stroke="#cccccc" 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                    fontSize={11} 
                  />
                  <ChartTooltip content={<ChartTooltipContent className="bg-[#000000] border-white/10 text-white" labelFormatter={(val) => {
                    if (!val) return '';
                    const date = new Date(val + 'T00:00:00');
                    if (isNaN(date.getTime())) return val;
                    return date.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                  }} />} />
                  <Area 
                    type="monotone" 
                    dataKey="downloads" 
                    stroke="var(--color-downloads)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorDownloads)" 
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Documents by Category Bar Chart */}
          <Card className="bg-[#272729] border border-[#333333] shadow-none rounded-2xl flex flex-col min-w-0 overflow-hidden outline-none focus:outline-none focus:ring-0">
            <CardHeader className="p-4 sm:p-6 md:p-8 border-b border-white/10">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white">จำนวนเอกสาร</CardTitle>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{totalDocuments}</span>
                <span className="text-sm md:text-base text-[#cccccc]">ไฟล์</span>
              </div>
              <CardDescription className="text-[#cccccc] mt-1 md:mt-2 text-sm md:text-base">สัดส่วนเอกสารทั้งหมดแยกตามหมวดหมู่</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px] sm:min-h-[400px] p-4 sm:p-6 md:p-8 flex-1 w-full min-w-0 min-h-0 flex flex-col">
              <ChartContainer config={chartConfig} className="flex-1 w-full min-w-0 min-h-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none focus:outline-none">
                <BarChart data={documents_category_chart} margin={{ top: 20, right: 0, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#cccccc" 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={12}
                    fontSize={11} 
                  />
                  <YAxis 
                    stroke="#cccccc" 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                    fontSize={11} 
                  />
                  <ChartTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<ChartTooltipContent className="bg-[#000000] border-white/10 text-white" />} />
                  <Legend 
                    verticalAlign="bottom"
                    content={renderCustomLegend}
                    payload={documents_category_chart.map((entry, index) => ({
                      value: entry.category,
                      color: COLORS[index % COLORS.length]
                    }))}
                  />
                  <Bar dataKey="documents" name="จำนวนเอกสาร (ไฟล์)" radius={[6, 6, 0, 0]}>
                    {documents_category_chart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Storage by Category Donut Chart */}
          <Card className="bg-[#272729] border border-[#333333] shadow-none rounded-2xl flex flex-col min-w-0 overflow-hidden outline-none focus:outline-none focus:ring-0">
            <CardHeader className="p-4 sm:p-6 md:p-8 border-b border-white/10">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white">พื้นที่จัดเก็บข้อมูล</CardTitle>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{totalStorage}</span>
                <span className="text-sm md:text-base text-[#cccccc]">MB</span>
              </div>
              <CardDescription className="text-[#cccccc] mt-1 md:mt-2 text-sm md:text-base">ปริมาณข้อมูลแยกตามหมวดหมู่เอกสาร</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px] sm:min-h-[400px] p-4 sm:p-6 md:p-8 flex-1 w-full min-w-0 min-h-0 flex flex-col justify-center">
              <ChartContainer config={chartConfig} className="flex-1 w-full min-w-0 min-h-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none focus:outline-none">
                <PieChart margin={{ top: 20, right: 0, left: 0, bottom: 10 }}>
                  <ChartTooltip content={<ChartTooltipContent className="bg-[#000000] border-white/10 text-white" />} />
                  <Pie
                    data={storage_category_chart}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="size_mb"
                    nameKey="category"
                    stroke="none"
                  >
                    {storage_category_chart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom"
                    content={renderCustomLegend}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
