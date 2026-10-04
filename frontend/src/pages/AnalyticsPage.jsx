/**
 * AnalyticsPage: historical charts + demand/supply chart.
 */

import DemandSupplyChart from '../components/DemandSupplyChart'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <DemandSupplyChart />
    </div>
  )
}