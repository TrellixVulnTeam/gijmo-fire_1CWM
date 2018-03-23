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
    this.getSongsData = this.getSongsData.bind(this)
    this.onInitialized = this.onInitialized.bind(this)
    this.onCellEditEnded = this.onCellEditEnded.bind(this)
    this.deleteSelected = this.deleteSelected.bind(this)
    this.onClickAddRow = this.onClickAddRow.bind(this)
    this.isLongList = this.isLongList.bind(this)
    this.updatedView = this.updatedView.bind(this)
    this.saveItem = this.saveItem.bind(this)
    this.onChange = this.onChange.bind(this)
    // get initial state
    this.state = {
      songs: [],
      view: null
    };
  }

  getProcessedSongs(songs_obj) {
    return Object.keys(songs_obj).map((key) => {
      return {
        id: key,
        sel_for_deletion: false,
        ...songs_obj[key],
      }
    })
  }
  isLongList() {
    if (this.state.view && this.state.view.items) {
      return this.state.view.items.length > 30
    }
    return false
  }
  onScroll(event) {
    const top = this.scrollY;
    localStorage.setItem('pos', top);
  }
  // connect GroupPanel to FlexGrid when the component mounts
  componentDidMount() {
    this.store_ref = firebase.ref().child('songs');
    this.store_ref.on('value', (snapshot) => {
      const songs_obj = snapshot.val();
      const songs_list = this.getProcessedSongs(songs_obj);
      const view = new CollectionView(songs_list);
      view.trackChanges = true;
      this.setState({
        view
      })
    })
    window.addEventListener("scroll", this.onScroll, false);
  }
  onChange(s, e) {
    const items = this.state.view.itemsAdded
    let p = Promise.resolve()
    for (let i = 0; i < items.length; i++) {
      items[i].id = 'song-'+mongoObjectId()
      p = p.then(this.saveItem(items[i]))
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.view.moveCurrentToLast) {
      this.state.view.moveCurrentToLast()
    }
  }

  getSongsData() {
    return Object.values(this.state.songs)
  }

  getSongTypes() {
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
    const filename = slugify(deep_item['name'] ? deep_item['name'] : '')
    deep_item['filename'] = filename;
    return deep_item
  }

  isRowEmpty(song = {}) {
    song = {...song}
    delete song['sel_for_deletion']
    return !Object.keys(song).length
  }

  saveItem(item = {}) {
    if (!this.isRowEmpty(item)) {
      let item_id = item['id'];
      if (!item_id) {
        item_id = 'song-'+mongoObjectId()
      }
      const updates = {};
      const updated_item = this.getUpdatedItem(item);
      updates['/songs/' + item_id ] = updated_item;
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
    const ids = rows.map(song => {
      updates['/songs/'+song['id']] = null
    })
    firebase.ref().update(updates);
  }

  deleteSelected() {
    const selected_rows = this.state.view.items.filter(song => song['sel_for_deletion'])
    this.deleteRows(selected_rows)
  }
  onClickAddRow() {
    this.bottom.scrollIntoView()
  }
  gotoTop() {
    window.scrollTo(0,0);
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
          columns={[
              { header: 'ID', binding: 'id', width: '.7*', isReadOnly: true },
              { header: 'Name', binding: 'name', width: '1*', isRequired: true },
              { header: 'Filename', binding: 'filename', width: '1*', isReadOnly: true },
              { header: 'Delete', binding: 'sel_for_deletion', width: '.5*'},
          ]}
          cellEditEnded={this.onCellEditEnded}
          showDropDown={true}
          itemsSource={this.state.view}
          initialized={ this.onInitialized }
          allowAddNew={true}
          formatItem={this.formatItem}
          updatedView={this.updatedView}
          onPasted={this.onChange}
        />
      </div>
    )
  }
  render() {
    return (
      <div>
        <Header tab='songs'/>
        <div className='container'>
          <div className="row">
            <div className='col-md-12'>
              <span className='table_header'>Songs</span>
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
