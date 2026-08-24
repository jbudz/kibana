/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { BuildkiteCommandStep } from '../../buildkite';
import { N2_SPOT_ZONES, spot } from '../agents';
import { NO_RETRY, RETRY_FLAKY, RETRY_INFRA } from '../retry';

const AGENTS = {
  standard: spot('n2-standard-4', N2_SPOT_ZONES),
  highmem: spot('n2-highmem-4', N2_SPOT_ZONES),
  virt: { ...spot('n2-highmem-4', N2_SPOT_ZONES), enableNestedVirtualization: true },
  virt_standard: { ...spot('n2-standard-4', N2_SPOT_ZONES), enableNestedVirtualization: true },
};

export type PrSecurityCypressGroup =
  | 'ai4dsoc'
  | 'ai_assistant'
  | 'asset_inventory'
  | 'cloud_security_posture'
  | 'cypress_burn'
  | 'defend_workflows'
  | 'detection_engine'
  | 'entity_analytics'
  | 'explore'
  | 'investigations'
  | 'osquery_cypress'
  | 'rule_management';

export interface CypressSuite {
  readonly script: string;
  readonly label: string;
  /** Serverless suites only run against main. */
  readonly mainOnly?: true;
  readonly prOnly?: true;
  readonly parallelism?: number;
  readonly agent?: keyof typeof AGENTS;
  readonly timeoutMinutes?: number;
  readonly prKey: string;
  readonly prGroup: PrSecurityCypressGroup;
}

export const SECURITY_CYPRESS_SUITES: readonly CypressSuite[] = [
  {
    script: 'security_serverless_entity_analytics.sh',
    label: 'Serverless Entity Analytics - Security Cypress Tests',
    mainOnly: true,
    parallelism: 2,
    prKey: 'security-serverless-entity-analytics',
    prGroup: 'entity_analytics',
  },
  {
    script: 'security_serverless_explore.sh',
    label: 'Serverless Explore - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 4,
    prKey: 'security-serverless-explore',
    prGroup: 'explore',
  },
  {
    script: 'security_serverless_investigations.sh',
    label: 'Serverless Investigations - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 14,
    prKey: 'security-serverless-investigations',
    prGroup: 'investigations',
  },
  {
    script: 'security_serverless_rule_management.sh',
    label: 'Serverless Rule Management - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 8,
    prKey: 'security-serverless-rule-management',
    prGroup: 'rule_management',
  },
  {
    script: 'security_serverless_rule_management_prebuilt_rules_customization.sh',
    label:
      'Serverless Rule Management - Prebuilt Rules Customization - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 1,
    prKey: 'security-serverless-rule-management-prebuilt-customization',
    prGroup: 'rule_management',
  },
  {
    script: 'security_serverless_rule_management_prebuilt_rules_installation.sh',
    label:
      'Serverless Rule Management - Prebuilt Rules Installation - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 2,
    prKey: 'security-serverless-rule-management-prebuilt-installation',
    prGroup: 'rule_management',
  },
  {
    script: 'security_serverless_rule_management_prebuilt_rules_management.sh',
    label:
      'Serverless Rule Management - Prebuilt Rules Management - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 1,
    prKey: 'security-serverless-rule-management-prebuilt-management',
    prGroup: 'rule_management',
  },
  {
    script: 'security_serverless_rule_management_prebuilt_rules_upgrade.sh',
    label: 'Serverless Rule Management - Prebuilt Rules Upgrade - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 2,
    prKey: 'security-serverless-rule-management-prebuilt-upgrade',
    prGroup: 'rule_management',
  },
  {
    script: 'security_solution_rule_management.sh',
    label: 'Rule Management - Security Solution Cypress Tests',
    parallelism: 6,
    prKey: 'security-rule-management',
    prGroup: 'rule_management',
  },
  {
    script: 'security_solution_rule_management_prebuilt_rules_customization.sh',
    label: 'Rule Management - Prebuilt Rules Customization - Security Solution Cypress Tests',
    parallelism: 1,
    prKey: 'security-rule-management-prebuilt-customization',
    prGroup: 'rule_management',
  },
  {
    script: 'security_solution_rule_management_prebuilt_rules_installation.sh',
    label: 'Rule Management - Prebuilt Rules Installation - Security Solution Cypress Tests',
    parallelism: 1,
    prKey: 'security-rule-management-prebuilt-installation',
    prGroup: 'rule_management',
  },
  {
    script: 'security_solution_rule_management_prebuilt_rules_management.sh',
    label: 'Rule Management - Prebuilt Rules Management - Security Solution Cypress Tests',
    parallelism: 1,
    prKey: 'security-rule-management-prebuilt-management',
    prGroup: 'rule_management',
  },
  {
    script: 'security_solution_rule_management_prebuilt_rules_upgrade.sh',
    label: 'Rule Management - Prebuilt Rules Upgrade - Security Solution Cypress Tests',
    parallelism: 2,
    prKey: 'security-rule-management-prebuilt-upgrade',
    prGroup: 'rule_management',
  },
  {
    script: 'security_serverless_detection_engine.sh',
    label: 'Serverless Detection Engine - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 8,
    prKey: 'security-serverless-detection-engine',
    prGroup: 'detection_engine',
  },
  {
    script: 'security_serverless_detection_engine_exceptions.sh',
    label: 'Serverless Detection Engine - Exceptions - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 3,
    prKey: 'security-serverless-detection-engine-exceptions',
    prGroup: 'detection_engine',
  },
  {
    script: 'security_solution_detection_engine.sh',
    label: 'Detection Engine - Security Solution Cypress Tests',
    parallelism: 7,
    prKey: 'security-detection-engine',
    prGroup: 'detection_engine',
  },
  {
    script: 'security_solution_detection_engine_exceptions.sh',
    label: 'Detection Engine - Exceptions - Security Solution Cypress Tests',
    parallelism: 2,
    prKey: 'security-detection-engine-exceptions',
    prGroup: 'detection_engine',
  },
  {
    script: 'security_serverless_ai_assistant.sh',
    label: 'Serverless AI Assistant - Security Solution Cypress Tests',
    mainOnly: true,
    parallelism: 1,
    prKey: 'security-serverless-ai-assistant',
    prGroup: 'ai_assistant',
  },
  {
    script: 'security_solution_ai_assistant.sh',
    label: 'AI Assistant - Security Solution Cypress Tests',
    parallelism: 1,
    prKey: 'security-ai-assistant',
    prGroup: 'ai_assistant',
  },
  {
    script: 'security_serverless_ai4dsoc.sh',
    label: 'Serverless AI4DSOC - Security Solution Cypress Tests',
    mainOnly: true,
    prOnly: true,
    parallelism: 1,
    prKey: 'security-serverless-ai4dsoc',
    prGroup: 'ai4dsoc',
  },
  {
    script: 'security_solution_entity_analytics.sh',
    label: 'Entity Analytics - Security Solution Cypress Tests',
    parallelism: 2,
    prKey: 'security-entity-analytics',
    prGroup: 'entity_analytics',
  },
  {
    script: 'security_solution_explore.sh',
    label: 'Explore - Security Solution Cypress Tests',
    parallelism: 2,
    prKey: 'security-explore',
    prGroup: 'explore',
  },
  {
    script: 'security_solution_investigations.sh',
    label: 'Investigations - Security Solution Cypress Tests',
    parallelism: 9,
    prKey: 'security-investigations',
    prGroup: 'investigations',
  },
  {
    script: 'osquery_cypress.sh',
    label: 'Osquery Cypress Tests',
    agent: 'highmem',
    parallelism: 4,
    prKey: 'osquery-cypress',
    prGroup: 'osquery_cypress',
  },
  {
    script: 'security_serverless_osquery.sh',
    label: 'Osquery Cypress Tests on Serverless',
    mainOnly: true,
    agent: 'highmem',
    parallelism: 3,
    prKey: 'osquery-serverless',
    prGroup: 'osquery_cypress',
  },
  {
    script: 'asset_inventory.sh',
    label: 'Asset Inventory Cypress Tests',
    prOnly: true,
    parallelism: 1,
    prKey: 'asset-inventory',
    prGroup: 'asset_inventory',
  },
  {
    script: 'asset_inventory.sh',
    label: 'Asset Inventory Cypress Tests on Serverless',
    mainOnly: true,
    prOnly: true,
    parallelism: 1,
    prKey: 'asset-inventory-serverless',
    prGroup: 'asset_inventory',
  },
  {
    script: 'cloud_security_posture.sh',
    label: 'Cloud Security Posture Cypress Tests',
    prOnly: true,
    parallelism: 1,
    prKey: 'cloud-security-posture',
    prGroup: 'cloud_security_posture',
  },
  {
    script: 'cloud_security_posture_serverless.sh',
    label: 'Cloud Security Posture Cypress Tests on Serverless',
    mainOnly: true,
    prOnly: true,
    parallelism: 1,
    prKey: 'cloud-security-posture-serverless',
    prGroup: 'cloud_security_posture',
  },
  {
    script: 'defend_workflows.sh',
    label: 'Defend Workflows Cypress Tests',
    agent: 'virt',
    parallelism: 24,
    prKey: 'defend-workflows',
    prGroup: 'defend_workflows',
  },
  {
    script: 'defend_workflows_serverless.sh',
    label: 'Defend Workflows Cypress Tests on Serverless',
    mainOnly: true,
    agent: 'virt',
    parallelism: 16,
    prKey: 'defend-workflows-serverless',
    prGroup: 'defend_workflows',
  },
  {
    script: 'defend_workflows_burn.sh',
    label: '[Soft fail] Defend Workflows Cypress Tests, burning changed specs',
    agent: 'virt_standard',
    parallelism: 1,
    prKey: 'defend-workflows-burn',
    prGroup: 'cypress_burn',
  },
  {
    script: 'defend_workflows_serverless_burn.sh',
    label: '[Soft fail] Defend Workflows Cypress Tests on Serverless, burning changed specs',
    mainOnly: true,
    agent: 'virt_standard',
    parallelism: 1,
    prKey: 'defend-workflows-serverless-burn',
    prGroup: 'cypress_burn',
  },
  {
    script: 'security_solution_burn.sh',
    label: '[Soft fail] Security Solution Cypress tests, burning changed specs',
    parallelism: 1,
    prKey: 'security-solution-burn',
    prGroup: 'cypress_burn',
  },
  {
    script: 'osquery_cypress_burn.sh',
    label: '[Soft fail] Osquery Cypress Tests, burning changed specs',
    timeoutMinutes: 50,
    prKey: 'osquery-cypress-burn',
    prGroup: 'cypress_burn',
  },
];

// on_merge: the triggered kibana-security-solution-on-merge pipeline, which reuses the parent build.
// variant: chrome_forward_testing / node_* pipelines, which build in-pipeline and only run main.
type Context = 'pr' | 'on_merge' | 'variant';

const cypressStep = (suite: CypressSuite, context: Context): BuildkiteCommandStep => {
  const burn = suite.prGroup === 'cypress_burn';
  return {
    command: `.buildkite/scripts/steps/functional/${suite.script}`,
    label: suite.label,
    ...(context === 'pr' ? { key: suite.prKey } : {}),
    ...(suite.mainOnly && context === 'on_merge' ? { branches: 'main' } : {}),
    ...(suite.mainOnly && context === 'pr'
      ? { if: "build.env('GITHUB_PR_TARGET_BRANCH') == 'main'" }
      : {}),
    agents: AGENTS[suite.agent ?? 'standard'],
    ...(context !== 'on_merge' ? { depends_on: ['build'] } : {}),
    timeout_in_minutes: suite.timeoutMinutes ?? 60,
    ...(burn ? { soft_fail: true } : {}),
    ...(suite.parallelism ? { parallelism: suite.parallelism } : {}),
    retry: burn ? NO_RETRY : context === 'variant' ? RETRY_INFRA : RETRY_FLAKY,
  };
};

export const securityCypressSteps = (context: 'on_merge' | 'variant'): BuildkiteCommandStep[] =>
  SECURITY_CYPRESS_SUITES.filter((suite) => !suite.prOnly && suite.prGroup !== 'cypress_burn').map(
    (suite) => cypressStep(suite, context)
  );

export const prSecurityCypressSteps = (group: PrSecurityCypressGroup): BuildkiteCommandStep[] =>
  SECURITY_CYPRESS_SUITES.filter((suite) => suite.prGroup === group).map((suite) =>
    cypressStep(suite, 'pr')
  );
