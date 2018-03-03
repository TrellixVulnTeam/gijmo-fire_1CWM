import React from 'react';
import Header from './Header';
import Venues from './Venues';
import Venue from './Venue';
import base from '../base';

class VenueApp extends React.Component {

  constructor() {
    super();
    this.addVenue = this.addVenue.bind(this);
    this.updateVenue = this.updateVenue.bind(this);
    this.removeVenue = this.removeVenue.bind(this);
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

  updateVenue(key, updatedVenue) {
    const venues = {...this.state.venues};
    venues[key] = updatedVenue;
    this.setState({ venues }, () => {
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
