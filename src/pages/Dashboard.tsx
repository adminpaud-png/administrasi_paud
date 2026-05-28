import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Users,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import { useSettingsStore } from "../lib/store";

export function Dashboard() {
  const settings = useSettingsStore();

  const chartData = [
    { name: "Murid", value: settings.students.length },
    { name: "Guru", value: settings.teachers.length },
    { name: "Wali Murid", value: settings.parents.length },
    { name: "Karyawan", value: settings.employees.length },
    { name: "Inventaris", value: settings.inventory.length },
  ];

  const stats = [
    {
      title: "Total Murid",
      value: settings.students.length.toString(),
      subtitle: "Terdaftar",
      icon: GraduationCap,
      color: "bg-blue-500",
    },
    {
      title: "Total Guru",
      value: settings.teachers.length.toString(),
      subtitle: "Aktif mengajar",
      icon: Users,
      color: "bg-emerald-500",
    },
    {
      title: "Wali Murid",
      value: settings.parents.length.toString(),
      subtitle: "Terdaftar",
      icon: HeartHandshake,
      color: "bg-purple-500",
    },
    {
      title: "Karyawan",
      value: settings.employees.length.toString(),
      subtitle: "Staf operasional",
      icon: Briefcase,
      color: "bg-amber-500",
    },
    {
      title: "Inventaris",
      value: settings.inventory.length.toString(),
      subtitle: "Item tercatat",
      icon: Package,
      color: "bg-rose-500",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6 relative min-h-full">
      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Overview
        </h1>
        <p className="text-slate-500">
          Selamat datang di sistem administrasi {settings.schoolName}.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div variants={item} key={i}>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.replace("bg-", "")}/30`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {stat.value}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        {stat.subtitle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 grid grid-cols-1 gap-6 pb-8"
      >
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Statistik Data Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
