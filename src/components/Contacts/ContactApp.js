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

export default class ContactApp extends React.Component {

  constructor(props) {
    super(props);
    this.getContactsData = this.getContactsData.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onInitialized = this.onInitialized.bind(this)
    this.onCellEditEnded = this.onCellEditEnded.bind(this)
    this.deleteSelected = this.deleteSelected.bind(this)
    this.onClickAddRow = this.onClickAddRow.bind(this)
    this.isLongList = this.isLongList.bind(this)
    this.updatedView = this.updatedView.bind(this)
    this.saveItem = this.saveItem.bind(this)
    this.deselectEverything = this.deselectEverything.bind(this)
    // get initial state
    this.state = {
      contacts: [],
      view: null
    };
  }

  getProcessedContacts(contacts_obj) {
    return Object.keys(contacts_obj).map((key) => {
      return {
        id: key,
        sel_for_deletion: false,
        ...contacts_obj[key],
      }
    })
  }

  // connect GroupPanel to FlexGrid when the component mounts
  componentDidMount() {
    this.store_ref = firebase.ref().child('contacts');
    this.store_ref.on('value', (snapshot) => {
      const contacts_obj = snapshot.val();
      const contacts_list = this.getProcessedContacts(contacts_obj);
      const view = new CollectionView(contacts_list);
      view.trackChanges = true;
      this.setState({
        view
      }, () => {
        this.deselectEverything()
      })
    })
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
  componentWillUnmount() {
    localStorage.setItem('pos', 0);
    window.removeEventListener('scroll', this.onScroll, false)
  }
  getContactsData() {
    return Object.values(this.state.contacts)
  }

  getContactTypes() {
    return [
      {
        name : 'Artist',
        key: 'artist'
      },
      {
        name : 'Brand',
        key: 'brand'
      },
      {
        name : 'Person',
        key: 'person'
      },
      {
        name : 'Employee',
        key: 'employee'
      },
      {
        name : 'Contractor',
        key: 'contractor'
      },
    ]
  }

  onChange(s, e) {
    const items = this.state.view.itemsAdded
    let p = Promise.resolve()
    for (let i = 0; i < items.length; i++) {
      items[i].id = 'contact-'+mongoObjectId()
      p = p.then(this.saveItem(items[i]))
    }
  }

  onScroll(event) {
    const top = this.scrollY;
    localStorage.setItem('pos', top);
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
    delete deep_item['id']
    deep_item['filename'] = slugify(deep_item['name'] ? deep_item['name'] : '')
    return deep_item
  }

  isRowEmpty(contact = {}) {
    contact = {...contact}
    delete contact['sel_for_deletion']
    return !Object.keys(contact).length
  }

  saveItem(item = {}) {
    if (!this.isRowEmpty(item)) {
      let item_id = item['id'];
      if (!item_id) {
        item_id = 'contact-'+mongoObjectId()
      }
      const updates = {};
      const updated_item = this.getUpdatedItem(item);
      updates['/contacts/' + item_id ] = updated_item;
      return firebase.ref().update(updates)
    }
    return Promise.resolve()
  }

  onCellEditEnded(s, e) {
    const { row, col } = e;
    let item = {...s.rows[row].dataItem};
    this.saveItem(item)
  }
 deselectEverything() {
    if (this.state.view.moveCurrentToPosition) {
      this.state.view.moveCurrentToPosition(-1)
    }
  }
  deleteRows(rows = []) {
    const updates = {}
    const ids = rows.map(contact => {
      updates['/contacts/'+contact['id']] = null
    })
    firebase.ref().update(updates);
  }

  deleteSelected() {
    const selected_rows = this.state.view.items.filter(contact => contact['sel_for_deletion'])
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
  updatedView(s, e) {
    let nPos = localStorage.getItem("pos");
    this.setupGrouping()
    if (nPos) {
      window.scrollTo(0, nPos);
    }
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
    const { view } = this.state;
    if (view == null) {
      return this.getLoader()
    }
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
              { header: 'ID', binding: 'id', width: '1.3*', isReadOnly: true },
              { header: 'Name', binding: 'name', width: '1*', isRequired: true },
              { header: 'Type', binding: 'type', dataMap: new DataMap(this.getContactTypes(), 'key', 'name'), width: '1.2*', isRequired: true },
              { header: 'Filename', binding: 'filename', width: '1*', isReadOnly: true },
              { header: 'Delete', binding: 'sel_for_deletion', width: '.5*' },
          ]}
          cellEditEnded={this.onCellEditEnded}
          showDropDown={true}
          itemsSource={this.state.view}
          initialized={ this.onInitialized }
          allowAddNew={true}
          updatedView={this.updatedView}
          formatItem={this.formatItem}
          onPasted={this.onChange}
        />
      </div>
    )
  }
  render() {

    return (
      <div>
        <Header tab='contacts'/>
        <div className='container'>
          <div className="row">
            <div className='col-md-12'>
              <span className='table_header'>Contacts</span>
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
