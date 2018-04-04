import React from 'react';
import { Popover, ListGroup, Overlay, OverlayTrigger, Button, ButtonToolbar, FormGroup, ControlLabel, FormControl, Glyphicon } from 'react-bootstrap';
import DropDownItem from './DropDownItem'
import firebase from '../../helpers/base';
import { slugify } from '../../helpers';
import mongoObjectId from '../../helpers/mongoId';
import _ from 'lodash';

export default class ViewsDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.getInput = this.getInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getListItems = this.getListItems.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onCloseClick = this.onCloseClick.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);

    this.state = {
      dropdownOpen: false,
      name: '',
      type: '',
      type_id: 0,
      typeIcons: {
        1: 'font',
        2: 'subscript',
        3: 'check',
        4: 'th-list',
        5: 'collapse-down',
        6: 'calendar',
        7: 'link',
        8: 'pencil',
        9: 'transfer',
        10: 'search'
      },
      allDataTypes: {
        1: 'Text',
        2: 'Number',
        3: 'Checkbox',
        4: 'Multiple select',
        5: 'Single select',
        6: 'Date',
        7: 'URL',
        8: 'Formula',
        9: 'Link to another record',
        10: 'Lookup'
      },
      resultDataTypes:{}
    };
  }

  componentDidMount() {
    this.setState({ resultDataTypes: this.state.allDataTypes })
  }

  isValidText(text = '') {
    if (text.length == 0 || text.length > 15) {
      this.setState({
        validationState: {
          status: 'error',
          text: 'Column name length should be between 1-15 characters'
        }
      })
      return false
    } else {
      const { allViews = {} } = this.state;
      const is_duplicate = Object.values(allViews).some(view => view['name'] == text)
      if (is_duplicate) {
        this.setState({
          validationState: {
            status: 'error',
            text: `${text} already exists`
          }
        })
        return false
      }
    }
    return true;
  }

  handleChange(e) {
    const { value = '' } = e.target;
    if (value.length > 15) {
      this.isValidText(value)
      return
    }
    const { allDataTypes = {} } = this.state;
    const dataType_ids = Object.keys(allDataTypes).filter(type_id => {
      return allDataTypes[type_id].toLowerCase().indexOf(value.toLowerCase()) !== -1
    })
    const resultDataTypes = {};
    dataType_ids.map(id => {
      resultDataTypes[id] = allDataTypes[id]
    });

    this.setState({ type: value, resultDataTypes, validationState: {}});
  }

  getListItems() {
    return (
      <div className="list-group-wrapper">
        {
          <ListGroup componentClass="ul" className="dropdown-list-items">
            {
              Object.keys(this.state.resultDataTypes).map(type_id => {
                const type = this.state.resultDataTypes[type_id]
                const selected = this.state.type == type
                return (
                  <DropDownItem key={type_id} onClick={() => this.setState({ type, type_id })}>
                    <Glyphicon glyph={this.state.typeIcons[type_id]} />
                    { ' ' + type + ' ' }
                    {selected && <span className="glyphicon glyphicon-ok text-success" aria-hidden="true"></span>}
                  </DropDownItem>
                )
              })
            }
          </ListGroup>
        }
      </div>
    )
  }

  onSubmit(e) {
    e.preventDefault()
  }

  getInput() {
    const { validationState = {} } = this.state
    return (
      <form id="addColumnForm" onSubmit={this.onSubmit}>
        <FormGroup
          controlId="formBasicText"
          validationState={validationState.status}
        >
          <FormControl
            type="text"
            autoComplete="off"
            value={this.state.name}
            placeholder="Enter Data Name"
            onChange={(e) => this.setState({ name: e.target.value })}
          />
          <div className="mt5">{validationState.text}</div>
        </FormGroup>
        <FormGroup
          controlId="formBasicText"
          validationState={validationState.status}
          style={{marginBottom: '0'}}
        >
          <FormControl
            type="text"
            autoComplete="off"
            value={this.state.type}
            placeholder="Find a field Type"
            onChange={this.handleChange}
          />
        </FormGroup>
      </form>
    )
  }

  handleClick(e) {
    this.setState({ 
      target: e.target, 
      dropdownOpen: !this.state.dropdownOpen, 
      resultDataTypes: this.state.allDataTypes, 
      name: '', 
      type: '' ,
      type_id: 0
    });
  };

  onCloseClick() {
    this.setState({ dropdownOpen: false, name: '', type: '', type_id: 0, resultDataTypes: this.state.allDataTypes });
  };

  onSaveClick() {
    const name = this.state.name;
    const type_id = this.state.type_id;
    this.props.addColumn(name, parseInt(type_id));
    this.setState({ dropdownOpen: false, name: '', type: '', type_id: 0, resultDataTypes: this.state.allDataTypes });
  }

  render() {
    const { currentView = '', allViews = {}, isChangingView = false } = this.state
    const dropdown_text = allViews[currentView] ? allViews[currentView]['name'] : 'Select a view'
    return (
      <ButtonToolbar className="pull-right" style={{'position': 'relative'}}>
        <Button id='show_view' className="pull-right btn btn-default mb10 mr15" onClick={this.handleClick}>Add Column</Button>
        <Overlay show={this.state.dropdownOpen} target={this.state.target} placement="bottom" container={this} containerPadding={20}>
          <Popover id="add-column-popover-views" className="view_dropdown" style={{width: '250px', left: '-10px !improtant'}}>
            {this.getInput()}
            {this.getListItems()}
            <div className="clearfix" style={{marginTop: '15px'}}>
              <Button id='show_view' className="pull-right btn btn-default mb10 mr15" bsStyle="primary" style={{'marginRight': '0'}}
                onClick={this.onSaveClick} disabled={this.state.name==""||this.state.type_id==0}>Save</Button>
              <Button id='show_view' className="pull-right btn btn-default mb10 mr15" onClick={this.onCloseClick}>Cancel</Button>
            </div>
          </Popover>
        </Overlay>
      </ButtonToolbar>
    );
  }
}
