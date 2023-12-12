/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z } from 'zod';

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 */

import { AlertSuppressionDuration } from '../common_attributes.gen';

/**
  * Describes how alerts will be generated for documents with missing suppress by fields:
doNotSuppress - per each document a separate alert will be created
suppress - only alert will be created per suppress by bucket
  */
export type AlertSuppressionMissingFieldsStrategy = z.infer<
  typeof AlertSuppressionMissingFieldsStrategy
>;
export const AlertSuppressionMissingFieldsStrategy = z.enum(['doNotSuppress', 'suppress']);
export type AlertSuppressionMissingFieldsStrategyEnum =
  typeof AlertSuppressionMissingFieldsStrategy.enum;
export const AlertSuppressionMissingFieldsStrategyEnum = AlertSuppressionMissingFieldsStrategy.enum;

export type AlertSuppressionGroupBy = z.infer<typeof AlertSuppressionGroupBy>;
export const AlertSuppressionGroupBy = z.array(z.string()).min(1).max(3);

export type AlertSuppression = z.infer<typeof AlertSuppression>;
export const AlertSuppression = z.object({
  group_by: AlertSuppressionGroupBy,
  duration: AlertSuppressionDuration.optional(),
  missing_fields_strategy: AlertSuppressionMissingFieldsStrategy.optional(),
});

export type AlertSuppressionCamel = z.infer<typeof AlertSuppressionCamel>;
export const AlertSuppressionCamel = z.object({
  groupBy: AlertSuppressionGroupBy,
  duration: AlertSuppressionDuration.optional(),
  missingFieldsStrategy: AlertSuppressionMissingFieldsStrategy.optional(),
});
