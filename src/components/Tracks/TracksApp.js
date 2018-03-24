import React from 'react';
import Header from './../common/Header';
import { FilterPanel } from './../common/FilterPanel';
import firebase from '../../helpers/base';
import mongoObjectId from '../../helpers/mongoId';
import { slugify } from '../../helpers';
import * as wjGrid from 'wijmo/wijmo.react.grid';
import { GroupPanel } from 'wijmo/wijmo.react.grid.grouppanel';
import { FlexGridFilter } from 'wijmo/wijmo.grid.filter'
import { ListBox } from 'wijmo/wijmo.input'
import { DataMap } from 'wijmo/wijmo.grid'
import { CollectionView, Control, hidePopup, hasClass, showPopup } from 'wijmo/wijmo'

export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.onInitialized = this.onInitialized.bind(this)
    this.onCellEditEnded = this.onCellEditEnded.bind(this)
    this.deleteSelected = this.deleteSelected.bind(this)
    this.setupDropdowns = this.setupDropdowns.bind(this)
    this.deselectEverything = this.deselectEverything.bind(this)
    this.onClickAddRow = this.onClickAddRow.bind(this)
    this.isLongList = this.isLongList.bind(this)
    this.getUpdatedItem = this.getUpdatedItem.bind(this)
    this.updatedView = this.updatedView.bind(this)
    this.onPasted = this.onPasted.bind(this)
    this.saveItem = this.saveItem.bind(this)
    this.setupDataMaps = this.setupDataMaps.bind(this)

    // get initial state
    this.state = {
      events: [],
      view: [],
      events_dropdown: null,
      songs_dropdown: null,
      new_mongid: mongoObjectId()
    };
  }

  getProcessedTracks(events_obj) {
    return Object.keys(events_obj).map((key) => {
      return {
        id: key,
        sel_for_deletion: false,
        ...events_obj[key],
      }
    })
  }

  getProcessedDropDownItem(item_list, keyname) {
    return Object.keys(item_list).map((id) => {
      const { filename = '', name = '' } = item_list[id]
      return {
        key: id,
        name: keyname == 'event' ? filename : name
      }
    })
  }

  setupDropdowns(dropdown_keys = []) {
    dropdown_keys.forEach((keyname) => {
      this.store_ref = firebase.ref().child(keyname + 's'); // Root keys are plural, eg : songs, events
      this.store_ref.on('value', (snapshot) => {
        const response_obj = snapshot.val();
        const dropdown_items = this.getProcessedDropDownItem(response_obj, keyname);
        const flex = Control.getControl(document.getElementById('theGrid'));
        if (flex) {
          const columns = flex.columns;
          columns.forEach((column) => {
            const binding = column._binding._key
            if (binding == keyname) {
              column.dataMap = new DataMap(dropdown_items, 'key', 'name')
            }
          })
          this.setState({
            [keyname + 's']: response_obj
          })
        }
      })
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

  componentDidMount() {
    this.store_ref = firebase.ref().child('tracks');
    this.store_ref.on('value', (snapshot) => {
      const events_obj = snapshot.val();
      const events_list = this.getProcessedTracks(events_obj);
      const view = new CollectionView(events_list);
      view.trackChanges = true;
      this.setState({
        view
      }, () => {
        this.deselectEverything()
      })
    })
    this.setupDropdowns(['song', 'event'])
    window.addEventListener("scroll", this.onScroll, false);
  }

  componentWillUnmount() {
    localStorage.setItem('pos', 0);
    window.removeEventListener('scroll', this.onScroll, false)
  }

  getEventTypes() {
    return [
      {
        name : 'Concert',
        key: 'concert'
      },
      {
        name : 'Conference',
        key: 'conference'
      },
      {
        name : 'Corporate',
        key: 'corporate'
      },
      {
        name : 'Product Launch',
        key: 'product_launch'
      },
    ]
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
    return filter_panel
  }

  getUpdatedItem(item) {
    const deep_item = {...item}
    const { songs = {}, events = {}} = this.state;
    delete deep_item['id']
    const song_slug = songs[item['song']] ? songs[item['song']]['filename'] : ''
    const event_slug = events[item['event']] ? events[item['event']]['filename'] : ''
    deep_item['filename'] = event_slug + '_' + slugify(deep_item['order'] ? deep_item['order'] : '') + '_' + song_slug
    deep_item['order'] = deep_item['order'] ? parseInt(deep_item['order']) : ''
    return deep_item
  }

  isRowEmpty(event = {}) {
    event = {...event}
    delete event['sel_for_deletion']
    return !Object.keys(event).length
  }

  updatedView(s, e) {
    let nPos = localStorage.getItem("pos");
    this.setupGrouping()
    if (nPos) {
      window.scrollTo(0, nPos);
    }
  }

  onPasted(s, e) {
    const items = this.state.view.itemsAdded
    let p = Promise.resolve()
    for (let i = 0; i < items.length; i++) {
      items[i].id = 'track-'+mongoObjectId()
      p = p.then(this.saveItem(items[i]))
    }
  }

  saveItem(item = {}) {
    if (!this.isRowEmpty(item)) {
      let item_id = item['id'];
      if (!item_id) {
        item_id = 'track-'+mongoObjectId()
      }
      const updates = {};
      const updated_item = this.getUpdatedItem(item);
      updates['/tracks/' + item_id ] = updated_item;
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
    const ids = rows.map(event => {
      updates['/tracks/'+event['id']] = null
    })
    firebase.ref().update(updates);
  }

  deleteSelected() {
    const selected_rows = this.state.view.items.filter(event => event['sel_for_deletion'])
    this.deleteRows(selected_rows)
  }
  setupDataMaps(flex) {

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
        this.setupDataMaps(grid)
      } catch (e) {
        setTimeout(mapGrouping, 1000)
      }
    }
    setTimeout(mapGrouping, 1000)
  }

  getSetsOptions() {
    return ['Set 1', 'Set 2', 'Encore']
  }
  onClickAddRow() {
    this.bottom.scrollIntoView()
  }

  gotoTop() {
    window.scrollTo(0,0);
  }

  isLongList() {
    if (this.state.view.items) {
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
  getGrids() {
    return (
      <div>
        <GroupPanel
          id="thePanel"
          placeholder="Drag columns here to create Groups"
          className="clearfix mb10 text-center br-4"/>
        <wjGrid.FlexGrid
          id ='theGrid'
          autoGenerateColumns={false}
          columns={[
            { header: 'ID', binding: 'id', width: '1.3*', minWidth: 250, isReadOnly: true },
            { header: 'Set', binding: 'set', width: '.4*', minWidth: 100, dataMap: this.getSetsOptions(), isRequired: true },
            { header: 'Order', binding: 'order', width: '.4*', minWidth: 100, isRequired: true },
            { header: 'Song', binding: 'song', width: '1.2*', minWidth: 250, isRequired: true },
            { header: 'Event', binding: 'event', width: '1*', minWidth: 250, },
            { header: 'filename', binding: 'filename', width: '1*', minWidth: 250, isReadOnly: true },
            { header: 'Delete', binding: 'sel_for_deletion', width: '.4*', minWidth: 80 },
          ]}
          cellEditEnded={this.onCellEditEnded}
          itemsSource={this.state.view}
          initialized={ this.onInitialized }
          allowAddNew={true}
          updatedView={this.updatedView}
          formatItem={this.formatItem}
          onPasted={this.onPasted}
        />
      </div>
    )
  }
  render() {
    return (
      <div>
        <Header tab='tracks'/>
        <div className='container'>
          <div className="row">
            <div className='col-md-12'>
              <span className='table_header'>Tracks</span>
              <button className='pull-right btn btn-default mb10' onClick={this.deleteSelected}> Delete Selected </button>
              {this.isLongList() && <button className='pull-right btn btn-default mb10 mr10' onClick={this.onClickAddRow}> Add Row </button>}
            </div>
          </div>
        </div>
        <div id="filterPanel"></div>
        <div style={{display : 'none'}}>
          <div id="theColumnPicker" className="column-picker"></div>
        </div>
        {this.getGrids()}
        <div className='container'>
          <div className="row">
            <div className='col-md-12'>
              {this.isLongList() && <button ref={(el) => { this.bottom = el }} className='pull-right btn btn-default mt10 bottom-button' onClick={this.deleteSelected}> Delete Selected </button>}
              {this.isLongList() && <button onClick={this.gotoTop} className='pull-right btn btn-default mt10 bottom-button mr10'> Go to top </button>}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
