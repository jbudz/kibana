/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { EuiLink, EuiText } from '@elastic/eui';
import { FormattedRelativePreferenceDate } from '../../../../common/components/formatted_date';
import { UserDetailsLink } from '../../../../common/components/links';
import {
  getEmptyTagValue,
  getOrEmptyTagFromValue,
} from '../../../../common/components/empty_value';

import type { Columns, Criteria, ItemsPerRow } from '../../../components/paginated_table';
import { PaginatedTable } from '../../../components/paginated_table';

import { getRowItemsWithActions } from '../../../../common/components/tables/helpers';
import { useDeepEqualSelector } from '../../../../common/hooks/use_selector';

import * as i18n from './translations';
import { usersActions, usersModel, usersSelectors } from '../../store';
import type { User } from '../../../../../common/search_strategy/security_solution/users/all';
import type { SortUsersField } from '../../../../../common/search_strategy/security_solution/users/common';
import type { RiskSeverity } from '../../../../../common/search_strategy';
import { RiskScoreLevel } from '../../../../entity_analytics/components/severity/common';
import { useMlCapabilities } from '../../../../common/components/ml/hooks/use_ml_capabilities';
import { VIEW_USERS_BY_SEVERITY } from '../../../../entity_analytics/components/user_risk_score_table/translations';
import { SecurityPageName } from '../../../../app/types';
import { UsersTableType } from '../../store/model';
import { useNavigateTo } from '../../../../common/lib/kibana';

const tableType = usersModel.UsersTableType.allUsers;

interface UsersTableProps {
  users: User[];
  fakeTotalCount: number;
  loading: boolean;
  loadPage: (newActivePage: number) => void;
  id: string;
  showMorePagesIndicator: boolean;
  totalCount: number;
  type: usersModel.UsersType;
  sort: SortUsersField;
  setQuerySkip: (skip: boolean) => void;
}

export type UsersTableColumns = [
  Columns<User['name']>,
  Columns<User['lastSeen']>,
  Columns<User['domain']>,
  Columns<RiskSeverity>?,
];

const rowItems: ItemsPerRow[] = [
  {
    text: i18n.ROWS_5,
    numberOfRow: 5,
  },
  {
    text: i18n.ROWS_10,
    numberOfRow: 10,
  },
];

const getUsersColumns = (
  showRiskColumn: boolean,
  dispatchSeverityUpdate: (s: RiskSeverity) => void
): UsersTableColumns => {
  const columns: UsersTableColumns = [
    {
      field: 'name',
      name: i18n.USER_NAME,
      truncateText: false,
      sortable: true,
      mobileOptions: { show: true },
      render: (name) =>
        name != null && name.length > 0
          ? getRowItemsWithActions({
              fieldName: 'user.name',
              values: [name],
              idPrefix: `users-table-${name}-name`,
              render: (item) => <UserDetailsLink userName={item} />,
            })
          : getOrEmptyTagFromValue(name),
    },
    {
      field: 'lastSeen',
      name: i18n.LAST_SEEN,
      sortable: true,
      truncateText: false,
      mobileOptions: { show: true },
      render: (lastSeen) => <FormattedRelativePreferenceDate value={lastSeen} />,
    },
    {
      field: 'domain',
      name: i18n.DOMAIN,
      sortable: false,
      truncateText: false,
      mobileOptions: { show: true },
      render: (domain) =>
        domain != null && domain.length > 0
          ? getRowItemsWithActions({
              fieldName: 'user.domain',
              values: [domain],
              idPrefix: `users-table-${domain}-domain`,
            })
          : getOrEmptyTagFromValue(domain),
    },
  ];

  if (showRiskColumn) {
    columns.push({
      field: 'risk',
      name: i18n.USER_RISK,
      truncateText: false,
      mobileOptions: { show: true },
      sortable: false,
      render: (riskScore: RiskSeverity) => {
        if (riskScore != null) {
          return (
            <RiskScoreLevel
              toolTipContent={
                <EuiLink onClick={() => dispatchSeverityUpdate(riskScore)}>
                  <EuiText size="xs">{VIEW_USERS_BY_SEVERITY(riskScore.toLowerCase())}</EuiText>
                </EuiLink>
              }
              severity={riskScore}
            />
          );
        }
        return getEmptyTagValue();
      },
    });
  }

  return columns;
};

const UsersTableComponent: React.FC<UsersTableProps> = ({
  users,
  totalCount,
  type,
  id,
  fakeTotalCount,
  loading,
  loadPage,
  showMorePagesIndicator,
  sort,
  setQuerySkip,
}) => {
  const dispatch = useDispatch();
  const getUsersSelector = useMemo(() => usersSelectors.allUsersSelector(), []);
  const { activePage, limit } = useDeepEqualSelector((state) => getUsersSelector(state));
  const isPlatinumOrTrialLicense = useMlCapabilities().isPlatinumOrTrialLicense;
  const { navigateTo } = useNavigateTo();

  const updateLimitPagination = useCallback(
    (newLimit) => {
      dispatch(
        usersActions.updateTableLimit({
          usersType: type,
          limit: newLimit,
          tableType,
        })
      );
    },
    [type, dispatch]
  );

  const updateActivePage = useCallback(
    (newPage) => {
      dispatch(
        usersActions.updateTableActivePage({
          activePage: newPage,
          usersType: type,
          tableType,
        })
      );
    },
    [type, dispatch]
  );

  const onSort = useCallback(
    (criteria: Criteria) => {
      if (criteria.sort != null) {
        const newSort = criteria.sort;
        if (newSort.direction !== sort.direction || newSort.field !== sort.field) {
          dispatch(
            usersActions.updateTableSorting({
              sort: newSort as SortUsersField,
              tableType,
            })
          );
        }
      }
    },
    [dispatch, sort]
  );

  const dispatchSeverityUpdate = useCallback(
    (s: RiskSeverity) => {
      dispatch(
        usersActions.updateUserRiskScoreSeverityFilter({
          severitySelection: [s],
        })
      );
      navigateTo({
        deepLinkId: SecurityPageName.users,
        path: UsersTableType.risk,
      });
    },
    [dispatch, navigateTo]
  );

  const columns = useMemo(
    () => getUsersColumns(isPlatinumOrTrialLicense, dispatchSeverityUpdate),
    [isPlatinumOrTrialLicense, dispatchSeverityUpdate]
  );

  return (
    <PaginatedTable
      activePage={activePage}
      columns={columns}
      dataTestSubj={`table-${tableType}`}
      headerCount={totalCount}
      headerTitle={i18n.USERS}
      headerUnit={i18n.UNIT(totalCount)}
      id={id}
      itemsPerRow={rowItems}
      limit={limit}
      loading={loading}
      loadPage={loadPage}
      pageOfItems={users}
      showMorePagesIndicator={showMorePagesIndicator}
      totalCount={fakeTotalCount}
      updateLimitPagination={updateLimitPagination}
      updateActivePage={updateActivePage}
      sorting={sort}
      onChange={onSort}
      setQuerySkip={setQuerySkip}
    />
  );
};

UsersTableComponent.displayName = 'UsersTableComponent';

export const UsersTable = React.memo(UsersTableComponent);
