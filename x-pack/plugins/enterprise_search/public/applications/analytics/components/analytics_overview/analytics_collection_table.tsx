/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo, useState } from 'react';

import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiPanel,
  EuiSuperDatePicker,
  EuiSuperDatePickerCommonRange,
  EuiSearchBar,
  EuiFlexGroup,
  EuiSpacer,
  EuiButtonGroup,
  useEuiTheme,
  EuiButton,
} from '@elastic/eui';

import { OnTimeChangeProps } from '@elastic/eui/src/components/date_picker/super_date_picker/super_date_picker';
import { i18n } from '@kbn/i18n';

import { AnalyticsCollection } from '../../../../../common/types/analytics';
import { AddAnalyticsCollection } from '../add_analytics_collections/add_analytics_collection';

import { AnalyticsCollectionCardWithLens } from './analytics_collection_card/analytics_collection_card';

import { FilterBy } from './analytics_collection_card/with_lens_data';
import { AnalyticsCollectionTableStyles } from './analytics_collection_table.styles';

const defaultQuickRanges: EuiSuperDatePickerCommonRange[] = [
  {
    end: 'now',
    label: i18n.translate('xpack.enterpriseSearch.analytics..units.quickRange.last7Days', {
      defaultMessage: 'Last 7 days',
    }),
    start: 'now-7d',
  },
  {
    end: 'now',
    label: i18n.translate('xpack.enterpriseSearch.analytics..units.quickRange.last2Weeks', {
      defaultMessage: 'Last 2 weeks',
    }),
    start: 'now-14d',
  },
  {
    end: 'now',
    label: i18n.translate('xpack.enterpriseSearch.analytics..units.quickRange.last30Days', {
      defaultMessage: 'Last 30 days',
    }),
    start: 'now-30d',
  },
  {
    end: 'now',
    label: i18n.translate('xpack.enterpriseSearch.analytics..units.quickRange.last90Days', {
      defaultMessage: 'Last 90 days',
    }),
    start: 'now-90d',
  },
  {
    end: 'now',
    label: i18n.translate('xpack.enterpriseSearch.analytics..units.quickRange.last1Year', {
      defaultMessage: 'Last 1 year',
    }),
    start: 'now-1y',
  },
];

interface AnalyticsCollectionTableProps {
  collections: AnalyticsCollection[];
}

export const AnalyticsCollectionTable: React.FC<AnalyticsCollectionTableProps> = ({
  collections,
}) => {
  const { euiTheme } = useEuiTheme();
  const analyticsCollectionTableStyles = AnalyticsCollectionTableStyles(euiTheme);
  const filterOptions = useMemo<Array<{ id: FilterBy; label: string }>>(
    () => [
      {
        css: [analyticsCollectionTableStyles.button],
        id: FilterBy.Searches,
        label: i18n.translate('xpack.enterpriseSearch.analytics.filtering.searches', {
          defaultMessage: 'Searches',
        }),
      },
      {
        css: [analyticsCollectionTableStyles.button],
        id: FilterBy.NoResults,
        label: i18n.translate('xpack.enterpriseSearch.analytics.filtering.noResults', {
          defaultMessage: 'No results',
        }),
      },
    ],
    [analyticsCollectionTableStyles.button]
  );
  const [filterId, setFilterId] = useState<string>(filterOptions[0].id);
  const [timeRange, setTimeRange] = useState<{ from: string; to: string }>({
    from: defaultQuickRanges[0].start,
    to: defaultQuickRanges[0].end,
  });
  const handleTimeChange = ({ start, end }: OnTimeChangeProps) => {
    setTimeRange({ from: start, to: end });
  };
  const selectedFilterLabel = filterOptions.find(({ id }) => id === filterId)?.label;

  return (
    <EuiFlexGroup direction="column">
      <EuiPanel color="subdued" borderRadius="none" hasShadow={false}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiSearchBar
              box={{
                placeholder: i18n.translate('xpack.enterpriseSearch.analytics.searchPlaceholder', {
                  defaultMessage: 'Search collection names',
                }),
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonGroup
              css={analyticsCollectionTableStyles.buttonGroup}
              onChange={setFilterId}
              color="primary"
              buttonSize="compressed"
              idSelected={filterId}
              isFullWidth
              options={filterOptions}
              legend="Filter Collection"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiSuperDatePicker
                  start={timeRange.from}
                  end={timeRange.to}
                  onTimeChange={handleTimeChange}
                  showUpdateButton={false}
                  width="full"
                  commonlyUsedRanges={defaultQuickRanges}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <EuiFlexGrid columns={3}>
        {collections.map((collection) => (
          <AnalyticsCollectionCardWithLens
            key={collection.name}
            collection={collection}
            subtitle={selectedFilterLabel}
            filterBy={filterId}
            timeRange={timeRange}
          />
        ))}
      </EuiFlexGrid>
      <AddAnalyticsCollection
        render={(onClick) => (
          <EuiButton
            iconType="plusInCircleFilled"
            css={analyticsCollectionTableStyles.newCollection}
            onClick={onClick}
          >
            {i18n.translate('xpack.enterpriseSearch.analytics.createNewCollection', {
              defaultMessage: 'Create new collection',
            })}
          </EuiButton>
        )}
      />
    </EuiFlexGroup>
  );
};
