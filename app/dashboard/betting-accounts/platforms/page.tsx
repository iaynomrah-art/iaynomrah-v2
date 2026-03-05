import BettingPlatformTable from '@/components/Features/BettingPlatform/BettingPlatformTable'
import { getPlatformWebsites } from '@/helper/platform_website'

const page = async () => {
  const platforms = await getPlatformWebsites()

  return (
    <div className="flex flex-col h-full bg-[#050505] min-h-screen">
       <div className="px-6 pt-6 pb-6 bg-[#050505] sticky top-0 z-10 border-b border-gray-900/50">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white tracking-tight">Betting Platforms</h1>
          </div>
       </div>
       <div className="p-6">
          <BettingPlatformTable initialPlatforms={platforms || []} />
       </div>
    </div>
  )
}

export default page