import React from 'react';
import Header from './../common/Header';
import firebase from '../../helpers/base';
import mongoObjectId from '../../helpers/mongoId';
import { slugify } from '../../helpers';
import * as wjGrid from 'wijmo/wijmo.react.grid';
import { GroupPanel } from 'wijmo/wijmo.react.grid.grouppanel';
import { FlexGridFilter } from 'wijmo/wijmo.grid.filter'
import { DataMap } from 'wijmo/wijmo.grid'
import { CollectionView, Control } from 'wijmo/wijmo'

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
    // get initial state
    this.state = {
      events: [],
      view: [],
      contacts_dropdown: [],
      venues_dropdown: [],
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
        name: keyname == 'events' ? filename : name
      }
    })
  }

  setupDropdowns(dropdown_keys = []) {
    dropdown_keys.forEach((keyname) => {
      this.store_keyname_ref = firebase.ref().child(keyname);
      this.store_keyname_ref.on('value', (snapshot) => {
        const response_obj = snapshot.val();
        const dropdown_items = this.getProcessedDropDownItem(response_obj, keyname);
        this.setState({
          [keyname + '_dropdown']: dropdown_items,
          [keyname]: response_obj,
          new_mongid: mongoObjectId()
        }, () => {
          this.deselectEverything()
        })
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
    this.setupDropdowns(['songs', 'events'])
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
    return new FlexGridFilter(s); // add a FlexGridFilter to it
  }

  getUpdatedItem(item) {
    const deep_item = {...item}
    const { songs = {}, events = {}} = this.state;
    delete deep_item['id']
    const song_slug = songs[item['song']] ? songs[item['song']]['filename'] : ''
    const event_slug = events[item['event']] ? events[item['event']]['filename'] : ''
    deep_item['filename'] = event_slug + '_' + slugify(deep_item['order'] ? deep_item['order'] : '') + '_' + song_slug
    deep_item['order'] = parseInt(deep_item['order'])
    return deep_item
  }

  isRowEmpty(event = {}) {
    event = {...event}
    delete event['sel_for_deletion']
    return !Object.keys(event).length
  }

  updatedView(s, e) {
    let nPos = localStorage.getItem("pos");
    if (nPos) {
      window.scrollTo(0, nPos);
    }
  }

  onCellEditEnded(s, e) {
    const { row, col } = e;
    let item = {...s.rows[row].dataItem};
    if (!this.isRowEmpty(item)) {
      s.finishEditing()
      let item_id = item['id'];
      if (!item_id) {
        item_id = 'track-'+mongoObjectId()
      }
      const updates = {};
      const updated_item = this.getUpdatedItem(item);
      updates['/tracks/' + item_id ] = updated_item;
      firebase.ref().update(updates);
    }
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

  setupGrouping() {
    const grid = Control.getControl(document.getElementById('theGrid'));
    const panel = Control.getControl(document.getElementById('thePanel'));
    panel.grid = grid;
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

  getGrids() {
    const { events_dropdown = [], songs_dropdown = [] } = this.state;
    if (this.state.view.length) {
      return 'Loading...'
    }
    window.setTimeout(this.setupGrouping, 2000)
    return (
      <div key={this.state.new_mongid}>
        <GroupPanel
          id="thePanel"
          placeholder="Drag columns here to create Groups"
          className="clearfix mb10 text-center br-4"/>
        <wjGrid.FlexGrid
          id ='theGrid'
          autoGenerateColumns={false}
          columns={[
            { header: 'ID', binding: 'id', width: '1.3*', isReadOnly: true },
            { header: 'Set', binding: 'set', width: '.6*', dataMap: this.getSetsOptions(), isRequired: true },
            { header: 'Order', binding: 'order', width: '.6*', isRequired: true },
            { header: 'Song', binding: 'song', width: '1.2*', dataMap: new DataMap(songs_dropdown, 'key', 'name'), isRequired: true },
            { header: 'Event', binding: 'event', dataMap: new DataMap(events_dropdown, 'key', 'name'), width: '1*' },
            { header: 'filename', binding: 'filename', width: '1*', isReadOnly: true },
            { header: 'Delete', binding: 'sel_for_deletion', width: '.5*' },
          ]}
          cellEditEnded={this.onCellEditEnded}
          itemsSource={this.state.view}
          initialized={ this.onInitialized }
          allowAddNew={true}
          updatedView={this.updatedView}
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
