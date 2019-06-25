/**
 * Copyright Schrodinger, LLC
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FixedDataTableBufferedRows
 * @typechecks
 */

import FixedDataTableRow from 'FixedDataTableRow';
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'cx';
import emptyFunction from 'emptyFunction';
import joinClasses from 'joinClasses';
import inRange from 'lodash/inRange';

class FixedDataTableBufferedRows extends React.Component {
  static propTypes = {
    isScrolling: PropTypes.bool,
    firstViewportRowIndex: PropTypes.number.isRequired,
    endViewportRowIndex: PropTypes.number.isRequired,
    fixedColumns: PropTypes.array.isRequired,
    fixedRightColumns: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    offsetTop: PropTypes.number.isRequired,
    onRowClick: PropTypes.func,
    onRowContextMenu: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowMouseDown: PropTypes.func,
    onRowMouseUp: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
    onRowTouchStart: PropTypes.func,
    onRowTouchEnd: PropTypes.func,
    onRowTouchMove: PropTypes.func,
    rowClassNameGetter: PropTypes.func,
    rowExpanded: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
    ]),
    rowOffsets: PropTypes.object.isRequired,
    rowKeyGetter: PropTypes.func,
    rowSettings: PropTypes.shape({
      rowHeightGetter: PropTypes.func,
      rowsCount: PropTypes.number.isRequired,
      subRowHeightGetter: PropTypes.func,
    }),
    rowsToRender: PropTypes.array.isRequired,
    scrollLeft: PropTypes.number.isRequired,
    scrollTop: PropTypes.number.isRequired,
    scrollableColumns: PropTypes.array.isRequired,
    showLastRowBorder: PropTypes.bool,
    showScrollbarY: PropTypes.bool,
    width: PropTypes.number.isRequired,
  }

  componentWillMount() {
    this._staticRowArray = [];
    this._initialRender = true;
  }

  componentDidMount() {
    this._initialRender = false;
  }

  shouldComponentUpdate() /*boolean*/ {
    // Don't add PureRenderMixin to this component please.
    return true;
  }

  componentWillUnmount() {
    this._staticRowArray.length = 0;
  }

  render() /*object*/ {
    let { offsetTop, scrollTop, isScrolling, rowsToRender } = this.props;
    const baseOffsetTop = offsetTop - scrollTop;
    rowsToRender = rowsToRender || [];

    if (isScrolling) {
      // allow static array to grow while scrolling
      this._staticRowArray.length = Math.max(this._staticRowArray.length, rowsToRender.length);
    } else {
      // when scrolling is done, static array can shrink to fit the buffer
      this._staticRowArray.length = rowsToRender.length;
    }

    // render each row from the buffer into the static row array
    for (let i = 0; i < this._staticRowArray.length; i++) {
      let rowIndex = rowsToRender[i];
      // if the row doesn't exist in the buffer set, then take the previous one
      if (rowIndex === undefined) {
        rowIndex = this._staticRowArray[i] && this._staticRowArray[i].props.index;
      }

      this._staticRowArray[i] = this.renderRow({
        rowIndex,
        key: i,
        baseOffsetTop,
      });
    }

    return <div> {this._staticRowArray} </div>;
  }

  /**
   * @param {number} rowIndex
   * @param {number} key
   * @param {number} baseOffsetTop
   * @return {!Object}
   */
  renderRow({ rowIndex, key, baseOffsetTop }) /*object*/ {
    const props = this.props;
    const rowClassNameGetter = props.rowClassNameGetter || emptyFunction;
    const fake = rowIndex === undefined;
    let rowProps = {};

    // if row exists, then calculate row specific props
    if (!fake) {
      rowProps.height = this.props.rowSettings.rowHeightGetter(rowIndex);
      rowProps.subRowHeight = this.props.rowSettings.subRowHeightGetter(rowIndex);
      rowProps.offsetTop = Math.round(baseOffsetTop + props.rowOffsets[rowIndex]);
      rowProps.key = props.rowKeyGetter ? props.rowKeyGetter(rowIndex) : key;

      const hasBottomBorder = (rowIndex === props.rowSettings.rowsCount - 1) && props.showLastRowBorder;
      rowProps.className = joinClasses(
        rowClassNameGetter(rowIndex),
        cx('public/fixedDataTable/bodyRow'),
        cx({
          'fixedDataTableLayout/hasBottomBorder': hasBottomBorder,
          'public/fixedDataTable/hasBottomBorder': hasBottomBorder,
        })
      );
    }

    const visible = inRange(rowIndex, this.props.firstViewportRowIndex, this.props.endViewportRowIndex);

    return (
      <FixedDataTableRow
        key={key}
        index={rowIndex}
        isScrolling={props.isScrolling}
        width={props.width}
        rowExpanded={props.rowExpanded}
        scrollLeft={Math.round(props.scrollLeft)}
        fixedColumns={props.fixedColumns}
        fixedRightColumns={props.fixedRightColumns}
        scrollableColumns={props.scrollableColumns}
        onClick={props.onRowClick}
        onContextMenu={props.onRowContextMenu}
        onDoubleClick={props.onRowDoubleClick}
        onMouseDown={props.onRowMouseDown}
        onMouseUp={props.onRowMouseUp}
        onMouseEnter={props.onRowMouseEnter}
        onMouseLeave={props.onRowMouseLeave}
        onTouchStart={props.onRowTouchStart}
        onTouchEnd={props.onRowTouchEnd}
        onTouchMove={props.onRowTouchMove}
        showScrollbarY={props.showScrollbarY}
        visible={visible}
        fake={fake}
        {...rowProps}
      />
    );
  }
};

module.exports = FixedDataTableBufferedRows;
