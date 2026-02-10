import AnalyticsDashboard from '@/views/AnalyticsDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | SRSM',
  description: 'Visual analytics and reporting for service requests.',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
