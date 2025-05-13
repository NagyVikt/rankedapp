import { title } from '@/components/primitives';
import PricingTable from '@/components/pricing/pricing-table';

export default function DocsPage() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <PricingTable></PricingTable>
    </div>
  );
}
