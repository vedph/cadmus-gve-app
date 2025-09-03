import { Part } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

/**
 * A hand in the GveHandsPart.
 */
export interface GveHand {
  eid?: string;
  ownerId?: AssertedCompositeId;
  tag?: string;
  tool?: string;
  color?: string;
  notes?: { [key: string]: string };
}

/**
 * The GVE hands part model.
 */
export interface GveHandsPart extends Part {
  hands: GveHand[];
}

/**
 * The type ID used to identify the GveHandsPart type.
 */
export const GVE_HANDS_PART_TYPEID = 'it.vedph.gve.hands';

/**
 * JSON schema for the GveHands part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const GVE_HANDS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/gve/' + GVE_HANDS_PART_TYPEID + '.json',
  type: 'object',
  title: 'GveHandsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'hands',
  ],
  properties: {
    timeCreated: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    creatorId: {
      type: 'string',
    },
    timeModified: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    userId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    itemId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    typeId: {
      type: 'string',
      pattern: '^[a-z][-0-9a-z._]*$',
    },
    roleId: {
      type: ['string', 'null'],
      pattern: '^([a-z][-0-9a-z._]*)?$',
    },
    hands: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          eid: { type: 'string' },
          ownerId: {
            type: 'object',
            required: ['target'],
            properties: {
              target: {
                type: 'object',
                required: ['gid', 'label'],
                properties: {
                  gid: { type: 'string' },
                  label: { type: 'string' },
                  itemId: { type: 'string' },
                  partId: { type: 'string' },
                  partTypeId: { type: 'string' },
                  roleId: { type: 'string' },
                  name: { type: 'string' },
                  value: { type: 'string' },
                },
                additionalProperties: false,
              },
              tag: { type: 'string' },
              scope: { type: 'string' },
              assertion: {
                type: 'object',
                required: ['rank'],
                properties: {
                  tag: { type: 'string' },
                  rank: { type: 'integer' },
                  note: { type: 'string' },
                  references: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['citation'],
                      properties: {
                        type: { type: 'string' },
                        tag: { type: 'string' },
                        citation: { type: 'string' },
                        note: { type: 'string' },
                      },
                      additionalProperties: false,
                    },
                  },
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
          tag: { type: 'string' },
          tool: { type: 'string' },
          color: { type: 'string' },
          notes: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};
