import { Routes } from '@angular/router';

import { GVE_SNAPSHOT_PART_TYPEID } from '@myrmidon/cadmus-part-gve-snapshot';
import { pendingChangesGuard } from '@myrmidon/cadmus-core';

import { GveSnapshotPartFeatureComponent } from './components/gve-snapshot-part-feature/gve-snapshot-part-feature.component';

export const CADMUS_PART_GVE_PG_ROUTES: Routes = [
  {
    path: `${GVE_SNAPSHOT_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: GveSnapshotPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  }
];
