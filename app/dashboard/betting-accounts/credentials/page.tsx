import CredentialsTable from '@/components/Features/Credentials/CredentialsTable'
import { getCredentials } from '@/helper/credential'

const page = async () => {
  const credentials = await getCredentials()

  return (
    <div className="flex flex-col h-full bg-[#050505] min-h-screen">
       <div className="px-6 pt-6 pb-6 bg-[#050505] sticky top-0 z-10 border-b border-gray-900/50">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white tracking-tight">Access Credentials</h1>
          </div>
       </div>
       <div className="p-6">
          <CredentialsTable initialCredentials={credentials || []} />
       </div>
    </div>
  )
}

export default page