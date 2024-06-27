import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';

import { SnapshotEditorComponent } from '@myrmidon/gve-core';

import {
  GVE_SNAPSHOT_PART_TYPEID,
  GveSnapshotPart,
} from '../gve-snapshot-part';
import { CommonModule } from '@angular/common';
import { Snapshot } from '@myrmidon/gve-snapshot-view';

/**
 * GVE snapshot part editor component.
 * Thesauri: ...TODO list of thesauri IDs...
 */
@Component({
  selector: 'cadmus-gve-snapshot-part',
  standalone: true,
  imports: [CommonModule, SnapshotEditorComponent],
  templateUrl: './gve-snapshot-part.component.html',
  styleUrl: './gve-snapshot-part.component.css',
})
export class GveSnapshotPartComponent
  extends ModelEditorComponentBase<GveSnapshotPart>
  implements OnInit
{
  public snapshot: FormControl<Snapshot | null>;

  // TODO: add your thesauri entries here, e.g.:
  // public tagEntries?: ThesaurusEntry[];

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
    // TODO: setup thesauri entries here, e.g.:
    // const key = 'note-tags';
    // if (this.hasThesaurus(key)) {
    //  this.tagEntries = thesauri[key].entries;
    // } else {
    //  this.tagEntries = undefined;
    // }
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
}
