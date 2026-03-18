import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { GveSnapshotPartComponent } from '@myrmidon/cadmus-part-gve-snapshot';

@Component({
  selector: 'cadmus-gve-snapshot-part-feature',
  imports: [CurrentItemBarComponent, GveSnapshotPartComponent],
  templateUrl: './gve-snapshot-part-feature.component.html',
  styleUrl: './gve-snapshot-part-feature.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GveSnapshotPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService,
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService,
    );
  }

  protected override getReqThesauriIds(): string[] {
    return ['snapshot-feat-names', 'snapshot-feat-values'];
  }
}
