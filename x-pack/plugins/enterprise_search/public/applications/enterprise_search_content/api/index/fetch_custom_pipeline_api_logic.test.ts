/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { mockHttpValues } from '../../../__mocks__/kea_logic';

import { nextTick } from '@kbn/test-jest-helpers';

import { fetchCustomPipeline } from './fetch_custom_pipeline_api_logic';

describe('updatePipelineApiLogic', () => {
  const { http } = mockHttpValues;
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('updatePipeline', () => {
    it('calls correct api', async () => {
      const promise = Promise.resolve('result');
      http.get.mockReturnValue(promise);
      const result = fetchCustomPipeline({ indexName: 'index_20' });
      await nextTick();
      expect(http.get).toHaveBeenCalledWith(
        '/internal/enterprise_search/indices/index_20/pipelines'
      );
      await expect(result).resolves.toEqual('result');
    });
  });
});
