/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { i18n } from '@kbn/i18n';
import {
  onPremInstructions,
  cloudInstructions,
  onPremCloudInstructions,
} from '../instructions/metricbeat_instructions';
import {
  TutorialContext,
  TutorialsCategory,
  TutorialSchema,
} from '../../services/tutorials/lib/tutorials_registry_types';

export function activemqMetricsSpecProvider(context: TutorialContext): TutorialSchema {
  const moduleName = 'activemq';
  return {
    id: 'activemqMetrics',
    name: i18n.translate('home.tutorials.activemqMetrics.nameTitle', {
      defaultMessage: 'ActiveMQ metrics',
    }),
    category: TutorialsCategory.METRICS,
    shortDescription: i18n.translate('home.tutorials.activemqMetrics.shortDescription', {
      defaultMessage: 'Fetch monitoring metrics from ActiveMQ instances.',
    }),
    longDescription: i18n.translate('home.tutorials.activemqMetrics.longDescription', {
      defaultMessage:
        'The `activemq` Metricbeat module fetches monitoring metrics from ActiveMQ instances \
[Learn more]({learnMoreLink}).',
      values: {
        learnMoreLink: '{config.docs.beats.metricbeat}/metricbeat-module-activemq.html',
      },
    }),
    euiIconType: '/plugins/home/assets/logos/activemq.svg',
    isBeta: true,
    artifacts: {
      application: {
        label: i18n.translate('home.tutorials.activemqMetrics.artifacts.application.label', {
          defaultMessage: 'Discover',
        }),
        path: '/app/kibana#/discover',
      },
      dashboards: [],
      exportedFields: {
        documentationUrl: '{config.docs.beats.metricbeat}/exported-fields-activemq.html',
      },
    },
    completionTimeMinutes: 10,
    onPrem: onPremInstructions(moduleName, context),
    elasticCloud: cloudInstructions(moduleName),
    onPremElasticCloud: onPremCloudInstructions(moduleName),
  };
}
