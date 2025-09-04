import {
  BIBLIOGRAPHY_PART_TYPEID,
  CATEGORIES_PART_TYPEID,
  CHRONOTOPES_PART_TYPEID,
  COMMENT_PART_TYPEID,
  DOC_REFERENCES_PART_TYPEID,
  EXTERNAL_IDS_PART_TYPEID,
  HISTORICAL_DATE_PART_TYPEID,
  INDEX_KEYWORDS_PART_TYPEID,
  METADATA_PART_TYPEID,
  NOTE_PART_TYPEID,
  PIN_LINKS_PART_TYPEID,
  TOKEN_TEXT_PART_TYPEID,
  COMMENT_FRAGMENT_TYPEID,
  PIN_LINKS_FRAGMENT_TYPEID,
  ASSERTED_HISTORICAL_DATES_PART_TYPEID,
  FLAGS_PART_TYPEID,
  HISTORICAL_EVENTS_PART_TYPEID,
  PHYSICAL_MEASUREMENTS_PART_TYPEID,
  PHYSICAL_STATES_PART_TYPEID,
} from '@myrmidon/cadmus-part-general-ui';
import { APPARATUS_FRAGMENT_TYPEID } from '@myrmidon/cadmus-part-philology-ui';

import { PartEditorKeys } from '@myrmidon/cadmus-core';

// codicology
import { COD_SHELFMARKS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-shelfmarks';

import { GVE_SNAPSHOT_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-gve-snapshot/src/public-api';
import { GVE_HANDS_PART_TYPEID } from '../../projects/myrmidon/cadmus-part-gve-hands/src/public-api';

const TOKEN_TEXT_LAYER_PART_TYPEID = 'it.vedph.token-text-layer';
const GENERAL = 'general';
const PHILOLOGY = 'philology';
const CODICOLOGY = 'codicology';
const GVE = 'gve';

/**
 * The parts and fragments editor keys for this UI.
 * Each property is a part type ID, mapped to a value of type PartGroupKey,
 * having a part property with the part's editor key, and a fragments property
 * with the mappings between fragment type IDs and their editor keys.
 */
export const PART_EDITOR_KEYS: PartEditorKeys = {
  // general
  [ASSERTED_HISTORICAL_DATES_PART_TYPEID]: {
    part: GENERAL,
  },
  [BIBLIOGRAPHY_PART_TYPEID]: {
    part: GENERAL,
  },
  [CATEGORIES_PART_TYPEID]: {
    part: GENERAL,
  },
  [CHRONOTOPES_PART_TYPEID]: {
    part: GENERAL,
  },
  [COMMENT_PART_TYPEID]: {
    part: GENERAL,
  },
  [DOC_REFERENCES_PART_TYPEID]: {
    part: GENERAL,
  },
  [EXTERNAL_IDS_PART_TYPEID]: {
    part: GENERAL,
  },
  [FLAGS_PART_TYPEID]: {
    part: GENERAL,
  },
  [HISTORICAL_DATE_PART_TYPEID]: {
    part: GENERAL,
  },
  [HISTORICAL_EVENTS_PART_TYPEID]: {
    part: GENERAL,
  },
  [INDEX_KEYWORDS_PART_TYPEID]: {
    part: GENERAL,
  },
  [METADATA_PART_TYPEID]: {
    part: GENERAL,
  },
  [NOTE_PART_TYPEID]: {
    part: GENERAL,
  },
  [PHYSICAL_MEASUREMENTS_PART_TYPEID]: {
    part: GENERAL,
  },
  [PHYSICAL_STATES_PART_TYPEID]: {
    part: GENERAL,
  },
  [PIN_LINKS_PART_TYPEID]: {
    part: GENERAL,
  },
  [TOKEN_TEXT_PART_TYPEID]: {
    part: GENERAL,
  },
  // gve parts
  [GVE_SNAPSHOT_PART_TYPEID]: {
    part: GVE,
  },
  [GVE_HANDS_PART_TYPEID]: {
    part: GVE,
  },
  // codicology
  [COD_SHELFMARKS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  // layer parts
  [TOKEN_TEXT_LAYER_PART_TYPEID]: {
    part: GENERAL,
    fragments: {
      [APPARATUS_FRAGMENT_TYPEID]: PHILOLOGY,
      [COMMENT_FRAGMENT_TYPEID]: GENERAL,
      [PIN_LINKS_FRAGMENT_TYPEID]: GENERAL,
    },
  },
};
