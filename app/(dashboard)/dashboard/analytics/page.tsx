import React from "react";
import KpStat from "@/components/analytics/kpstat";
import Kpstat2 from "@/components/analytics/kpstat2";
import SalesGraph from "@/components/analytics/salesgraph";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 py-8">
      {/* KPI stats laid out side-by-side */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpStat />
        <Kpstat2 />
      </section>

      {/* Sales graph full width */}
      <section className="">
        <SalesGraph />
      </section>
    </div>
  );
}
