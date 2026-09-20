import { TwinProvider } from './state/TwinContext';
import Header from './components/Header';
import KpiRow from './components/KpiRow';
import FloorPlan from './components/FloorPlan';
import EventFeed from './components/EventFeed';
import TimeControls from './components/TimeControls';
import BayDrawer from './components/BayDrawer';
import ReportModal from './components/ReportModal';

export default function App() {
  return (
    <TwinProvider>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <Header />
        <main className="mx-auto max-w-[1400px] space-y-4 px-3 py-4 sm:space-y-5 sm:px-6 sm:py-5">
          <KpiRow />
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <FloorPlan />
              <TimeControls />
            </div>
            <EventFeed />
          </div>
        </main>
        <BayDrawer />
        <ReportModal />
      </div>
    </TwinProvider>
  );
}
