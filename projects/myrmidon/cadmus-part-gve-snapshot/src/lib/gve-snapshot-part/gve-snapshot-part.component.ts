import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { required } from '@angular/forms/signals';
import { TitleCasePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { EditedObject, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  ModelEditorComponentBase,
  sameFormValue,
} from '@myrmidon/cadmus-ui';

import {
  FeatureDefinitions,
  FeatureMap,
  FeaturePropMap,
  FeatureSetPolicy,
  LabeledId,
  Snapshot,
  SnapshotEditorComponent,
} from '@myrmidon/gve-core';

import { EnvService } from '@myrmidon/ngx-tools';
import { EditorSettingsService } from '@myrmidon/cadmus-api';
import { retry } from 'rxjs';
import {
  GVE_SNAPSHOT_PART_TYPEID,
  GveSnapshotPart,
} from '../gve-snapshot-part';
import {
  GveRenditionSettings,
  DEFAULT_SETTINGS,
} from '@myrmidon/gve-snapshot-rendition';
import { renderOperationSummary } from '../render-op-summary';

/**
 * The editable shape behind the snapshot part form.
 */
interface GveSnapshotPartControls {
  snapshot: Snapshot | null;
}

/**
 * Map the bound part to the editable draft. The snapshot is copied, because
 * the form tags the objects in its arrays (e.g. the operations).
 */
function toDraft(part?: GveSnapshotPart | null): GveSnapshotPartControls {
  return { snapshot: copyFormValue(part?.value) || null };
}

/**
 * GVE snapshot part editor component.
 * Thesauri: snapshot-feat-names, snapshot-feat-values.
 */
@Component({
  selector: 'cadmus-gve-snapshot-part',
  imports: [
    MatCardModule,
    MatIconModule,
    SnapshotEditorComponent,
    TitleCasePipe,
  ],
  templateUrl: './gve-snapshot-part.component.html',
  styleUrl: './gve-snapshot-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GveSnapshotPartComponent
  extends ModelEditorComponentBase<GveSnapshotPart>
  implements OnInit
{
  private readonly _envService = inject(EnvService);
  private readonly _edSettingService = inject(EditorSettingsService);

  // the draft is derived from the bound data, and rebuilt when it changes;
  // but the echo of our own save keeps the draft, so that the snapshot
  // editor gets back the very object it saved: a copy would make it reset
  // and run the snapshot again
  private readonly _draft = linkedSignal<
    GveSnapshotPart | null | undefined,
    GveSnapshotPartControls
  >({
    source: () => this.data()?.value,
    computation: (part, previous) =>
      previous && sameFormValue(part?.value, previous.value.snapshot)
        ? previous.value
        : toDraft(part),
  });
  // the form: the base class adds the disabled state
  public readonly form = this.createForm(this._draft, (p) => {
    required(p.snapshot);
  });

  /**
   * Thesaurus snapshot-feat-names entries.
   */
  public readonly featNameEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['snapshot-feat-names']?.entries,
  );
  /**
   * Thesaurus snapshot-feat-values entries.
   */
  public readonly featValueEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['snapshot-feat-values']?.entries,
  );
  /**
   * Thesaurus snapshot-source-ids entries.
   */
  public readonly sourceIdEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['snapshot-source-ids']?.entries,
  );
  /**
   * Thesaurus snapshot-source-types entries.
   */
  public readonly sourceTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['snapshot-source-types']?.entries,
  );

  /**
   * The operation feature definitions built from thesauri and settings.
   */
  public readonly featDefs = computed<FeatureDefinitions | undefined>(() => {
    const names = this.featNameEntries();
    const values = this.featValueEntries();
    const props = this.featProps();
    const defs = this.mapEntriesToFeatDefs(names, values);
    if (!props) {
      return defs;
    }
    return { ...(defs || {}), props };
  });

  public readonly sourceIds = computed<LabeledId[] | undefined>(() => {
    const entries = this.sourceIdEntries();
    return entries
      ? entries.map((e) => ({ id: e.id, label: e.value }))
      : undefined;
  });

  public readonly sourceTypes = computed<LabeledId[] | undefined>(() => {
    const entries = this.sourceTypeEntries();
    return entries
      ? entries.map((e) => ({ id: e.id, label: e.value }))
      : undefined;
  });

  /**
   * The list of multi-valued feature IDs from environment.
   */
  public readonly multiValuedFeatureIds = signal<string[]>([]);

  /**
   * The feature properties map from backend settings (gveFeatureProperties).
   */
  public readonly featProps = signal<FeaturePropMap | undefined>(undefined);

  /**
   * The rendition settings for snapshots.
   */
  public readonly renditionSettings =
    signal<GveRenditionSettings>(DEFAULT_SETTINGS);

  // the role ID of the last requested role-specific rendition settings
  private _renditionRoleId?: string;
  // true when the role-specific rendition settings have been loaded
  private _hasRoleRendition = false;

  constructor() {
    super();
  }

  private initMultiValuedFeatureIds(): void {
    // get multivalued feature IDs from environment settings
    this.multiValuedFeatureIds.set(
      (this._envService.get('multiValuedFeatureIds') || 'r_hints')
        .split(/\s+/)
        .filter((id) => id),
    );
  }

  private initRenderer(roleId?: string): void {
    if (roleId) {
      this._renditionRoleId = roleId;
      this._hasRoleRendition = false;
    }

    // get rendition settings from backend settings - as for all backend
    // settings, the key is typeid[_roleid] so we ensure to init the renderer
    // later when roleId is passed and is specified
    const key = GVE_SNAPSHOT_PART_TYPEID + (roleId ? `_${roleId}` : '');
    console.log('Loading rendition settings for key:', key);
    this._edSettingService
      .getSetting<GveRenditionSettings>(key)
      .pipe(retry(3))
      .subscribe({
        next: (data) => {
          // the backend returns an empty object for a missing setting
          if (!data || Object.keys(data).length === 0) {
            return;
          }
          if (roleId) {
            // ignore stale settings for a previously requested role
            if (roleId !== this._renditionRoleId) {
              return;
            }
            this._hasRoleRendition = true;
          } else if (this._hasRoleRendition) {
            // role-specific settings take precedence over the default ones,
            // whatever the order in which the responses arrive
            return;
          }
          // override opSummaryFn
          data.opSummaryFn = renderOperationSummary;
          console.log('Loaded rendition settings for key:', key, data);
          this.renditionSettings.set(data);
        },
        error: (error) => {
          console.error(
            'Failed to load rendition settings for key ' + key + ': ' + error,
          );
        },
      });
  }

  private initFeatProps(): void {
    this._edSettingService
      .getSetting<
        Record<
          string,
          {
            setPolicy: string;
            isNegated?: boolean;
            isGlobal?: boolean;
            isShortLived?: boolean;
          }
        >
      >('gveFeatureProperties')
      .pipe(retry(3))
      .subscribe({
        next: (data) => {
          if (!data || Object.keys(data).length === 0) {
            return;
          }
          const policyMap: Record<string, FeatureSetPolicy> = {
            multiple: FeatureSetPolicy.multiple,
            single: FeatureSetPolicy.single,
            'single-first': FeatureSetPolicy.singleFirst,
          };
          const props: FeaturePropMap = {};
          for (const [key, val] of Object.entries(data)) {
            props[key] = {
              setPolicy: policyMap[val.setPolicy] ?? FeatureSetPolicy.multiple,
              isNegated: val.isNegated,
              isGlobal: val.isGlobal,
              isShortLived: val.isShortLived,
            };
          }
          this.featProps.set(props);
        },
        error: (error) => {
          console.error('Failed to load gveFeatureProperties: ' + error);
        },
      });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.initMultiValuedFeatureIds();
    this.initRenderer();
    this.initFeatProps();
  }

  /**
   * Maps thesaurus entries to feature definitions.
   * @param names The thesaurus entries for feature names. These are assumed to be
   * flat entries where id=id and value=label. For instance, id="clr" and value="color".
   * @param values The thesaurus entries for feature values. These are assumed to be
   * composite entries where id=name-id:value-id and value=label. For instance,
   * id="clr:r" and value="red". So these entries represent closed sets of values
   * for specific feature names (=the keys in the features map).
   * @returns The mapped feature definitions, or undefined when both
   * names and values are undefined. Either of them can be undefined,
   * e.g. names with no closed sets of values.
   */
  private mapEntriesToFeatDefs(
    names: ThesaurusEntry[] | undefined,
    values: ThesaurusEntry[] | undefined,
  ): FeatureDefinitions | undefined {
    if (!names && !values) {
      return undefined;
    }

    // names like id=value become labeled IDs where id=id and value=label
    const featNames = names?.map(
      (e) => ({ id: e.id, label: e.value }) as LabeledId,
    );
    if (!values) {
      return { names: featNames };
    }

    // values like id:value=label become part of a map where key=id and
    // for each entry in that key id=part of id past first : and label=value
    const featValues: FeatureMap = {};

    for (const e of values) {
      const sep = e.id.indexOf(':');
      if (sep < 1) {
        console.warn(`Invalid feature value thesaurus entry id '${e.id}'.`);
        continue;
      }
      const key = e.id.substring(0, sep);
      const valueId = e.id.substring(sep + 1);
      const label = e.value;
      featValues[key] = featValues[key] || [];
      featValues[key].push({ id: valueId, label } as LabeledId);
    }

    return { names: featNames, values: featValues };
  }

  protected override onDataSet(data?: EditedObject<GveSnapshotPart>): void {
    // update settings if role differs from default: the role comes from
    // the part, or from the identity for a new part. Data are set again
    // on each save, so load settings only when the role changes.
    const roleId =
      data?.value?.roleId || untracked(() => this.identity()?.roleId);
    if (roleId && roleId !== this._renditionRoleId) {
      this.initRenderer(roleId);
    }
  }

  protected getValue(): GveSnapshotPart {
    const part = this.getEditedPart(GVE_SNAPSHOT_PART_TYPEID) as GveSnapshotPart;
    // save() calls this only when the form is valid, i.e. with a snapshot
    part.value = copyFormValue(this._draft().snapshot)!;
    return part;
  }

  /**
   * Handle the snapshot saved by the snapshot editor. This is an explicit
   * user action, so the snapshot is always set and the part saved, unless
   * the snapshot is missing: then the part is just left dirty. The snapshot
   * is not copied: it is the editor's own copy, which it bound back to.
   */
  public onSnapshotChange(snapshot: Snapshot | null | undefined): void {
    const field = this.form.snapshot();
    field.value.set(snapshot || null);
    field.markAsDirty();
    if (snapshot) {
      this.save();
    }
  }
}
