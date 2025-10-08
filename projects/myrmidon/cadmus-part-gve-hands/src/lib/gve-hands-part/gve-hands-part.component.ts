import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  deepCopy,
  FlatLookupPipe,
  NgxToolsValidators,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import {
  EditedObject,
  ThesauriSet,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';

import {
  GVE_HANDS_PART_TYPEID,
  GveHand,
  GveHandsPart,
} from '../gve-hands-part';
import { GveHandEditorComponent } from '../gve-hand-editor/gve-hand-editor.component';

/**
 * GVE hands part editor.
 * Thesauri: gve-hand-eids, gve-hand-tags, gve-hand-tools, gve-hand-colors,
 * asserted-id-scopes, asserted-id-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags.
 */
@Component({
  selector: 'cadmus-gve-hands-part',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FlatLookupPipe,
    // cadmus
    CloseSaveButtonsComponent,
    GveHandEditorComponent,
  ],
  templateUrl: './gve-hands-part.component.html',
  styleUrl: './gve-hands-part.component.css',
})
export class GveHandsPartComponent
  extends ModelEditorComponentBase<GveHandsPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<GveHand | undefined>(undefined);

  // gve-hand-eids
  public readonly eidEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // gve-hand-tags
  public readonly tagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // gve-hand-tools
  public readonly toolEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // gve-hand-colors
  public readonly colorEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  // asserted-id-scopes
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // asserted-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // doc-reference-types
  public readonly docRefTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // doc-reference-tags
  public readonly docRefTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  public hands: FormControl<GveHand[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.hands = formBuilder.control([], {
      // at least 1 hand
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.hands,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'gve-hand-eids';
    if (this.hasThesaurus(key)) {
      this.eidEntries.set(thesauri[key].entries);
    } else {
      this.eidEntries.set(undefined);
    }
    key = 'gve-hand-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries.set(thesauri[key].entries);
    } else {
      this.tagEntries.set(undefined);
    }
    key = 'gve-hand-tools';
    if (this.hasThesaurus(key)) {
      this.toolEntries.set(thesauri[key].entries);
    } else {
      this.toolEntries.set(undefined);
    }
    key = 'gve-hand-colors';
    if (this.hasThesaurus(key)) {
      this.colorEntries.set(thesauri[key].entries);
    } else {
      this.colorEntries.set(undefined);
    }
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries.set(thesauri[key].entries);
    } else {
      this.idScopeEntries.set(undefined);
    }
    key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries.set(thesauri[key].entries);
    } else {
      this.idTagEntries.set(undefined);
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.docRefTypeEntries.set(thesauri[key].entries);
    } else {
      this.docRefTypeEntries.set(undefined);
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.docRefTagEntries.set(thesauri[key].entries);
    } else {
      this.docRefTagEntries.set(undefined);
    }
  }

  private updateForm(part?: GveHandsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.hands.setValue(part.hands || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<GveHandsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): GveHandsPart {
    let part = this.getEditedPart(GVE_HANDS_PART_TYPEID) as GveHandsPart;
    part.hands = this.hands.value || [];
    return part;
  }

  public addHand(): void {
    this.editHand({}, -1);
  }

  public editHand(entry: GveHand, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(deepCopy(entry));
  }

  public closeHand(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveHand(entry: GveHand): void {
    const hands = [...this.hands.value];
    if (this.editedIndex()) {
      hands.push(entry);
    } else {
      hands.splice(this.editedIndex(), 1, entry);
    }
    this.hands.setValue(hands);
    this.hands.markAsDirty();
    this.hands.updateValueAndValidity();
    this.closeHand();
  }

  public deleteHand(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete hand?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeHand();
          }
          const hands = [...this.hands.value];
          hands.splice(index, 1);
          this.hands.setValue(hands);
          this.hands.markAsDirty();
          this.hands.updateValueAndValidity();
        }
      });
  }

  public moveHandUp(index: number): void {
    if (index < 1) {
      return;
    }
    const hand = this.hands.value[index];
    const hands = [...this.hands.value];
    hands.splice(index, 1);
    hands.splice(index - 1, 0, hand);
    this.hands.setValue(hands);
    this.hands.markAsDirty();
    this.hands.updateValueAndValidity();
  }

  public moveHandDown(index: number): void {
    if (index + 1 >= this.hands.value.length) {
      return;
    }
    const hand = this.hands.value[index];
    const hands = [...this.hands.value];
    hands.splice(index, 1);
    hands.splice(index + 1, 0, hand);
    this.hands.setValue(hands);
    this.hands.markAsDirty();
    this.hands.updateValueAndValidity();
  }
}
