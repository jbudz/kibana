/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Logger, Plugin, PluginInitializerContext } from 'kibana/server';
import type { CoreSetup, CoreStart } from 'src/core/server';

import type { SecurityPluginStart } from '../../security/server';
import type { SpacesServiceStart } from '../../spaces/server';

import { ConfigType } from './config';
import { initRoutes } from './routes/init_routes';
import { ListClient } from './services/lists/list_client';
import type {
  ContextProvider,
  ContextProviderReturn,
  ListPluginSetup,
  ListsPluginStart,
  ListsRequestHandlerContext,
  PluginsStart,
} from './types';
import { getSpaceId } from './get_space_id';
import { getUser } from './get_user';
import { initSavedObjects } from './saved_objects';
import { ExceptionListClient } from './services/exception_lists/exception_list_client';

export class ListPlugin
  implements Plugin<Promise<ListPluginSetup>, ListsPluginStart, {}, PluginsStart>
{
  private readonly logger: Logger;
  private readonly config: ConfigType;
  private spaces: SpacesServiceStart | undefined | null;
  private security: SecurityPluginStart | undefined | null;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.logger = this.initializerContext.logger.get();
    this.config = this.initializerContext.config.get<ConfigType>();
  }

  public async setup(core: CoreSetup): Promise<ListPluginSetup> {
    const { config } = this;

    initSavedObjects(core.savedObjects);

    core.http.registerRouteHandlerContext<ListsRequestHandlerContext, 'lists'>(
      'lists',
      this.createRouteHandlerContext()
    );
    const router = core.http.createRouter<ListsRequestHandlerContext>();
    initRoutes(router, config);

    return {
      getExceptionListClient: (savedObjectsClient, user): ExceptionListClient => {
        return new ExceptionListClient({
          savedObjectsClient,
          user,
        });
      },
      getListClient: (esClient, spaceId, user): ListClient => {
        return new ListClient({
          config,
          esClient,
          spaceId,
          user,
        });
      },
    };
  }

  public start(core: CoreStart, plugins: PluginsStart): void {
    this.logger.debug('Starting plugin');
    this.security = plugins.security;
    this.spaces = plugins.spaces?.spacesService;
  }

  public stop(): void {
    this.logger.debug('Stopping plugin');
  }

  private createRouteHandlerContext = (): ContextProvider => {
    return async (context, request): ContextProviderReturn => {
      const { spaces, config, security } = this;
      const {
        core: {
          savedObjects: { client: savedObjectsClient },
          elasticsearch: {
            client: { asCurrentUser: esClient },
          },
        },
      } = context;
      if (config == null) {
        throw new TypeError('Configuration is required for this plugin to operate');
      } else {
        const spaceId = getSpaceId({ request, spaces });
        const user = getUser({ request, security });
        return {
          getExceptionListClient: (): ExceptionListClient =>
            new ExceptionListClient({
              savedObjectsClient,
              user,
            }),
          getListClient: (): ListClient =>
            new ListClient({
              config,
              esClient,
              spaceId,
              user,
            }),
        };
      }
    };
  };
}
