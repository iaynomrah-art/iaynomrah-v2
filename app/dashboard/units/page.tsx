import React from "react";
import UnitsList from "@/components/Features/Units/UnitsList";
import { getUnits } from "@/helper/units";


export default async function UnitsPage() {
  const units = await getUnits();



  return (
    <div className="p-6 space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Trading Units</h1>
        <p className="text-gray-400">
          Manage your server endpoints, unit assignments, and API connections.
        </p>
      </div>

      <UnitsList initialUnits={units || []} />
    </div>
  );
}