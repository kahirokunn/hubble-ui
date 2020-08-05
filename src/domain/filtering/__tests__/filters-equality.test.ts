import { Filters } from '~/domain/filtering';
import { FlowsFilterEntry } from '~/domain/flows';
import { Verdict } from '~/domain/hubble';

import * as combinations from '~/utils/iter-tools/combinations';

const nextElem = (idx: number, arr: any[]) => {
  return arr[(idx + 1) % arr.length];
};

const testCommonFiltersEquality = () => {
  const namespaces: Array<undefined | null | string> = [
    undefined,
    null,
    'random',
  ];

  const verdicts: Array<Verdict | undefined | null> = [
    undefined,
    null,
    Verdict.Forwarded,
    Verdict.Dropped,
  ];

  const httpStatuses: Array<undefined | null | string> = [
    undefined,
    null,
    '200',
    '200+',
    '400',
  ];

  const filters: Array<undefined | FlowsFilterEntry[]> = [
    undefined,
    [
      FlowsFilterEntry.parse('both:dns=google.com')!,
      FlowsFilterEntry.parse('from:ip=255.255.255.255')!,
    ],
    [
      FlowsFilterEntry.parse('to:label=k8s-app=core-api')!,
      FlowsFilterEntry.parse('from:label=k8s-app=crawler')!,
    ],
    [FlowsFilterEntry.parse('from:ip=158.183.221.43')!],
  ];

  const skipHosts: Array<undefined | boolean> = [undefined, false, true];
  const skipKubeDnss: Array<undefined | boolean> = [undefined, false, true];
  const skipRemoteApps: Array<undefined | boolean> = [undefined, false, true];
  const skipPrometheusApps = [undefined, false, true];

  combinations
    .arrays([
      namespaces.length,
      verdicts.length,
      httpStatuses.length,
      filters.length,
      skipHosts.length,
      skipKubeDnss.length,
      skipRemoteApps.length,
      skipPrometheusApps.length,
    ])
    .forEach((indices: number[], idx: number) => {
      const [
        nsIdx,
        verdictIdx,
        hsIdx,
        filtersIdx,
        shIdx,
        skdIdx,
        skrIdx,
        skpaIdx,
      ] = indices;

      const aFilters: Filters = Filters.fromObject({
        namespace: namespaces[nsIdx],
        verdict: verdicts[verdictIdx],
        httpStatus: httpStatuses[hsIdx],
        filters: filters[filtersIdx],
        skipHost: skipHosts[shIdx],
        skipKubeDns: skipKubeDnss[skdIdx],
        skipRemoteNode: skipRemoteApps[skrIdx],
        skipPrometheusApp: skipPrometheusApps[skpaIdx],
      });

      const bFilters: Filters = Filters.fromObject({
        namespace: nextElem(nsIdx, namespaces),
        verdict: nextElem(verdictIdx, verdicts),
        httpStatus: nextElem(hsIdx, httpStatuses),
        filters: nextElem(filtersIdx, filters),
        skipHost: nextElem(shIdx, skipHosts),
        skipKubeDns: nextElem(skdIdx, skipKubeDnss),
        skipRemoteNode: nextElem(skrIdx, skipRemoteApps),
        skipPrometheusApp: nextElem(skpaIdx, skipPrometheusApps),
      });

      test(`test ${idx * 2 + 1} > self-equality`, () => {
        const sameFilters = aFilters.clone();
        expect(aFilters.equals(sameFilters)).toBe(true);
      });

      test(`test ${idx * 2 + 2} > inequality`, () => {
        expect(aFilters.equals(bFilters)).toBe(false);
      });
    });
};

describe('filters equality check tests', () => {
  testCommonFiltersEquality();
});
