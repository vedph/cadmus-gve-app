import { pendingChangesGuard } from '@myrmidon/cadmus-core';
import { GVE_SNAPSHOT_PART_TYPEID } from '@myrmidon/cadmus-part-gve-snapshot';

import { CADMUS_PART_GVE_PG_ROUTES } from './cadmus-part-gve-pg.routes';
import { GveSnapshotPartFeatureComponent } from './components/gve-snapshot-part-feature/gve-snapshot-part-feature.component';

describe('CADMUS_PART_GVE_PG_ROUTES', () => {
  it('should have a single route', () => {
    expect(CADMUS_PART_GVE_PG_ROUTES).toHaveLength(1);
  });

  it('should route the snapshot part type to its feature editor', () => {
    const route = CADMUS_PART_GVE_PG_ROUTES[0];
    expect(route.path).toBe(`${GVE_SNAPSHOT_PART_TYPEID}/:pid`);
    expect(route.pathMatch).toBe('full');
    expect(route.component).toBe(GveSnapshotPartFeatureComponent);
  });

  it('should guard against leaving with pending changes', () => {
    expect(CADMUS_PART_GVE_PG_ROUTES[0].canDeactivate).toEqual([
      pendingChangesGuard,
    ]);
  });

  it('should have a path whose first segment is the part type ID', () => {
    // EditPartFeatureBase derives the part type ID from this segment
    const path = CADMUS_PART_GVE_PG_ROUTES[0].path!;
    expect(path.substring(0, path.indexOf('/'))).toBe(GVE_SNAPSHOT_PART_TYPEID);
  });
});
