import { Component, computed, OnInit, signal } from '@angular/core';
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
  SnapshotEditorComponent,
} from '@myrmidon/gve-core';
import { LabeledId, Snapshot } from '@myrmidon/gve-snapshot-view';

import {
  GVE_SNAPSHOT_PART_TYPEID,
  GveSnapshotPart,
} from '../gve-snapshot-part';

/**
 * GVE snapshot part editor component.
 * Thesauri: snapshot-feat-names, snapshot-feat-values,
 * snapshot-efeat-names, snapshot-efeat-values,
 * snapshot-dfeat-names, snapshot-dfeat-values.
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
  public snapshot: FormControl<Snapshot | null>;

  /**
   * Thesaurus snapshot-feat-names entries.
   */
  public readonly featNameEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  /**
   * Thesaurus snapshot-feat-values entries.
   */
  public readonly featValueEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  /**
   * Thesaurus snapshot-efeat-names entries (features for elements).
   */
  public readonly efeatNameEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  /**
   * Thesaurus snapshot-efeat-values entries (features for elements).
   */
  public readonly efeatValueEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  /**
   * Thesaurus snapshot-dfeat-names entries (diplomatic features).
   */
  public readonly dfeatNameEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  /**
   * Thesaurus snapshot-dfeat-values entries (diplomatic features).
   */
  public readonly dfeatValueEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
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
   * The operation's SVG element feature definitions built from thesauri.
   */
  public readonly efeatDefs = computed<FeatureDefinitions | undefined>(() => {
    const names = this.efeatNameEntries();
    const values = this.efeatValueEntries();
    return this.mapEntriesToFeatDefs(names, values);
  });

  /**
   * The operation's diplomatic feature definitions built from thesauri.
   */
  public readonly dfeatDefs = computed<FeatureDefinitions | undefined>(() => {
    const names = this.dfeatNameEntries();
    const values = this.dfeatValueEntries();
    return this.mapEntriesToFeatDefs(names, values);
  });

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    this.snapshot = formBuilder.control(null, Validators.required);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
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

    key = 'snapshot-efeat-names';
    if (this.hasThesaurus(key)) {
      this.efeatNameEntries.set(thesauri[key].entries);
    } else {
      this.efeatNameEntries.set(undefined);
    }
    key = 'snapshot-efeat-values';
    if (this.hasThesaurus(key)) {
      this.efeatValueEntries.set(thesauri[key].entries);
    } else {
      this.efeatValueEntries.set(undefined);
    }

    key = 'snapshot-dfeat-names';
    if (this.hasThesaurus(key)) {
      this.dfeatNameEntries.set(thesauri[key].entries);
    } else {
      this.dfeatNameEntries.set(undefined);
    }
    key = 'snapshot-dfeat-values';
    if (this.hasThesaurus(key)) {
      this.dfeatValueEntries.set(thesauri[key].entries);
    } else {
      this.dfeatValueEntries.set(undefined);
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
    values: ThesaurusEntry[] | undefined
  ): FeatureDefinitions | undefined {
    if (!names || !values) {
      return undefined;
    }

    // names like id=value become labeled IDs where id=id and value=label
    const featNames = names.map(
      (e) => ({ id: e.id, label: e.value } as LabeledId)
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
