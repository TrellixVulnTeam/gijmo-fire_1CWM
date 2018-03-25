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
import { CollectionView, Control, hidePopup, hasClass, showPopup, PropertyGroupDescription } from 'wijmo/wijmo'

const TABLE_KEY = 'venues'
export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.getVenuesData = this.getVenuesData.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onInitialized = this.onInitialized.bind(this)
    this.onCellEditEnded = this.onCellEditEnded.bind(this)
    this.deleteSelected = this.deleteSelected.bind(this)
    this.deselectEverything = this.deselectEverything.bind(this)
    this.onClickAddRow = this.onClickAddRow.bind(this)
    this.isLongList = this.isLongList.bind(this)
    this.updatedView = this.updatedView.bind(this)
    this.onPasted = this.onPasted.bind(this)
    this.saveItem = this.saveItem.bind(this)
    this.saveState = this.saveState.bind(this)
    this.getTableState = this.getTableState.bind(this)
    this.retrieveState = this.retrieveState.bind(this)
    this.applySortDescriptions = this.applySortDescriptions.bind(this)
    this.applyGroupDescriptions = this.applyGroupDescriptions.bind(this)
    this.applyColumnLayout = this.applyColumnLayout.bind(this)
    this.setupTableStateListener = this.setupTableStateListener.bind(this)
    this.saveStatePromise = this.saveStatePromise.bind(this)
    this.deleteView = this.deleteView.bind(this)
    // get initial state
    this.state = {
      venues: [],
      view: null
    };
  }
  onPasted(s, e) {
    const items = this.state.view.itemsAdded
    let p = Promise.resolve()
    for (let i = 0; i < items.length; i++) {
      items[i].id = 'venue-'+mongoObjectId()
      p = p.then(this.saveItem(items[i]))
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.retrieveState()
    this.setupDropdowns()
  }

  setupDropdowns() {
    const dropdown_keys = ['type'];
    dropdown_keys.forEach((keyname) => {
      const dropdown_items = this.getVenueTypes();
      const {flex} = this.state
      if (flex) {
        const columns = flex.columns;
        columns.forEach((column) => {
          const binding = column._binding._key
          if (binding == keyname) {
            column.dataMap = new DataMap(dropdown_items, 'key', 'name')
          }
        })
      }
    })
  }
  getProcessedVenues(venues_obj) {
    return Object.keys(venues_obj).map((key) => {
      return {
        id: key,
        sel_for_deletion: false,
        ...venues_obj[key],
      }
    })
  }
  deselectEverything() {
    if (this.state.view.moveCurrentToPosition) {
      this.state.view.moveCurrentToPosition(-1)
    }
  }

  onScroll(event) {
    const top = this.scrollY;
    localStorage.setItem('pos', top);
  }

  setupTableStateListener() {
    this.views_ref = firebase.ref().child('views').child('venues');
    this.views_ref.on('value', (snapshot) => {
      const views_data = snapshot.val();
      const { allViews = {}, currentView = '' } = views_data ? views_data : {}
      this.setState({
        currentView,
        viewState: allViews[currentView]['state']
      }, () => {
        this.retrieveState()
      })
    })
    if ('onbeforeunload' in window) {
      window.onbeforeunload = this.saveState
    }
  }
  componentWillUnmount() {
    this.saveState()
    window.onbeforeunload = null
  }
  // connect GroupPanel to FlexGrid when the component mounts
  componentDidMount() {
    this.store_ref = firebase.ref().child('venues');
    this.store_ref.on('value', (snapshot) => {
      const venues_obj = snapshot.val();
      const venues_list = this.getProcessedVenues(venues_obj);
      const view = new CollectionView(venues_list);
      view.trackChanges = true;
      this.setState({
        view
      }, () => {
        this.deselectEverything()
      })
    })
    this.setupTableStateListener()
    window.addEventListener("scroll", this.onScroll, false);
  }
  setupGrouping() {
    const grouping_successful = false
    let interval = null
    const mapGrouping = () => {
      try {
        const grid = Control.getControl(document.getElementById('theGrid'));
        const panel = Control.getControl(document.getElementById('thePanel'));
        panel.hideGroupedColumns = false;
        panel.grid = grid;
      } catch (e) {
        setTimeout(mapGrouping, 1000)
      }
    }
    setTimeout(mapGrouping, 1000)
  }
  updatedView(s, e) {
    let nPos = localStorage.getItem("pos");
    this.setupGrouping()
    if (nPos) {
      window.scrollTo(0, nPos);
    }
  }

  getVenuesData() {
    return Object.values(this.state.venues)
  }

  getVenueTypes() {
    return [
      {
        name : 'Theatre',
        key: 'theatre'
      },
      {
        name : 'Stadium',
        key: 'stadium'
      },
      {
        name : 'Amphitheatre',
        key: 'amphitheatre'
      },
      {
        name : 'Store',
        key: 'store'
      }
    ]
  }

  onChange(a, b) {
    const item = this.state.view.itemsAdded
  }

  onInitialized(s, e) {
    const filter = new FlexGridFilter(s); // add a FlexGridFilter to it
    const filter_panel = new FilterPanel('#filterPanel', {
        filter: filter,
        placeholder: 'Active Filters'
    });

    const theColumnPicker = new ListBox('#theColumnPicker', {
      itemsSource: s.columns,
      checkedMemberPath: 'visible',
      displayMemberPath: 'header',
      lostFocus: () => {
        hidePopup(theColumnPicker.hostElement);
      }
    })

    let ref = document.getElementsByClassName('wj-topleft')[0];
    ref.addEventListener('mousedown', function (e) {
      if (hasClass(e.target, 'column-picker-icon')) {
        showPopup(theColumnPicker.hostElement, ref, false, true, false);
        theColumnPicker.focus();
        e.preventDefault();
      }
    });
    this.setState({
      flex: s,
      filter: filter
    }, () => {
      this.setupDropdowns()
    })
    return filter_panel
  }

  getUpdatedItem(item) {
    const deep_item = {...item}
    delete deep_item['id']
    const filename = slugify(deep_item['name'] ? deep_item['name'] : '') + '_' + slugify(deep_item['city'] ? deep_item['city'] : '')
    deep_item['filename'] = filename;
    return deep_item
  }

  isRowEmpty(venue = {}) {
    venue = {...venue}
    delete venue['sel_for_deletion']
    return !Object.keys(venue).length
  }

  saveItem(item = {}) {
    if (!this.isRowEmpty(item)) {
      let item_id = item['id'];
      if (!item_id) {
        item_id = 'venue-'+mongoObjectId()
      }
      const updates = {};
      const updated_item = this.getUpdatedItem(item);
      updates['/venues/' + item_id ] = updated_item;
      return firebase.ref().update(updates)
    }
    return Promise.resolve()
  }

  onCellEditEnded(s, e) {
    const { row, col } = e;
    let item = {...s.rows[row].dataItem};
    this.saveItem(item)
  }

  deleteRows(rows = []) {
    const updates = {}
    const ids = rows.map(venue => {
      updates['/venues/'+venue['id']] = null
    })
    firebase.ref().update(updates);
  }

  deleteSelected() {
    const selected_rows = this.state.view.items.filter(venue => venue['sel_for_deletion'])
    this.deleteRows(selected_rows)
  }

  onClickAddRow() {
    this.bottom.scrollIntoView()
  }

  gotoTop() {
    window.scrollTo(0,0);
  }
  isLongList() {
    if (this.state.view && this.state.view.items) {
      return this.state.view.items.length > 30
    }
    return false
  }
  formatItem(s, e) {
    if (e.panel == s.topLeftCells) {
      e.cell.innerHTML = '<span class="column-picker-icon glyphicon glyphicon-cog"></span>';
    }
  }
  getLoader() {
    return (
      <div className="text-center">
        Crunching the latest data...
      </div>
    )
  }
  getTableState() {
    const { flex, filter } = this.state
    if (flex && filter) {
      const { columnLayout = {} } = this.state.flex
      const { filterDefinition = {} } = this.state.filter
      const { groupDescriptions, sortDescriptions } = this.getDescriptions(['group', 'sort'])
      return {
        columnLayout,
        filterDefinition,
        sortDescriptions,
        groupDescriptions,
      }
    }
    return null
  }

  // Gets group and sort description
  getDescriptions(keys) {
    const descriptions = {}
    const { view } = this.state;
    if (view) {
      keys.map((key) => {
        let desc = [];
        const description = view[key + 'Descriptions'] ? view[key + 'Descriptions'] : {}
        for (let group in description) {
          if (description[group].propertyName)
          desc.push(description[group].propertyName);
        }
        descriptions[key + 'Descriptions'] = desc
      })
    }
    return descriptions
  }

  saveStatePromise() {
    const table_state = this.getTableState()
    const { currentView = '' } = this.state
    if (currentView) {
      const updates = {}
      updates[`/views/venues/allViews/${currentView}/state` ] = JSON.stringify(table_state)
      return firebase.ref().update(updates).then(() => Promise.resolve(table_state))
    }
    return Promise.resolve()
  }

  saveState() {
    this.saveStatePromise()
  }

  retrieveState() {
    const { viewState = '' } = this.state
    if (viewState) {
      const table_state = JSON.parse(viewState)
      const { columnLayout, filterDefinition, sortDescriptions, groupDescriptions } = table_state
      this.applyColumnLayout(columnLayout)
      this.applyFilters(filterDefinition)
      this.applySortDescriptions(sortDescriptions)
      this.applyGroupDescriptions(groupDescriptions)
      this.setupDropdowns()
    }
  }

  applyColumnLayout(columnLayout) {
    const { flex } = this.state
    if (columnLayout && flex) {
      this.state.flex.columnLayout = columnLayout
    }
  }

  applyFilters(filters) {
    const { filter } = this.state
    if (filters && filter) {
      this.state.filter.filterDefinition = filters
    }
  }

  applySortDescriptions(loadedSort) {
    const { view, flex } = this.state
    if (loadedSort && view && flex) {
      this.state.view.sortDescriptions.clear();
      for (var i = 0; i < loadedSort.length; i++) {
        this.state.view.sortDescriptions.push(new PropertyGroupDescription(loadedSort[i]));
      }
      this.state.flex.refresh();
    }
  }

  applyGroupDescriptions(loadedGroups) {
    const { view, flex } = this.state
    if (loadedGroups && view && flex) {
      this.state.view.groupDescriptions.clear();
      for (var i = 0; i < loadedGroups.length; i++) {
        this.state.view.groupDescriptions.push(new PropertyGroupDescription(loadedGroups[i]));
      }
      this.state.flex.refresh();
    }
  }
  getGrids() {
    const { view } = this.state;
    if (view == null) {
      return this.getLoader()
    }
    window.setTimeout(this.setupGrouping, 2000)
    return (
      <div >
        <GroupPanel
          id="thePanel"
          placeholder="Drag columns here to create Groups"
          className="clearfix mb10 text-center br-4"/>
        <wjGrid.FlexGrid
          id ='theGrid'
          autoGenerateColumns={false}
          newRowAtTop={false}
          columns={[
            { header: 'ID', binding: 'id', width: '1.3*', minWidth: 250, isReadOnly: true },
            { header: 'Name', binding: 'name', width: '1*', minWidth: 250, isRequired: true },
            { header: 'City', binding: 'city', width: '1*', minWidth: 200, isRequired: true },
            { header: 'State', binding: 'state', width: '1*', minWidth: 150, isRequired: true },
            { header: 'Type', binding: 'type', width: '.8*', minWidth: 150, isRequired: true},
            { header: 'Filename', binding: 'filename', width: '1*', minWidth: 150, isReadOnly: true},
            { header: 'Delete', binding: 'sel_for_deletion', width: '.5*', minWidth: 80},
          ]}
          cellEditEnded={this.onCellEditEnded}
          cellEditEnding={this.saveState}
          showDropDown={true}
          itemsSource={this.state.view}
          initialized={ this.onInitialized }
          allowAddNew={true}
          onRowAdded={this.onChange}
          updatedView={this.updatedView}
          formatItem={this.formatItem}
          onPasted={this.onPasted}
        />
      </div>
    )
  }

  getViewsDropdown() {
    return (
      <ViewsDropdown table='venues' saveState={this.saveStatePromise}/>
    )
  }

  deleteView() {
    const { currentView = '' } = this.state
    if (currentView != 'default') {
      const updates = {}
      updates[`/views/venues/allViews/${currentView}` ] = null
      updates[`/views/venues/currentView` ] = 'default'
      return firebase.ref().update(updates)
    }
  }
  render() {
    const { currentView = '' } = this.state
    const show_delete_view = currentView !== 'default';
    return (
      <div>
        <Header tab='venues'/>
        {this.getViewsDropdown()}
        <span className='table_header'>Venues</span>
        <button className='pull-right btn btn-default mb10 mr15' onClick={this.deleteSelected}> Delete Selected </button>
        { show_delete_view && <button className='pull-right btn btn-default mb10 mr10' onClick={this.deleteView}> Delete View </button>}
        {this.isLongList() && <button className='pull-right btn btn-default mb10 mr10' onClick={this.onClickAddRow}> Add Row </button>}
        <div id="filterPanel"></div>
        <div style={{display : 'none'}}>
          <div id="theColumnPicker" className="column-picker"></div>
        </div>
        {this.getGrids()}
        {this.isLongList() && <button ref={(el) => { this.bottom = el }} className='pull-right btn btn-default mt10 bottom-button' onClick={this.deleteSelected}> Delete Selected </button>}
        {this.isLongList() && <button onClick={this.gotoTop} className='pull-right btn btn-default mt10 bottom-button mr10'> Go to top </button>}
      </div>
    )
  }
}
