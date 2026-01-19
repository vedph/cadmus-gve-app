import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { GveHandsPartComponent } from '@myrmidon/cadmus-part-gve-hands';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

@Component({
  selector: 'cadmus-gve-hands-part-feature',
  imports: [CurrentItemBarComponent, GveHandsPartComponent],
  templateUrl: './gve-hands-part-feature.component.html',
  styleUrl: './gve-hands-part-feature.component.css',
})
export class GveHandsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService
    );
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'gve-hand-eids',
      'gve-hand-tags',
      'gve-hand-tools',
      'gve-hand-colors',
      'asserted-id-scopes',
      'asserted-id-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'asserted-id-features',
    ];
  }
}
