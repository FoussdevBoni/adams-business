import { EmptyState } from '../../core/components/EmptyState';
import type { DashboardNavItem } from '../../core/navigation/dashboardNavigation';

/** Écran structurel d'un module du dashboard, remplacé par le module métier dans son lot. */
export function DashboardModulePage({ item }: { item: DashboardNavItem }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
        {item.label}
      </h1>
      <EmptyState
        icon={item.icon}
        title="Module en préparation"
        description="Cet espace sera disponible dans une prochaine étape du projet."
      />
    </div>
  );
}
