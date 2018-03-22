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
    this.onChange = this.onChange.bind(this)
    this.onInitialized = this.onInitialized.bind(this)
    this.onCellEditEnded = this.onCellEditEnded.bind(this)
    this.deleteSelected = this.deleteSelected.bind(this)
    this.setupDropdowns = this.setupDropdowns.bind(this)
    this.deselectEverything = this.deselectEverything.bind(this)
    this.getUpdatedItem = this.getUpdatedItem.bind(this)
    this.onClickAddRow = this.onClickAddRow.bind(this)
    this.isLongList = this.isLongList.bind(this)
    // get initial state
    this.state = {
      events: [],
      view: [],
      contacts_dropdown: [],
      venues_dropdown: [],
      new_mongid: mongoObjectId()
    };
  }

  getProcessedEvents(events_obj) {
    return Object.keys(events_obj).map((key) => {
      return {
        id: key,
        sel_for_deletion: false,
        ...events_obj[key],
      }
    })
  }

  getProcessedDropDownItem(item_list) {
    return Object.keys(item_list).map((id) => {
      const { name = '' } = item_list[id]
      return {
        key: id,
        name
      }
    })
  }

  setupDropdowns(dropdown_keys = []) {
    dropdown_keys.forEach((keyname) => {
      this.store_contacts_ref = firebase.ref().child(keyname);
      this.store_contacts_ref.on('value', (snapshot) => {
        const events_obj = snapshot.val();
        const dropdown_items = this.getProcessedDropDownItem(events_obj);
        this.setState({
          [keyname + '_dropdown']: dropdown_items,
          [keyname]: events_obj,
          new_mongid: mongoObjectId()
        })
      })
    })
  }

  deselectEverything() {
    if (this.state.view.moveCurrentToPosition) {
      this.state.view.moveCurrentToPosition(-1)
    }
  }
  // connect GroupPanel to FlexGrid when the component mounts
  componentDidMount() {
    this.store_ref = firebase.ref().child('events');
    this.store_ref.on('value', (snapshot) => {
      const events_obj = snapshot.val();
      const events_list = this.getProcessedEvents(events_obj);
      const view = new CollectionView(events_list);
      view.trackChanges = true;
      this.setState({
        view
      }, () => {
        this.deselectEverything()
      })
    })
    this.setupDropdowns(['contacts', 'venues'])
    window.addEventListener("scroll", function(event) {
        const top = this.scrollY;
        localStorage.setItem('pos', top);
    }, false);
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

  onChange(a, b) {
    const item = this.state.view.itemsAdded
  }

  onInitialized(s, e) {
    return new FlexGridFilter(s); // add a FlexGridFilter to it
  }

  getUpdatedItem(item) {
    const { contacts = {} } = this.state;
    const deep_item = {...item}
    delete deep_item['id']
    const date = deep_item['date'] ? deep_item['date'] : ''
    const contact_filename = contacts[deep_item['contact']] ? contacts[deep_item['contact']]['filename'] : ''
    deep_item['filename'] = slugify(date) + '_' + contact_filename
    return deep_item
  }

  isRowEmpty(event = {}) {
    event = {...event}
    delete event['sel_for_deletion']
    return !Object.keys(event).length
  }

  onCellEditEnded(s, e) {
    const { row, col } = e;
    let item = {...s.rows[row].dataItem};
    if (!this.isRowEmpty(item)) {
      s.finishEditing()
      let item_id = item['id'];
      if (!item_id) {
        item_id = 'event-'+mongoObjectId()
      }
      const updates = {};
      const updated_item = this.getUpdatedItem(item);
      updates['/events/' + item_id ] = updated_item;
      firebase.ref().update(updates);
    }
  }

  deleteRows(rows = []) {
    const updates = {}
    const ids = rows.map(event => {
      updates['/events/'+event['id']] = null
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
  updatedView(s, e) {
    let nPos = localStorage.getItem("pos");
    if (nPos) {
      window.scrollTo(0, nPos);
    }
  }
  getGrids() {
    const { contacts_dropdown = [], venues_dropdown = [] } = this.state;
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
            { header: 'Type', binding: 'type', dataMap: new DataMap(this.getEventTypes(), 'key', 'name'), width: '1.2*', isRequired: true },
            { header: 'Contact', binding: 'contact',  showDropDown: true, dataMap: new DataMap(contacts_dropdown, 'key', 'name'), width: '1.2*', isRequired: true },
            { header: 'Venue', binding: 'venue',  showDropDown: true, dataMap: new DataMap(venues_dropdown, 'key', 'name'), width: '1.2*', isRequired: true },
            { header: 'Date', binding: 'date', width: '1*' },
            { header: 'Filename', binding: 'filename', width: '1*', isReadOnly: true},
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
        <Header tab='events'/>
        <div className='container'>
          <div className="row">
            <div className='col-md-12'>
              <span className='table_header'>Events</span>
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
