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

import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { updatePanels } from '../actions';
import { getPanels, getUseMargins, getViewMode } from '../selectors';
import { DashboardViewMode } from '../selectors/types';
import { DashboardGrid } from './dashboard_grid';
import { SavedDashboardPanelMap } from '../types';

interface DashboardGridContainerStateProps {
  panels: SavedDashboardPanelMap;
  dashboardViewMode: DashboardViewMode;
  useMargins: boolean;
}

interface DashboardGridContainerDispatchProps {
  onPanelsUpdated(updatedPanels: SavedDashboardPanelMap): void;
}

const mapStateToProps = ({ dashboard }: any): any => ({
  panels: getPanels(dashboard),
  dashboardViewMode: getViewMode(dashboard),
  useMargins: getUseMargins(dashboard),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onPanelsUpdated: (updatedPanels: SavedDashboardPanelMap) => dispatch(updatePanels(updatedPanels)),
});

export const DashboardGridContainer = connect<
  DashboardGridContainerStateProps,
  DashboardGridContainerDispatchProps
>(
  mapStateToProps,
  mapDispatchToProps
)(DashboardGrid);
