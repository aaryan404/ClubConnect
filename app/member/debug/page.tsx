import { Metadata } from 'next'
import Navigation from '@/components/studentNavigation'
import ClubManagementDebug from '@/components/clubManagementDebug'

export const metadata: Metadata = {
  title: 'Debug Page | ClubConnect',
  description: 'Debug page for ClubConnect club management',
}

export default function DebugPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation active="debug" />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Page</h1>
        <p className="mb-4 text-muted-foreground">
          Use this page to debug issues with the Club Management functionality. 
          Click the "Run Debug" button to start the debugging process.
        </p>
        <ClubManagementDebug />
      </main>
    </div>
  )
}