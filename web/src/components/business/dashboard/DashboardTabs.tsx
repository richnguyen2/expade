'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, CalendarDays, List, Users, Settings } from 'lucide-react';
import OverviewTab from '@/components/business/dashboard/OverviewTab';
import ScheduleTab from '@/components/business/dashboard/ScheduleTab';
import ServicesTab from '@/components/business/dashboard/ServicesTab';
import TeamTab from '@/components/business/dashboard/TeamTab';
import SettingsTab from '@/components/business/dashboard/SettingsTab';
import type { BusinessResponse } from '@/types';

const TABS = ['overview', 'schedule', 'services', 'team', 'settings'] as const;
type TabValue = (typeof TABS)[number];

interface DashboardTabsProps {
  business: BusinessResponse;
}

export default function DashboardTabs({ business }: DashboardTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get('tab');
  const active: TabValue = TABS.includes(raw as TabValue) ? (raw as TabValue) : 'overview';

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={active} onValueChange={setTab}>
      <TabsList className="h-11 w-full max-w-2xl">
        <TabsTrigger value="overview">
          <BarChart3 /> Overview
        </TabsTrigger>
        <TabsTrigger value="schedule">
          <CalendarDays /> Schedule
        </TabsTrigger>
        <TabsTrigger value="services">
          <List /> Services
        </TabsTrigger>
        <TabsTrigger value="team">
          <Users /> Team
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings /> Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab business={business} />
      </TabsContent>
      <TabsContent value="schedule" className="mt-6">
        <ScheduleTab />
      </TabsContent>
      <TabsContent value="services" className="mt-6">
        <ServicesTab business={business} />
      </TabsContent>
      <TabsContent value="team" className="mt-6">
        <TeamTab business={business} />
      </TabsContent>
      <TabsContent value="settings" className="mt-6">
        <SettingsTab business={business} />
      </TabsContent>
    </Tabs>
  );
}
