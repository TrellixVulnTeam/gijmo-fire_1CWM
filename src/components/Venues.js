import React from 'react';
import AddVenueForm from './VenueAddForm';
import { slugify } from '../helper';

class Venues extends React.Component {

  constructor() {
    super();
    this.renderVenues = this.renderVenues.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, key) {
    const name = e.target.name;
    const value = e.target.value;
    const venue = this.props.venues[key];

    const fileNameObject = {}
    if (name == 'venueName') {
      fileNameObject['venueFilename'] = slugify(value);
    }

    if (name == 'venueCity') {
      fileNameObject['venueCityState'] = value+", "+venue.venueState;
    }

    if (name == 'venueState') {
      fileNameObject['venueCityState'] =venue.venueCity+". "+value;
    }

    this.setState({text: value,}, () => {
      const venue = this.props.venues[key];
      const updatedVenue = {
        ...venue,
        ...fileNameObject,
        [name]: value
      }
      this.props.updateVenue(key, updatedVenue);
    });
  }

  renderVenues(key) {

    const venue = this.props.venues[key];
    return (
      <div className="venue-edit" key={key} data-key={key}>
        <input type="text" name="venueName" value={venue.venueName} placeholder="Venue Name" onChange={(e) => this.handleChange(e, key)}/>
        <select type="text" name="venueType" value={venue.venueType} placeholder="Venue Type" onChange={(e) => this.handleChange(e, key)}>
          <option value="theatre">Theatre</option>
          <option value="stadium">Stadium</option>
          <option value="amphitheatre">Amphitheatre</option>
          <option value="store">Store</option>
        </select>
        <input type="text" name="venueCity" value={venue.venueCity} placeholder="Venue City" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="venueState" value={venue.venueState} placeholder="Venue State" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="venueCityState" value={venue.venueCityState} placeholder="Venue City State" readOnly/>


        <input type="text" name="venueFilename" value={venue.venueFilename} placeholder="Venue Filename" readOnly/>
        <button onClick={() => this.props.removeVenue(key)}>Remove Venue</button>
      </div>
    )
  }

  render() {
    return (
      <div>
      {Object.keys(this.props.venues).map(this.renderVenues)}
      <AddVenueForm addVenue={this.props.addVenue} params={this.props.params} />
      </div>
    )
  }
}

export default Venues;
