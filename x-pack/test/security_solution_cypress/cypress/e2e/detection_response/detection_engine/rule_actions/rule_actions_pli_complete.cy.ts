/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getNewRule } from '../../../../objects/rule';

import {
  INDEX_SELECTOR,
  SLACK_ACTION_BTN,
  WEBHOOK_ACTION_BTN,
  EMAIL_ACTION_BTN,
  SERVER_LOG_ACTION_BTN,
  XMATTERS_ACTION_BTN,
  ACTION_BTN,
  CASES_SYSTEM_ACTION_BTN,
} from '../../../../screens/common/rule_actions';

import { createRule } from '../../../../tasks/api_calls/rules';

import { RULES_MANAGEMENT_URL } from '../../../../urls/rules_management';
import { deleteAlertsAndRules } from '../../../../tasks/api_calls/common';
import { goToActionsStepTab } from '../../../../tasks/create_new_rule';
import { login } from '../../../../tasks/login';

import { editFirstRule } from '../../../../tasks/alerts_detection_rules';

import { visit } from '../../../../tasks/navigation';

const rule = getNewRule();

describe(
  'Rule actions PLI complete product tier',
  {
    tags: ['@serverless'],

    env: {
      ftrConfig: {
        productTypes: [
          { product_line: 'security', product_tier: 'complete' },
          { product_line: 'endpoint', product_tier: 'complete' },
        ],
      },
    },
  },
  () => {
    beforeEach(() => {
      login();
      deleteAlertsAndRules();
      createRule(rule);
    });

    it('more than 3 rule actions should be available', () => {
      visit(RULES_MANAGEMENT_URL);
      editFirstRule();

      goToActionsStepTab();

      // all actions available
      cy.get(ACTION_BTN).should('have.length.greaterThan', 4);

      cy.get(INDEX_SELECTOR).should('be.visible');
      cy.get(SLACK_ACTION_BTN).should('be.visible');
      cy.get(EMAIL_ACTION_BTN).should('be.visible');
      cy.get(WEBHOOK_ACTION_BTN).should('be.visible');
      cy.get(SERVER_LOG_ACTION_BTN).should('be.visible');
      cy.get(XMATTERS_ACTION_BTN).should('be.visible');
      cy.get(CASES_SYSTEM_ACTION_BTN).should('be.visible');
    });
  }
);
