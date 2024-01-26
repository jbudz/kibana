/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';

export const getJoinMetricsRequestName = (layerName: string) => {
  return i18n.translate('xpack.maps.joinSource.joinMetricsRequestName', {
    defaultMessage: 'load join metrics ({layerName})',
    values: { layerName },
  });
};
