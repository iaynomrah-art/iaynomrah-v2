import React from 'react'
import { getBaccaratData } from '@/helper/bot'
import { PlayBaccaratTable } from '@/components/Features/PlayBaccarat/PlayBaccaratTable'

const PlayBaccaratPage = async () => {
  const data = await getBaccaratData();

  return (
    <div className="p-6 space-y-6 flex-1 bg-[#050505]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Play Baccarat</h1>
      </div>
      <PlayBaccaratTable initialData={data} />
    </div>
  )
}

export default PlayBaccaratPage