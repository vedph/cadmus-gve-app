import {
  GVE_SNAPSHOT_PART_SCHEMA,
  GVE_SNAPSHOT_PART_TYPEID,
} from './gve-snapshot-part';

describe('GVE_SNAPSHOT_PART_SCHEMA', () => {
  it('should have an ID derived from the part type ID', () => {
    expect(GVE_SNAPSHOT_PART_SCHEMA.$id).toBe(
      'www.vedph.it/cadmus/parts/gve/it.vedph.gve.snapshot.json',
    );
  });

  it('should have a type ID matching its own pattern', () => {
    const pattern = new RegExp(
      GVE_SNAPSHOT_PART_SCHEMA.properties.typeId.pattern,
    );
    expect(pattern.test(GVE_SNAPSHOT_PART_TYPEID)).toBe(true);
  });

  it('should require the part value with text and operations', () => {
    expect(GVE_SNAPSHOT_PART_SCHEMA.required).toContain('value');
    expect(GVE_SNAPSHOT_PART_SCHEMA.properties.value.required).toEqual([
      'text',
      'operations',
    ]);
  });
});
