/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { isTimeComparison } from '../components/shared/time_comparison/get_comparison_options';
import { useAnyOfApmParams } from './use_apm_params';
import { useFetcher } from './use_fetcher';
import { useTimeRange } from './use_time_range';

export function useCrashGroupDistributionFetcher({
  serviceName,
  groupId,
  kuery,
  environment,
}: {
  serviceName: string;
  groupId: string | undefined;
  kuery: string;
  environment: string;
}) {
  const {
    query: { rangeFrom, rangeTo, offset, comparisonEnabled },
  } = useAnyOfApmParams(
    '/services/{serviceName}/errors',
    '/mobile-services/{serviceName}/errors-and-crashes',
  );

  const { start, end } = useTimeRange({ rangeFrom, rangeTo });

  const { data, status } = useFetcher(
    (callApmApi) => {
      if (start && end) {
        return callApmApi(
          'GET /internal/apm/mobile-services/{serviceName}/crashes/distribution',
          {
            params: {
              path: { serviceName },
              query: {
                environment,
                kuery,
                start,
                end,
                offset:
                  comparisonEnabled && isTimeComparison(offset)
                    ? offset
                    : undefined,
                groupId,
              },
            },
          },
        );
      }
    },
    [
      environment,
      kuery,
      serviceName,
      start,
      end,
      offset,
      groupId,
      comparisonEnabled,
    ],
  );

  return { crashDistributionData: data, status };
}
