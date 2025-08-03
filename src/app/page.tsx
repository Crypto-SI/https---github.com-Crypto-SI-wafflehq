import { CryptoWaffleLogo } from '@/components/dashboard/header';
import { MetricsDashboard } from '@/components/dashboard/metrics-dashboard';
import { UserManagement } from '@/components/dashboard/user-management';
import { GemOfTheWeek } from '@/components/dashboard/gem-of-the-week';
import { WelcomeAi } from '@/components/dashboard/welcome-ai';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b shrink-0 bg-background/80 backdrop-blur-sm md:px-6">
        <CryptoWaffleLogo />
      </header>
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="grid max-w-6xl gap-8 mx-auto xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            <MetricsDashboard />
            <UserManagement />
          </div>
          <aside className="space-y-8 xl:col-span-1">
            <GemOfTheWeek />
            <WelcomeAi />
          </aside>
        </div>
      </main>
    </div>
  );
}
