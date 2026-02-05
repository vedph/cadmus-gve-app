import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { NoteSet, NoteSetComponent } from '@myrmidon/cadmus-ui-note-set';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { GveHand } from '../gve-hands-part';

const DEFAULT_NOTESET: NoteSet = {
  definitions: [
    {
      key: 'description',
      label: 'description',
      markdown: true,
      maxLength: 1000,
    },
    {
      key: 'signs',
      label: 'signs',
      markdown: true,
      maxLength: 1000,
    },
  ],
};

/**
 * Editor of a single GVE hand.
 */
@Component({
  selector: 'cadmus-gve-hand-editor',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    AssertedCompositeIdComponent,
    NoteSetComponent,
  ],
  templateUrl: './gve-hand-editor.component.html',
  styleUrl: './gve-hand-editor.component.css',
})
export class GveHandEditorComponent {
  public readonly hand = model<GveHand | undefined>();
  public readonly cancelEdit = output();

  // gve-hand-eids
  public readonly eidEntries = input<ThesaurusEntry[] | undefined>();
  // gve-hand-tags
  public readonly tagEntries = input<ThesaurusEntry[] | undefined>();
  // gve-hand-tools
  public readonly toolEntries = input<ThesaurusEntry[] | undefined>();
  // gve-hand-colors
  public readonly colorEntries = input<ThesaurusEntry[] | undefined>();

  // asserted-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[] | undefined>();
  // asserted-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[] | undefined>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[] | undefined>();
  // doc-reference-types
  public readonly docRefTypeEntries = input<ThesaurusEntry[] | undefined>();
  // doc-reference-tags
  public readonly docRefTagEntries = input<ThesaurusEntry[] | undefined>();
  // asserted-id-features
  public readonly idFeatureEntries = input<ThesaurusEntry[] | undefined>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public eid: FormControl<string | null>;
  public tag: FormControl<string | null>;
  public ownerId: FormControl<AssertedCompositeId | null>;
  public tool: FormControl<string | null>;
  public color: FormControl<string | null>;
  public notes: FormControl<NoteSet>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.eid = formBuilder.control<string | null>(
      null,
      Validators.maxLength(100),
    );
    this.tag = formBuilder.control<string | null>(
      null,
      Validators.maxLength(100),
    );
    this.ownerId = formBuilder.control<AssertedCompositeId | null>(null);
    this.tool = formBuilder.control<string | null>(
      null,
      Validators.maxLength(100),
    );
    this.color = formBuilder.control<string | null>(
      null,
      Validators.maxLength(100),
    );
    this.notes = formBuilder.control<NoteSet>(DEFAULT_NOTESET, {
      nonNullable: true,
    });
    this.form = formBuilder.group({
      eid: this.eid,
      tag: this.tag,
      ownerId: this.ownerId,
      tool: this.tool,
      color: this.color,
      notes: this.notes,
    });

    // when model changes, update form
    effect(() => {
      const data = this.hand();
      this.updateForm(data);
    });
  }

  private updateForm(data: GveHand | undefined | null): void {
    if (!data) {
      this.form.reset();
    } else {
      this.eid.setValue(data.eid || null, { emitEvent: false });
      this.tag.setValue(data.tag || null, { emitEvent: false });
      this.ownerId.setValue(data.ownerId || null, { emitEvent: false });
      this.tool.setValue(data.tool || null, { emitEvent: false });
      this.color.setValue(data.color || null, { emitEvent: false });
      this.notes.setValue(
        data.notes
          ? { notes: { ...data.notes }, ...DEFAULT_NOTESET }
          : DEFAULT_NOTESET,
        { emitEvent: false },
      );
    }

    this.form.markAsPristine();
  }

  public onIdChange(id: AssertedCompositeId): void {
    this.ownerId.setValue(id);
    this.ownerId.markAsDirty();
    this.ownerId.updateValueAndValidity();
  }

  public onSetChange(set: NoteSet): void {
    console.log('Set updated:', set);
    this.notes.setValue(set);
    this.notes.markAsDirty();
    this.notes.updateValueAndValidity();
  }

  private getData(): GveHand {
    return {
      eid: this.eid.value || undefined,
      tag: this.tag.value || undefined,
      ownerId: this.ownerId.value || undefined,
      tool: this.tool.value || undefined,
      color: this.color.value || undefined,
      notes:
        (this.notes.value?.notes as { [key: string]: string }) || undefined,
    };
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  /**
   * Saves the current form data by updating the `data` model signal.
   * This method can be called manually (e.g., by a Save button) or
   * automatically (via auto-save).
   * @param pristine If true (default), the form is marked as pristine
   * after saving.
   * Set to false for auto-save if you want the form to remain dirty.
   */
  public save(pristine = true): void {
    if (this.form.invalid) {
      // show validation errors
      this.form.markAllAsTouched();
      return;
    }

    const data = this.getData();
    this.hand.set(data);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}
