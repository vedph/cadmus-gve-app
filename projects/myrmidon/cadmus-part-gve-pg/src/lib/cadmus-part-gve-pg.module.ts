import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GVE_SNAPSHOT_PART_TYPEID } from '@myrmidon/cadmus-part-gve-snapshot';
import { PendingChangesGuard, CadmusCoreModule } from '@myrmidon/cadmus-core';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { GveSnapshotPartFeatureComponent } from './components/gve-snapshot-part-feature/gve-snapshot-part-feature.component';

export const RouterModuleForChild = RouterModule.forChild([
  {
    path: `${GVE_SNAPSHOT_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: GveSnapshotPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
]);

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // cadmus
    RouterModuleForChild,
    CadmusCoreModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    // local
    GveSnapshotPartFeatureComponent,
  ],
  exports: [GveSnapshotPartFeatureComponent],
})
export class CadmusPartGvePgModule {}
