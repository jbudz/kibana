/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import React from 'react';
import { euiThemeVars } from '@kbn/ui-theme';
import { EuiSwitch } from '@elastic/eui';
import { AggFunctionsMapping } from '@kbn/data-plugin/public';
import { buildExpressionFunction } from '@kbn/expressions-plugin/public';
import { TimeScaleUnit } from '../../../../common/expressions';
import { OperationDefinition, ParamEditorProps } from '.';
import { FieldBasedIndexPatternColumn, ValueFormatConfig } from './column_types';
import { IndexPatternField } from '../../types';
import {
  getInvalidFieldMessage,
  getFilter,
  combineErrorMessages,
  getFormatFromPreviousColumn,
  isColumnOfType,
} from './helpers';
import {
  adjustTimeScaleLabelSuffix,
  adjustTimeScaleOnOtherColumnChange,
} from '../time_scale_utils';
import { getDisallowedPreviousShiftMessage } from '../../time_shift_utils';
import { updateColumnParam } from '../layer_helpers';

const countLabel = i18n.translate('xpack.lens.indexPattern.countOf', {
  defaultMessage: 'Count of records',
});

const supportedTypes = new Set([
  'string',
  'boolean',
  'number',
  'number_range',
  'ip',
  'ip_range',
  'date',
  'date_range',
  'murmur3',
]);

function ofName(
  field: IndexPatternField | undefined,
  timeShift: string | undefined,
  timeScale: string | undefined
) {
  return adjustTimeScaleLabelSuffix(
    field?.type !== 'document'
      ? i18n.translate('xpack.lens.indexPattern.valueCountOf', {
          defaultMessage: 'Count of {name}',
          values: {
            name: field?.displayName || '-',
          },
        })
      : countLabel,
    undefined,
    timeScale as TimeScaleUnit,
    undefined,
    timeShift
  );
}

export type CountIndexPatternColumn = FieldBasedIndexPatternColumn & {
  operationType: 'count';
  params?: {
    emptyAsNull?: boolean;
    format?: ValueFormatConfig;
  };
};

const SCALE = 'ratio';
const IS_BUCKETED = false;

export const countOperation: OperationDefinition<CountIndexPatternColumn, 'field', {}, true> = {
  type: 'count',
  displayName: i18n.translate('xpack.lens.indexPattern.count', {
    defaultMessage: 'Count',
  }),
  input: 'field',
  getErrorMessage: (layer, columnId, indexPattern) =>
    combineErrorMessages([
      getInvalidFieldMessage(layer.columns[columnId] as FieldBasedIndexPatternColumn, indexPattern),
      getDisallowedPreviousShiftMessage(layer, columnId),
    ]),
  allowAsReference: true,
  onFieldChange: (oldColumn, field) => {
    return {
      ...oldColumn,
      label: ofName(field, oldColumn.timeShift, oldColumn.timeShift),
      sourceField: field.name,
    };
  },
  getPossibleOperationForField: ({ aggregationRestrictions, aggregatable, type }) => {
    if (
      type === 'document' ||
      (aggregatable &&
        (!aggregationRestrictions || aggregationRestrictions.value_count) &&
        supportedTypes.has(type))
    ) {
      return { dataType: 'number', isBucketed: IS_BUCKETED, scale: SCALE };
    }
  },
  getDefaultLabel: (column, indexPattern) => {
    const field = indexPattern.getFieldByName(column.sourceField);
    return ofName(field, column.timeShift, column.timeScale);
  },
  buildColumn({ field, previousColumn }, columnParams) {
    return {
      label: ofName(field, previousColumn?.timeShift, previousColumn?.timeScale),
      dataType: 'number',
      operationType: 'count',
      isBucketed: false,
      scale: 'ratio',
      sourceField: field.name,
      timeScale: previousColumn?.timeScale,
      filter: getFilter(previousColumn, columnParams),
      timeShift: columnParams?.shift || previousColumn?.timeShift,
      params: {
        ...getFormatFromPreviousColumn(previousColumn),
        emptyAsNull:
          previousColumn && isColumnOfType<CountIndexPatternColumn>('count', previousColumn)
            ? previousColumn.params?.emptyAsNull
            : !columnParams?.usedInMath,
      },
    };
  },
  getAdvancedOptions: ({
    layer,
    columnId,
    currentColumn,
    paramEditorUpdater,
  }: ParamEditorProps<CountIndexPatternColumn>) => {
    return [
      {
        dataTestSubj: 'hide-zero-values',
        inlineElement: (
          <EuiSwitch
            label={i18n.translate('xpack.lens.indexPattern.hideZero', {
              defaultMessage: 'Hide zero values',
            })}
            labelProps={{
              style: {
                fontWeight: euiThemeVars.euiFontWeightMedium,
              },
            }}
            checked={Boolean(currentColumn.params?.emptyAsNull)}
            onChange={() => {
              paramEditorUpdater(
                updateColumnParam({
                  layer,
                  columnId,
                  paramName: 'emptyAsNull',
                  value: !currentColumn.params?.emptyAsNull,
                })
              );
            }}
            compressed
          />
        ),
      },
    ];
  },
  onOtherColumnChanged: (layer, thisColumnId) =>
    adjustTimeScaleOnOtherColumnChange<CountIndexPatternColumn>(layer, thisColumnId),
  toEsAggsFn: (column, columnId, indexPattern) => {
    const field = indexPattern.getFieldByName(column.sourceField);
    if (field?.type === 'document') {
      return buildExpressionFunction<AggFunctionsMapping['aggCount']>('aggCount', {
        id: columnId,
        enabled: true,
        schema: 'metric',
        // time shift is added to wrapping aggFilteredMetric if filter is set
        timeShift: column.filter ? undefined : column.timeShift,
        emptyAsNull: column.params?.emptyAsNull,
      }).toAst();
    } else {
      return buildExpressionFunction<AggFunctionsMapping['aggValueCount']>('aggValueCount', {
        id: columnId,
        enabled: true,
        schema: 'metric',
        field: column.sourceField,
        // time shift is added to wrapping aggFilteredMetric if filter is set
        timeShift: column.filter ? undefined : column.timeShift,
        emptyAsNull: column.params?.emptyAsNull,
      }).toAst();
    }
  },
  isTransferable: (column, newIndexPattern) => {
    const newField = newIndexPattern.getFieldByName(column.sourceField);

    return Boolean(
      newField &&
        (newField.type === 'document' ||
          (supportedTypes.has(newField.type) &&
            newField.aggregatable &&
            (!newField.aggregationRestrictions || newField.aggregationRestrictions.cardinality)))
    );
  },
  timeScalingMode: 'optional',
  filterable: true,
  documentation: {
    section: 'elasticsearch',
    signature: i18n.translate('xpack.lens.indexPattern.count.signature', {
      defaultMessage: '[field: string]',
    }),
    description: i18n.translate('xpack.lens.indexPattern.count.documentation.markdown', {
      defaultMessage: `
The total number of documents. When you provide a field as the first argument, the total number of field values is counted. Use the count function for fields that have multiple values in a single document.

#### Examples

To calculate the total number of documents, use \`count()\`.

To calculate the number of products in all orders, use \`count(products.id)\`.

To calculate the number of documents that match a specific filter, use \`count(kql='price > 500')\`.
      `,
    }),
  },
  shiftable: true,
};
