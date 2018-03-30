import React from 'react';
import Header from './../common/Header';
import { FilterPanel } from './../common/FilterPanel';
import ViewsDropdown from './../common/ViewsDropdown'
import firebase from '../../helpers/base';
import mongoObjectId from '../../helpers/mongoId';
import { slugify } from '../../helpers';
import * as wjGrid from 'wijmo/wijmo.react.grid';
import { GroupPanel } from 'wijmo/wijmo.react.grid.grouppanel';
import { FlexGridFilter } from 'wijmo/wijmo.grid.filter'
import { ListBox } from 'wijmo/wijmo.input'
import { DataMap } from 'wijmo/wijmo.grid'
import { CollectionView, Control, hidePopup, hasClass, showPopup, format, PropertyGroupDescription, SortDescription } from 'wijmo/wijmo'

const TABLE_KEY = 'projects'
export default class Panel extends React.Component {

  render() {
    return (
      <div>
        <Header tab={TABLE_KEY}/>
      </div>
    )
  }
}
