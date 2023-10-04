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

/**
 * A universally unique identifier
 */
export type UUID = z.infer<typeof UUID>;
export const UUID = z.string();

export type RuleObjectId = z.infer<typeof RuleObjectId>;
export const RuleObjectId = z.string();

/**
 * Could be any string, not necessarily a UUID
 */
export type RuleSignatureId = z.infer<typeof RuleSignatureId>;
export const RuleSignatureId = z.string();

export type RuleName = z.infer<typeof RuleName>;
export const RuleName = z.string().min(1);

export type RuleDescription = z.infer<typeof RuleDescription>;
export const RuleDescription = z.string().min(1);

export type RuleVersion = z.infer<typeof RuleVersion>;
export const RuleVersion = z.string();

export type IsRuleImmutable = z.infer<typeof IsRuleImmutable>;
export const IsRuleImmutable = z.boolean();

export type IsRuleEnabled = z.infer<typeof IsRuleEnabled>;
export const IsRuleEnabled = z.boolean();

export type RuleTagArray = z.infer<typeof RuleTagArray>;
export const RuleTagArray = z.array(z.string());

export type RuleMetadata = z.infer<typeof RuleMetadata>;
export const RuleMetadata = z.object({});

export type RuleLicense = z.infer<typeof RuleLicense>;
export const RuleLicense = z.string();

export type RuleAuthorArray = z.infer<typeof RuleAuthorArray>;
export const RuleAuthorArray = z.array(z.string());

export type RuleFalsePositiveArray = z.infer<typeof RuleFalsePositiveArray>;
export const RuleFalsePositiveArray = z.array(z.string());

export type RuleReferenceArray = z.infer<typeof RuleReferenceArray>;
export const RuleReferenceArray = z.array(z.string());

export type InvestigationGuide = z.infer<typeof InvestigationGuide>;
export const InvestigationGuide = z.string();

export type SetupGuide = z.infer<typeof SetupGuide>;
export const SetupGuide = z.string();

export type BuildingBlockType = z.infer<typeof BuildingBlockType>;
export const BuildingBlockType = z.string();

export type AlertsIndex = z.infer<typeof AlertsIndex>;
export const AlertsIndex = z.string();

export type AlertsIndexNamespace = z.infer<typeof AlertsIndexNamespace>;
export const AlertsIndexNamespace = z.string();

export type MaxSignals = z.infer<typeof MaxSignals>;
export const MaxSignals = z.number().int().min(1);

export type Subtechnique = z.infer<typeof Subtechnique>;
export const Subtechnique = z.object({
  /**
   * Subtechnique ID
   */
  id: z.string(),
  /**
   * Subtechnique name
   */
  name: z.string(),
  /**
   * Subtechnique reference
   */
  reference: z.string(),
});

export type Technique = z.infer<typeof Technique>;
export const Technique = z.object({
  /**
   * Technique ID
   */
  id: z.string(),
  /**
   * Technique name
   */
  name: z.string(),
  /**
   * Technique reference
   */
  reference: z.string(),
  /**
   * Array containing more specific information on the attack technique
   */
  subtechnique: z.array(Subtechnique).optional(),
});

export type Threat = z.infer<typeof Threat>;
export const Threat = z.object({
  /**
   * Relevant attack framework
   */
  framework: z.string(),
  tactic: z.object({
    /**
     * Tactic ID
     */
    id: z.string(),
    /**
     * Tactic name
     */
    name: z.string(),
    /**
     * Tactic reference
     */
    reference: z.string(),
  }),
  /**
   * Array containing information on the attack techniques (optional)
   */
  technique: z.array(Technique).optional(),
});

export type ThreatArray = z.infer<typeof ThreatArray>;
export const ThreatArray = z.array(Threat);

export type IndexPatternArray = z.infer<typeof IndexPatternArray>;
export const IndexPatternArray = z.array(z.string());

export type DataViewId = z.infer<typeof DataViewId>;
export const DataViewId = z.string();

export type RuleQuery = z.infer<typeof RuleQuery>;
export const RuleQuery = z.string();

export type RuleFilterArray = z.infer<typeof RuleFilterArray>;
export const RuleFilterArray = z.array(z.object({}));

export type RuleNameOverride = z.infer<typeof RuleNameOverride>;
export const RuleNameOverride = z.string();

export type TimestampOverride = z.infer<typeof TimestampOverride>;
export const TimestampOverride = z.string();

export type TimestampOverrideFallbackDisabled = z.infer<typeof TimestampOverrideFallbackDisabled>;
export const TimestampOverrideFallbackDisabled = z.boolean();

export type RequiredField = z.infer<typeof RequiredField>;
export const RequiredField = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  ecs: z.boolean().optional(),
});

export type RequiredFieldArray = z.infer<typeof RequiredFieldArray>;
export const RequiredFieldArray = z.array(RequiredField);

export type TimelineTemplateId = z.infer<typeof TimelineTemplateId>;
export const TimelineTemplateId = z.string();

export type TimelineTemplateTitle = z.infer<typeof TimelineTemplateTitle>;
export const TimelineTemplateTitle = z.string();

export type SavedObjectResolveOutcome = z.infer<typeof SavedObjectResolveOutcome>;
export const SavedObjectResolveOutcome = z.enum(['exactMatch', 'aliasMatch', 'conflict']);
export const SavedObjectResolveOutcomeEnum = SavedObjectResolveOutcome.enum;
export type SavedObjectResolveOutcomeEnum = typeof SavedObjectResolveOutcome.enum;

export type SavedObjectResolveAliasTargetId = z.infer<typeof SavedObjectResolveAliasTargetId>;
export const SavedObjectResolveAliasTargetId = z.string();

export type SavedObjectResolveAliasPurpose = z.infer<typeof SavedObjectResolveAliasPurpose>;
export const SavedObjectResolveAliasPurpose = z.enum([
  'savedObjectConversion',
  'savedObjectImport',
]);
export const SavedObjectResolveAliasPurposeEnum = SavedObjectResolveAliasPurpose.enum;
export type SavedObjectResolveAliasPurposeEnum = typeof SavedObjectResolveAliasPurpose.enum;

export type RelatedIntegration = z.infer<typeof RelatedIntegration>;
export const RelatedIntegration = z.object({
  package: z.string().min(1),
  version: z.string().min(1),
  integration: z.string().min(1).optional(),
});

export type RelatedIntegrationArray = z.infer<typeof RelatedIntegrationArray>;
export const RelatedIntegrationArray = z.array(RelatedIntegration);
