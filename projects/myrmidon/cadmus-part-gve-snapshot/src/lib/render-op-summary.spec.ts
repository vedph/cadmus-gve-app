import {
  ChainOperationContextStep,
  CharChainOperation,
  CharChainResult,
  OperationSummaryService,
} from '@myrmidon/gve-snapshot-rendition';

import { renderOperationSummary } from './render-op-summary';

const TYPE_NAMES = [
  'replace',
  'delete',
  'add-before',
  'add-after',
  'move-before',
  'move-after',
  'swap',
  'annotate',
];

/**
 * Create a fake summary service. Span and node texts are rendered as their
 * IDs and version tag, so that tests can verify which nodes were requested.
 */
function createService(step: Partial<ChainOperationContextStep> | null) {
  const service = {
    getStepByVersionTag: vi.fn(() => step),
    getOperationTypeName: vi.fn((type: number) => TYPE_NAMES[type] ?? '?'),
    escapeHtml: vi.fn((text: string) =>
      text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    ),
    getSpanText: vi.fn((ids: number[], tag: string) => `span${ids}@${tag}`),
    getNodeText: vi.fn((id: number, tag: string) => `node${id}@${tag}`),
    getContext: vi.fn(
      (ids: number[], tag: string, at?: number, atAsIndex?: boolean) =>
        `ctx${ids}@${tag}:${at}:${atAsIndex}`,
    ),
  };
  return service;
}

function render(
  op: Partial<CharChainOperation> | undefined,
  tags: { inputTag?: string; outputTag?: string } = {
    inputTag: 'v1',
    outputTag: 'v2',
  },
) {
  const service = createService(
    op ? { operation: op as CharChainOperation, ...tags } : null,
  );
  const html = renderOperationSummary(
    {} as CharChainResult,
    'v2',
    service as unknown as OperationSummaryService,
  );
  return { html, service };
}

describe('renderOperationSummary', () => {
  it('should return "No operation" when no step is found', () => {
    const { html, service } = render(undefined);
    expect(html).toBe('No operation');
    expect(service.getStepByVersionTag).toHaveBeenCalledWith('v2');
  });

  it('should return "No operation" when the step has no operation', () => {
    const service = createService({ inputTag: 'v1', outputTag: 'v2' });
    const html = renderOperationSummary(
      {} as CharChainResult,
      'v2',
      service as unknown as OperationSummaryService,
    );
    expect(html).toBe('No operation');
  });

  describe('header', () => {
    it('should render type, tags and ID', () => {
      const { html } = render({ id: 'op1', type: 1, at: 1, run: 1 });
      expect(html).toContain('<span class="op-type">delete</span>');
      expect(html).toContain('<span class="op-tags">v1 → v2</span>');
      expect(html).toContain('<span class="op-id">[op1]</span>');
    });

    it('should render "?" for missing version tags and empty ID', () => {
      const { html } = render({ type: 1, at: 1, run: 1 }, {});
      expect(html).toContain('<span class="op-tags">? → ?</span>');
      expect(html).toContain('<span class="op-id">[]</span>');
    });

    it('should render a non-zero rank', () => {
      const { html } = render({ id: 'x', type: 1, rank: 2 });
      expect(html).toContain('<span class="op-rank">rank:2</span>');
    });

    it('should not render a zero rank', () => {
      const { html } = render({ id: 'x', type: 1, rank: 0 });
      expect(html).not.toContain('op-rank">');
    });

    it('should render the group ID, escaped', () => {
      const { html } = render({ id: 'x', type: 1, groupId: 'g<1>' });
      expect(html).toContain('<span class="op-group">group:g&lt;1&gt;</span>');
    });

    it('should escape the operation ID', () => {
      const { html } = render({ id: '<b>', type: 1 });
      expect(html).toContain('[&lt;b&gt;]');
    });
  });

  describe('DSL', () => {
    it('should render the DSL when present', () => {
      const { html } = render({ id: 'x', type: 1, dsl: '@1x1 <' });
      expect(html).toContain(
        '<div class="op-dsl"><code>@1x1 &lt;</code></div>',
      );
    });

    it('should not render the DSL when absent', () => {
      const { html } = render({ id: 'x', type: 1 });
      expect(html).not.toContain('<div class="op-dsl">');
    });
  });

  describe('description', () => {
    it('should describe replace using input tag', () => {
      const { html, service } = render({
        type: 0,
        at: 3,
        run: 2,
        value: 'ab',
        atAsIndex: true,
      });
      expect(service.getSpanText).toHaveBeenCalledWith([3, 4], 'v1');
      expect(service.getContext).toHaveBeenCalledWith([3, 4], 'v1', 3, true);
      expect(html).toContain(
        '<div class="op-desc">Replace <span class="op-text-old">"span3,4@v1"</span> ' +
          'with <span class="op-text-new">"ab"</span> ' +
          'in <span class="op-context">"ctx3,4@v1:3:true"</span></div>',
      );
    });

    it('should describe replace with defaults when at, run, value are missing', () => {
      const { html, service } = render({ type: 0 });
      expect(service.getSpanText).toHaveBeenCalledWith([], 'v1');
      expect(service.getContext).toHaveBeenCalledWith([], 'v1', undefined, false);
      expect(html).toContain('with <span class="op-text-new">""</span>');
    });

    it('should describe delete using input tag', () => {
      const { html, service } = render({ type: 1, at: 5, run: 1 });
      expect(service.getSpanText).toHaveBeenCalledWith([5], 'v1');
      expect(html).toContain(
        '<div class="op-desc">Delete <span class="op-text-old">"span5@v1"</span> ' +
          'in <span class="op-context">"ctx5@v1:5:false"</span></div>',
      );
    });

    it('should describe add-before using output tag', () => {
      const { html, service } = render({ type: 2, at: 7, value: 'x' });
      expect(service.getNodeText).toHaveBeenCalledWith(7, 'v2');
      expect(service.getContext).toHaveBeenCalledWith([7], 'v2', 7, false);
      expect(html).toContain(
        '<div class="op-desc">Add <span class="op-text-new">"x"</span> before ' +
          '<span class="op-anchor">"node7@v2"</span> ' +
          'in <span class="op-context">"ctx7@v2:7:false"</span></div>',
      );
    });

    it('should describe add-after using output tag', () => {
      const { html } = render({ type: 3, at: 7, value: 'x' });
      expect(html).toContain(
        '<div class="op-desc">Add <span class="op-text-new">"x"</span> after ' +
          '<span class="op-anchor">"node7@v2"</span>',
      );
    });

    it('should describe add with anchor 0 and empty value by default', () => {
      const { html, service } = render({ type: 2 });
      expect(service.getNodeText).toHaveBeenCalledWith(0, 'v2');
      expect(html).toContain('<span class="op-text-new">""</span> before');
    });

    it('should describe move-before using to as anchor', () => {
      const { html, service } = render({
        type: 4,
        at: 1,
        run: 2,
        to: 9,
        toAsIndex: true,
      });
      expect(service.getSpanText).toHaveBeenCalledWith([1, 2], 'v2');
      expect(service.getNodeText).toHaveBeenCalledWith(9, 'v2');
      expect(service.getContext).toHaveBeenCalledWith([9], 'v2', 9, true);
      expect(html).toContain(
        '<div class="op-desc">Move <span class="op-text-moved">"span1,2@v2"</span> before ' +
          '<span class="op-anchor">"node9@v2"</span>',
      );
    });

    it('should describe move-after using to as anchor', () => {
      const { html } = render({ type: 5, at: 1, run: 1, to: 9 });
      expect(html).toContain(
        '<div class="op-desc">Move <span class="op-text-moved">"span1@v2"</span> after ' +
          '<span class="op-anchor">"node9@v2"</span>',
      );
    });

    it('should describe move with defaults when at, run, to are missing', () => {
      const { service } = render({ type: 4 });
      expect(service.getSpanText).toHaveBeenCalledWith([], 'v2');
      expect(service.getNodeText).toHaveBeenCalledWith(0, 'v2');
    });

    it('should describe swap with both spans', () => {
      const { html, service } = render({
        type: 6,
        at: 1,
        run: 2,
        to: 10,
        toRun: 3,
      });
      expect(service.getSpanText).toHaveBeenCalledWith([1, 2], 'v2');
      expect(service.getSpanText).toHaveBeenCalledWith([10, 11, 12], 'v2');
      expect(service.getContext).toHaveBeenCalledWith([1, 2], 'v2', 1, false);
      expect(html).toContain(
        '<div class="op-desc">Swap <span class="op-text-moved">"span1,2@v2"</span> with ' +
          '<span class="op-text-moved">"span10,11,12@v2"</span>',
      );
    });

    it('should describe swap with empty spans by default', () => {
      const { service } = render({ type: 6 });
      expect(service.getSpanText).toHaveBeenNthCalledWith(1, [], 'v2');
      expect(service.getSpanText).toHaveBeenNthCalledWith(2, [], 'v2');
    });

    it('should describe annotate using output tag', () => {
      const { html, service } = render({
        type: 7,
        at: 2,
        run: 2,
        atAsIndex: true,
      });
      expect(service.getSpanText).toHaveBeenCalledWith([2, 3], 'v2');
      expect(service.getContext).toHaveBeenCalledWith([2, 3], 'v2', 2, true);
      expect(html).toContain(
        '<div class="op-desc">Annotate <span class="op-text-annotated">"span2,3@v2"</span> ' +
          'in <span class="op-context">"ctx2,3@v2:2:true"</span></div>',
      );
    });

    it('should describe annotate with an empty span by default', () => {
      const { service } = render({ type: 7 });
      expect(service.getSpanText).toHaveBeenCalledWith([], 'v2');
    });

    it('should describe an unknown operation type', () => {
      const { html } = render({ type: 99 as any });
      expect(html).toContain(
        '<div class="op-desc">Unknown operation type</div>',
      );
    });

    it('should escape texts in the description', () => {
      const { html } = render({ type: 0, at: 1, run: 1, value: '<i>' });
      expect(html).toContain('<span class="op-text-new">"&lt;i&gt;"</span>');
    });
  });

  describe('sources', () => {
    it('should not render sources when absent', () => {
      const { html } = render({ type: 1 });
      expect(html).not.toContain('<div class="op-sources">');
    });

    it('should not render sources when empty', () => {
      const { html } = render({ type: 1, sources: [] });
      expect(html).not.toContain('<div class="op-sources">');
    });

    it('should render a source with ID only', () => {
      const { html } = render({ type: 1, sources: [{ id: 's1' } as any] });
      expect(html).toContain(
        '<div class="op-sources"><div class="op-source">' +
          '<span class="source-id">s1</span></div></div>',
      );
    });

    it('should render all source properties, escaped', () => {
      const { html } = render({
        type: 1,
        sources: [
          { id: 's<1>', type: 'ms', rank: 0, note: 'a & b' },
          { id: 's2', type: 'ed', rank: 2 },
        ] as any,
      });
      expect(html).toContain(
        '<div class="op-source"><span class="source-id">s&lt;1&gt;</span> ' +
          '<span class="source-type">(ms)</span> ' +
          '<span class="source-rank">rank:0</span> ' +
          '<span class="source-note">a &amp; b</span></div>',
      );
      expect(html).toContain(
        '<div class="op-source"><span class="source-id">s2</span> ' +
          '<span class="source-type">(ed)</span> ' +
          '<span class="source-rank">rank:2</span></div>',
      );
    });
  });

  it('should include the summary styles', () => {
    const { html } = render({ type: 1 });
    expect(html).toContain('<style>');
    expect(html).toContain('.op-summary-header');
  });
});
