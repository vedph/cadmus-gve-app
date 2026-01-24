import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  ThesauriSet,
  EditedObject,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';

import {
  FeatureDefinitions,
  FeatureMap,
  LabeledId,
  Snapshot,
  SnapshotEditorComponent,
} from '@myrmidon/gve-core';

import { EnvService } from '@myrmidon/ngx-tools';
import { EditorSettingsService } from '@myrmidon/cadmus-api';
import { retry } from 'rxjs/internal/operators/retry';
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
 * The key used to store rendition settings data in editor settings.
 */
export const GVE_RENDITION_SETTINGS_DATA_KEY = 'gveRenditionSettings';

/**
 * GVE snapshot part editor component.
 * Thesauri: snapshot-feat-names, snapshot-feat-values.
 */
@Component({
  selector: 'cadmus-gve-snapshot-part',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    SnapshotEditorComponent,
    TitleCasePipe,
  ],
  templateUrl: './gve-snapshot-part.component.html',
  styleUrl: './gve-snapshot-part.component.css',
})
export class GveSnapshotPartComponent
  extends ModelEditorComponentBase<GveSnapshotPart>
  implements OnInit
{
  private _envService: EnvService;
  private _edSettingService: EditorSettingsService;
  public snapshot: FormControl<Snapshot | null>;

  /**
   * Thesaurus snapshot-feat-names entries.
   */
  public readonly featNameEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  /**
   * Thesaurus snapshot-feat-values entries.
   */
  public readonly featValueEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );

  /**
   * The operation feature definitions built from thesauri.
   */
  public readonly featDefs = computed<FeatureDefinitions | undefined>(() => {
    const names = this.featNameEntries();
    const values = this.featValueEntries();
    return this.mapEntriesToFeatDefs(names, values);
  });

  /**
   * The list of multi-valued feature IDs from environment.
   */
  public readonly multiValuedFeatureIds = signal<string[]>([]);

  /**
   * The rendition settings for snapshots.
   */
  public readonly renditionSettings =
    signal<GveRenditionSettings>(DEFAULT_SETTINGS);

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    this._envService = inject(EnvService);
    this._edSettingService = inject(EditorSettingsService);
    // form
    this.snapshot = formBuilder.control(null, Validators.required);
  }

  private initRenderer(): void {
    // get multivalued feature IDs from environment settings
    this.multiValuedFeatureIds.set(
      (this._envService.get('multiValuedFeatureIds') || 'r_hints').split(' '),
    );

    // get rendition settings from backend settings
    this._edSettingService
      .getSetting(GVE_RENDITION_SETTINGS_DATA_KEY)
      .pipe(retry(3))
      .subscribe({
        next: (data) => {
          if (data) {
            // override opSummaryFn
            data.opSummaryFn = renderOperationSummary;
            console.log('Loaded rendition settings:', data);
            this.renditionSettings.set(data);
          }
        },
        error: (error) => {
          console.error('Failed to load rendition settings: ' + error);
        },
      });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.initRenderer();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      snapshot: this.snapshot,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'snapshot-feat-names';
    if (this.hasThesaurus(key)) {
      this.featNameEntries.set(thesauri[key].entries);
    } else {
      this.featNameEntries.set(undefined);
    }
    key = 'snapshot-feat-values';
    if (this.hasThesaurus(key)) {
      this.featValueEntries.set(thesauri[key].entries);
    } else {
      this.featValueEntries.set(undefined);
    }
  }

  /**
   * Maps thesaurus entries to feature definitions.
   * @param names The thesaurus entries for feature names. These are assumed to be
   * flat entries where id=id and value=label. For instance, id="clr" and value="color".
   * @param values The thesaurus entries for feature values. These are assumed to be
   * composite entries where id=name-id:value-id and value=label. For instance,
   * id="clr:r" and value="red". So these entries represent closed sets of values
   * for specific feature names (=the keys in the features map).
   * @returns The mapped feature definitions.
   */
  private mapEntriesToFeatDefs(
    names: ThesaurusEntry[] | undefined,
    values: ThesaurusEntry[] | undefined,
  ): FeatureDefinitions | undefined {
    if (!names || !values) {
      return undefined;
    }

    // names like id=value become labeled IDs where id=id and value=label
    const featNames = names.map(
      (e) => ({ id: e.id, label: e.value }) as LabeledId,
    );

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

  private updateForm(part?: GveSnapshotPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.snapshot.setValue(part.value || null);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<GveSnapshotPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): GveSnapshotPart {
    let part = this.getEditedPart(GVE_SNAPSHOT_PART_TYPEID) as GveSnapshotPart;
    part.value = this.snapshot.value!;
    return part;
  }

  public onSnapshotChange(snapshot: Snapshot | null): void {
    this.snapshot.setValue(snapshot);
    this.snapshot.markAsDirty();
    this.snapshot.updateValueAndValidity();
    if (this.snapshot.value) {
      super.save();
    }
  }
}
