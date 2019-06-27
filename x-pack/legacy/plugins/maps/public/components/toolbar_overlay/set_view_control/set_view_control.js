/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiFieldNumber,
  EuiButtonIcon,
  EuiPopover,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';

function getViewString(lat, lon, zoom) {
  return `${lat},${lon},${zoom}`;
}

export class SetViewControl extends Component {

  state = {}

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextView = getViewString(nextProps.center.lat, nextProps.center.lon, nextProps.zoom);
    if (nextView !== prevState.prevView) {
      return {
        lat: nextProps.center.lat,
        lon: nextProps.center.lon,
        zoom: nextProps.zoom,
        prevView: nextView,
      };
    }

    return null;
  }

  _togglePopover = () => {
    if (this.props.isSetViewOpen) {
      this.props.closeSetView();
      return;
    }

    this.props.openSetView();
  };

  _onLatChange = evt => {
    this._onChange('lat', evt);
  };

  _onLonChange = evt => {
    this._onChange('lon', evt);
  };

  _onZoomChange = evt => {
    this._onChange('zoom', evt);
  };

  _onChange = (name, evt) => {
    const sanitizedValue = parseFloat(evt.target.value);
    this.setState({
      [name]: isNaN(sanitizedValue) ? '' : sanitizedValue,
    });
  }

  _renderNumberFormRow = ({ value, min, max, onChange, label, dataTestSubj }) => {
    const isInvalid = value === '' || value > max || value < min;
    const error = isInvalid ? `Must be between ${min} and ${max}` : null;
    return {
      isInvalid,
      component: (
        <EuiFormRow
          label={label}
          isInvalid={isInvalid}
          error={error}
          compressed
        >
          <EuiFieldNumber
            value={value}
            onChange={onChange}
            isInvalid={isInvalid}
            data-test-subj={dataTestSubj}
          />
        </EuiFormRow>
      )
    };
  }

  _onSubmit = () => {
    const {
      lat,
      lon,
      zoom
    } = this.state;
    this.props.onSubmit({ lat, lon, zoom });
  }

  _renderSetViewForm() {
    const { isInvalid: isLatInvalid, component: latFormRow } = this._renderNumberFormRow({
      value: this.state.lat,
      min: -90,
      max: 90,
      onChange: this._onLatChange,
      label: 'Latitude',
      dataTestSubj: 'latitudeInput',
    });

    const { isInvalid: isLonInvalid, component: lonFormRow } = this._renderNumberFormRow({
      value: this.state.lon,
      min: -180,
      max: 180,
      onChange: this._onLonChange,
      label: 'Longitude',
      dataTestSubj: 'longitudeInput',
    });

    const { isInvalid: isZoomInvalid, component: zoomFormRow } = this._renderNumberFormRow({
      value: this.state.zoom,
      min: 0,
      max: 24,
      onChange: this._onZoomChange,
      label: 'Zoom',
      dataTestSubj: 'zoomInput',
    });

    return (
      <EuiForm data-test-subj="mapSetViewForm">

        {latFormRow}

        {lonFormRow}

        {zoomFormRow}

        <EuiFormRow hasEmptyLabelSpace>
          <EuiButton
            size="s"
            disabled={isLatInvalid || isLonInvalid || isZoomInvalid}
            onClick={this._onSubmit}
            data-test-subj="submitViewButton"
          >
            Go
          </EuiButton>
        </EuiFormRow>

      </EuiForm>
    );
  }

  render() {
    return (
      <EuiPopover
        anchorPosition="leftUp"
        button={(
          <EuiButtonIcon
            className="mapToolbarOverlay__button"
            onClick={this._togglePopover}
            data-test-subj="toggleSetViewVisibilityButton"
            iconType="crosshairs"
            color="text"
            aria-label={i18n.translate('xpack.maps.viewControl.goToButtonLabel', {
              defaultMessage: 'Go to'
            })}
            title={i18n.translate('xpack.maps.viewControl.goToButtonLabel', {
              defaultMessage: 'Go to'
            })}
          />
        )}
        isOpen={this.props.isSetViewOpen}
        closePopover={this.props.closeSetView}
      >
        {this._renderSetViewForm()}
      </EuiPopover>
    );
  }
}

SetViewControl.propTypes = {
  isSetViewOpen: PropTypes.bool.isRequired,
  zoom: PropTypes.number.isRequired,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired
  }),
  onSubmit: PropTypes.func.isRequired,
  closeSetView: PropTypes.func.isRequired,
  openSetView: PropTypes.func.isRequired,
};
