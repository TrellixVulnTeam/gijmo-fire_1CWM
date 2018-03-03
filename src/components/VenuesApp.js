import React from 'react';
import $ from 'jquery';
import Header from './Header';
import Venues from './Venues';
import Venue from './Venue';
import base from '../base';
import { slugify } from '../helper';

class VenueApp extends React.Component {

  constructor() {
    super();
    this.addVenue = this.addVenue.bind(this);
    this.updateVenue = this.updateVenue.bind(this);
    this.removeVenue = this.removeVenue.bind(this);
    this.ifVenueNameChanged = this.ifVenueNameChanged.bind(this);
    this.updateGigsOnVenueNameChange = this.updateGigsOnVenueNameChange.bind(this);
    // get initial state
    this.state = {
      venues: {},
    };
  }

  componentWillMount() {
    this.ref = base.syncState(`/website/${this.props.match.params.websiteId}/venues`, {
      context: this,
      state: `venues`
    });
    this.gigsRef = base.syncState(`/website/${this.props.match.params.websiteId}/gigs`, {
      context: this,
      state: `gigs`
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  addVenue(venue) {
    //get a copy of the state
    const venues = {...this.state.venues};
    //add in our new venues
    const timestamp = Date.now();
    venues[`venue-${timestamp}`]= venue;
    //set state
    this.setState({ venues: venues })
  }
  ifVenueNameChanged(key, old_state, updateVenue) {
    return (old_state[key].venueName != updateVenue.venueName);
  }
  updateGigsOnVenueNameChange(key, old_state, updateVenue) {
    if (this.ifVenueNameChanged(key, old_state, updateVenue)) {
      const updated_gigs = {};
      const { gigs = {} } = this.state;

      Object.keys(gigs).map(gig_key => {
        const old_gig = gigs[gig_key];
        if (old_gig.gigVenue == key) {
          updated_gigs[gig_key] = {
            ...old_gig,
            gigVenueName: updateVenue.venueName

          }
        } else {
          updated_gigs[gig_key] = gigs[gig_key]
        }
      })
      this.setState({ gigs: updated_gigs });
    }
  }

  ifVenueTypeChanged(key, old_state, updateVenue) {
    return (old_state[key].venueType != updateVenue.venueType);
  }
  updateGigsOnVenueTypeChange(key, old_state, updateVenue) {
    if (this.ifVenueTypeChanged(key, old_state, updateVenue)) {
      const updated_gigs = {};
      const { gigs = {} } = this.state;

      Object.keys(gigs).map(gig_key => {
        const old_gig = gigs[gig_key];
        if (old_gig.gigVenue == key) {
          updated_gigs[gig_key] = {
            ...old_gig,
            gigVenueType: updateVenue.venueType

          }
        } else {
          updated_gigs[gig_key] = gigs[gig_key]
        }
      })
      this.setState({ gigs: updated_gigs });
    }
  }


  updateVenue(key, updatedVenue) {
    const venues = {...this.state.venues};
    venues[key] = updatedVenue;
    const old_state = this.state.venues;
    this.setState({ venues }, () => {
      this.updateGigsOnVenueNameChange(key, old_state, updatedVenue);
    });
  }

  removeVenue(key) {
    const venues = {...this.state.venues};
    venues[key] = null;
    this.setState({ venues });
  }

  render() {
    return (
      <div className="tourgigs">
        <div className="header">
          <Header websiteId={this.props.match.params.websiteId}/>
        </div>
        <h3>Venues</h3>

        <ul className="list-of-venues">
          {
            Object
              .keys(this.state.venues)
              .map(key => <Venue key={key} details={this.state.venues[key]} params={this.props.match.params} />)
          }
        </ul>
        <h3>Name | Type | Filename</h3>

        <Venues
          addVenue={this.addVenue}
          params={this.props.match.params}
          venues={this.state.venues}
          updateVenue={this.updateVenue}
          removeVenue={this.removeVenue}
        />

      </div>
    )
  }
}

export default VenueApp;
