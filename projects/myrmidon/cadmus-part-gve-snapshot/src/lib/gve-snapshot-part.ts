import { Part } from '@myrmidon/cadmus-core';

import { Snapshot } from '@myrmidon/gve-snapshot-view';

/**
 * The GveSnapshot part model.
 */
export interface GveSnapshotPart extends Part {
  value: Snapshot;
}

/**
 * The type ID used to identify the GveSnapshotPart type.
 */
export const GVE_SNAPSHOT_PART_TYPEID = 'it.vedph.gve.snapshot';

/**
 * JSON schema for the GveSnapshot part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const GveSnapshot_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/gve/' + GVE_SNAPSHOT_PART_TYPEID + '.json',
  type: 'object',
  title: 'GveSnapshotPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'value',
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
    value: {
      type: 'object',
      required: ['size', 'text', 'textOptions', 'operations'],
      properties: {
        size: {
          type: 'object',
          required: ['width', 'height'],
          properties: {
            width: {
              type: 'number',
            },
            height: {
              type: 'number',
            },
          },
        },
        style: {
          type: 'string',
        },
        defs: {
          type: 'string',
        },
        image: {
          type: 'object',
          required: ['url'],
          properties: {
            url: {
              type: 'string',
            },
            canvas: {
              type: 'object',
              required: ['X', 'y', 'width', 'height'],
              properties: {
                X: {
                  type: 'number',
                },
                y: {
                  type: 'number',
                },
                width: {
                  type: 'number',
                },
                height: {
                  type: 'number',
                },
              },
            },
            opacity: {
              type: 'number',
            },
          },
        },
        text: {
          type: 'array',
          default: [],
          items: {
            type: 'object',
            required: ['id', 'label', 'index', 'data'],
            properties: {
              id: {
                type: 'integer',
              },
              label: {
                type: 'string',
              },
              index: {
                type: 'integer',
              },
              data: {
                type: 'string',
              },
              sourceTag: {
                type: 'string',
              },
              features: {
                type: 'array',
                default: [],
                items: {
                  type: 'object',
                  required: ['name', 'value', 'setPolicy'],
                  properties: {
                    name: {
                      type: 'string',
                    },
                    value: {
                      type: 'string',
                    },
                    setPolicy: {
                      type: 'integer',
                    },
                  },
                },
              },
            },
          },
        },
        textStyle: {
          type: 'string',
        },
        textOptions: {
          type: 'object',
          required: ['lineHeightOffset', 'charSpacingOffset', 'spcWidthOffset'],
          properties: {
            offset: {
              type: 'object',
              required: ['x', 'y'],
              properties: {
                x: {
                  type: 'number',
                },
                y: {
                  type: 'number',
                },
              },
            },
            lineHeightOffset: {
              type: 'number',
            },
            charSpacingOffset: {
              type: 'number',
            },
            spcWidthOffset: {
              type: 'number',
            },
          },
        },
        operations: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'type', 'at', 'run'],
            properties: {
              id: {
                type: 'string',
              },
              rank: {
                type: 'integer',
              },
              groupId: {
                type: 'string',
              },
              features: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'value', 'setPolicy'],
                  properties: {
                    name: {
                      type: 'string',
                    },
                    value: {
                      type: 'string',
                    },
                    setPolicy: {
                      type: 'integer',
                    },
                    isNegated: {
                      type: 'boolean',
                    },
                    isGlobal: {
                      type: 'boolean',
                    },
                    isShortLived: {
                      type: 'boolean',
                    },
                  },
                },
              },
              sources: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'type'],
                  properties: {
                    id: {
                      type: 'string',
                      default: '',
                      title: 'The id Schema',
                      examples: [''],
                    },
                    type: {
                      type: 'string',
                      default: '',
                      title: 'The type Schema',
                      examples: [''],
                    },
                  },
                },
              },
              diplomatics: {
                type: 'object',
                required: ['g'],
                properties: {
                  g: {
                    type: 'string',
                  },
                  features: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['name', 'value', 'setPolicy'],
                      properties: {
                        name: {
                          type: 'string',
                        },
                        value: {
                          type: 'string',
                        },
                        setPolicy: {
                          type: 'integer',
                        },
                      },
                    },
                  },
                  elementFeatures: {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      default: [],
                      title: 'The x Schema',
                      items: {
                        type: 'object',
                        default: {},
                        title: 'A Schema',
                        required: ['name', 'value', 'setPolicy'],
                        properties: {
                          name: {
                            type: 'string',
                            default: '',
                            title: 'The name Schema',
                            examples: [''],
                          },
                          value: {
                            type: 'string',
                            default: '',
                            title: 'The value Schema',
                            examples: [''],
                          },
                          setPolicy: {
                            type: 'integer',
                            default: 0,
                            title: 'The setPolicy Schema',
                            examples: [1],
                          },
                        },
                      },
                    },
                  },
                },
              },
              type: {
                type: 'integer',
              },
              at: {
                type: 'integer',
              },
              atAsIndex: {
                type: 'boolean',
              },
              to: {
                type: 'integer',
              },
              toAsIndex: {
                type: 'boolean',
              },
              inputTag: {
                type: 'string',
              },
              outputTag: {
                type: 'string',
              },
              run: {
                type: 'integer',
              },
              toRun: {
                type: 'integer',
              },
              value: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
};
