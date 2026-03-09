import { Suspense } from "react";
import { Building2, Server, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AddFranchiseQuickAction } from "@/components/action/AddFranchiseQuickAction";
import { getDashboardData, type Units } from "@/helper/dashboard";

async function UserCheck() {
  const { totalUnits, runningUnits, totalFranchises, units: unitsList } = await getDashboardData();

  const stats = [
    { title: "Total Units", value: totalUnits, icon: Server, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Running Units", value: runningUnits, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Franchises", value: totalFranchises, icon: Building2, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your trading platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] shadow-lg hover:border-blue-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Quick Actions */}
        <div className="p-6 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] shadow-lg space-y-6">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <AddFranchiseQuickAction />
            <Link href="/dashboard/units" className="w-full">
              <Button
                className="h-12 bg-[#0d0d0d] border border-[#1a1a1a] hover:bg-[#141414] hover:border-orange-500/50 text-white flex items-center justify-start px-4 gap-4 transition-all w-full group/btn"
                variant="outline"
              >
                <Server className="h-5 w-5 text-orange-500 group-hover/btn:scale-110 transition-transform" />
                <span className="text-sm font-medium">View Server Units</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Units Status */}
        <div className="p-6 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] shadow-lg space-y-6 h-full">
          <h3 className="text-lg font-semibold text-white">Units Status</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {unitsList?.map((unit: Units) => (
              <div key={unit.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a] hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${unit.status === 'Running' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{unit.units || unit.pc_name || `Unit ${unit.id}`}</p>
                    <p className="text-xs text-muted-foreground">{unit.status || 'Offline'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-muted-foreground">{unit.user_balance ? `$${unit.user_balance}` : '-'}</p>
                </div>
              </div>
            ))}
            {(!unitsList || unitsList.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No units found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const page = () => {
  return (
    <div suppressHydrationWarning className="min-h-full bg-[#050505]">
      <Suspense fallback={
        <div className="p-6 space-y-4">
          <div className="h-8 w-64 bg-[#1a1a1a] animate-pulse rounded" />
          <div className="h-4 w-96 bg-[#1a1a1a] animate-pulse rounded" />
        </div>
      }>
        <UserCheck />
      </Suspense>
    </div>
  )
}

export default page