/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { shallow } from 'enzyme';
import React from 'react';
import moment from 'moment-timezone';
import { TimestampTooltip } from './index';
import { mockNow } from '../../../utils/testHelpers';

describe('TimestampTooltip', () => {
  const timestamp = 1570720000123;

  beforeAll(() => {
    // mock Date.now
    mockNow(1570737000000);

    // hardcode timezone to avoid timezone issues on CI
    jest
      .spyOn(moment.tz, 'guess')
      .mockImplementation(() => 'Europe/Copenhagen');
  });

  it('should render component with relative time in body and absolute time in tooltip', () => {
    expect(shallow(<TimestampTooltip time={timestamp} />))
      .toMatchInlineSnapshot(`
      <EuiToolTip
        content="Oct 10th 2019, 17:06:40.123 (+0200 CEST)"
        delay="regular"
        position="top"
      >
        5 hours ago
      </EuiToolTip>
    `);
  });

  it('should format with precision in milliseconds by default', () => {
    expect(
      shallow(<TimestampTooltip time={timestamp} />)
        .find('EuiToolTip')
        .prop('content')
    ).toBe('Oct 10th 2019, 17:06:40.123 (+0200 CEST)');
  });

  it('should format with precision in minutes', () => {
    expect(
      shallow(<TimestampTooltip time={timestamp} precision="minutes" />)
        .find('EuiToolTip')
        .prop('content')
    ).toBe('Oct 10th 2019, 17:06 (+0200 CEST)');
  });

  it('should format with precision in days', () => {
    expect(
      shallow(<TimestampTooltip time={timestamp} precision="days" />)
        .find('EuiToolTip')
        .prop('content')
    ).toBe('Oct 10th 2019 (+0200 CEST)');
  });
});
