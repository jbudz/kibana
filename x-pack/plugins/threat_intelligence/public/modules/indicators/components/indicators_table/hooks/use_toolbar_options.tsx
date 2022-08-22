/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiText } from '@elastic/eui';
import { BrowserField } from '@kbn/triggers-actions-ui-plugin/public/application/sections/field_browser/types';
import React from 'react';
import { useMemo } from 'react';
import { RawIndicatorFieldId } from '../../../../../../common/types/indicator';
import { IndicatorsFieldBrowser } from '../../indicators_field_browser';
import { ComputedIndicatorFieldId } from '../cell_renderer';

export interface Column {
  id: RawIndicatorFieldId | ComputedIndicatorFieldId;
  displayAsText: string;
}

export const useToolbarOptions = ({
  browserFields,
  start,
  end,
  indicatorCount,
  columns,
  onResetColumns,
  onToggleColumn,
}: {
  browserFields: Readonly<Record<string, Partial<BrowserField>>>;
  start: number;
  end: number;
  indicatorCount: number;
  columns: Column[];
  onResetColumns: () => void;
  onToggleColumn: (columnId: string) => void;
}) =>
  useMemo(
    () => ({
      showDisplaySelector: false,
      showFullScreenSelector: false,
      additionalControls: {
        left: {
          prepend: (
            <EuiText style={{ display: 'inline' }} size="xs">
              {indicatorCount && end ? (
                <>
                  Showing {start + 1}-{end > indicatorCount ? indicatorCount : end} of{' '}
                  {indicatorCount} indicators
                </>
              ) : (
                <>-</>
              )}
            </EuiText>
          ),
          append: (
            <IndicatorsFieldBrowser
              browserFields={browserFields}
              columnIds={columns.map(({ id }) => id)}
              onResetColumns={onResetColumns}
              onToggleColumn={onToggleColumn}
            />
          ),
        },
      },
    }),
    [start, end, indicatorCount, browserFields, columns, onResetColumns, onToggleColumn]
  );
