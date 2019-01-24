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

import { i18n }  from '@kbn/i18n';
import { TUTORIAL_CATEGORY } from '../../../common/tutorials/tutorial_category';
import { onPremInstructions, cloudInstructions, onPremCloudInstructions } from '../../../common/tutorials/functionbeat_instructions';

export function cloudwatchLogsSpecProvider(server, context) {
  return {
    id: 'cloudwatchLogs',
    name: i18n.translate('kbn.server.tutorials.cloudwatchLogs.nameTitle', {
      defaultMessage: 'Cloudwatch Logs',
    }),
    category: TUTORIAL_CATEGORY.LOGGING,
    shortDescription: i18n.translate('kbn.server.tutorials.cloudwatchLogs.shortDescription', {
      defaultMessage: 'Collect Cloudwatch logs with Functionbeat',
    }),
    longDescription: i18n.translate('kbn.server.tutorials.cloudwatchLogs.longDescription', {
      defaultMessage: 'Collect Cloudwatch logs by deploying Functionbeat to run as \
        an AWS Lambda function. \
        [Learn more]({learnMoreLink}).',
      values: {
        learnMoreLink: '{config.docs.beats.functionbeat}/functionbeat-getting-started.html',
      },
    }),
    //euiIconType: 'functionbeatApp',
    artifacts: {
      dashboards: [
        // TODO
      ],
      exportedFields: {
        documentationUrl: '{config.docs.beats.functionbeat}/exported-fields.html'
      }
    },
    completionTimeMinutes: 10,
    //previewImagePath: '/plugins/kibana/home/tutorial_resources/uptime_monitors/screenshot.png',
    onPrem: onPremInstructions(null, null, null, context),
    elasticCloud: cloudInstructions(),
    onPremElasticCloud: onPremCloudInstructions()
  };
}
