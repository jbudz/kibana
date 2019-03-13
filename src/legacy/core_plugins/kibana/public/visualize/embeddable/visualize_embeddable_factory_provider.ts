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

import { Legacy } from 'kibana';
import { EmbeddableFactoriesRegistryProvider } from 'ui/embeddable/embeddable_factories_registry';
import { IPrivate } from 'ui/private';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { SavedVisualizations } from '../types';
import { VisualizeEmbeddableFactory } from './visualize_embeddable_factory';

export function visualizeEmbeddableFactoryProvider(Private: IPrivate) {
  const VisualizeEmbeddableFactoryProvider = (
    savedVisualizations: SavedVisualizations,
    config: Legacy.KibanaConfig
  ) => {
    return new VisualizeEmbeddableFactory(
      savedVisualizations,
      config,
      Private(VisTypesRegistryProvider)
    );
  };
  return Private(VisualizeEmbeddableFactoryProvider);
}

EmbeddableFactoriesRegistryProvider.register(visualizeEmbeddableFactoryProvider);
