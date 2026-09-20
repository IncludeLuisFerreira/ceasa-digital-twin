import { TwinProvider } from './state/TwinContext';
import Header from './components/Header';
import KpiRow from './components/KpiRow';
import FloorPlan from './components/FloorPlan';

export default function App() {
  return (
    <TwinProvider>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <Header />
        <main className="mx-auto max-w-[1400px] space-y-5 px-6 py-5">
          <KpiRow />
          <FloorPlan />
        </main>
      </div>
    </TwinProvider>
  );
}
