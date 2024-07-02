/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Risk Scoring API
 *   version: 1
 */

import { z } from 'zod';

import { DateRange } from '../common/common.gen';

export type RiskEngineSettingsResponse = z.infer<typeof RiskEngineSettingsResponse>;
export const RiskEngineSettingsResponse = z.object({
  range: DateRange.optional(),
});
