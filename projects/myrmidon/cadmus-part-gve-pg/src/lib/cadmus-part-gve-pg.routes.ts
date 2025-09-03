import { Routes } from '@angular/router';

import { GVE_SNAPSHOT_PART_TYPEID } from '@myrmidon/cadmus-part-gve-snapshot';
import { GVE_HANDS_PART_TYPEID } from '@myrmidon/cadmus-part-gve-hands';
import { pendingChangesGuard } from '@myrmidon/cadmus-core';

import { GveSnapshotPartFeatureComponent } from './components/gve-snapshot-part-feature/gve-snapshot-part-feature.component';
import { GveHandsPartFeatureComponent } from './components/gve-hands-part-feature/gve-hands-part-feature.component';

export const CADMUS_PART_GVE_PG_ROUTES: Routes = [
  {
    path: `${GVE_SNAPSHOT_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: GveSnapshotPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${GVE_HANDS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: GveHandsPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
];
