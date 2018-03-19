import React from 'react';
import base from './../../helpers/base';
import Events from './Events';
import Header from './../common/Header';


class EventPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: {},
      contacts: {},
      venues: {}
    }
    this.getContactData = this.getContactData.bind(this);
    this.getVenueData = this.getVenueData.bind(this);
    this.getTracksForCurrentEvent = this.getTracksForCurrentEvent.bind(this);
    this.renderTracks = this.renderTracks.bind(this);
  }

  componentWillMount() {
    this.ref = base.syncState(`/events`, {
      context: this,
      state: `events`
    });

    this.contactRef = base.syncState(`/contacts`, {
        context: this,
        state: 'contacts'
    });

      this.venueRef = base.syncState(`/venues`, {
        context: this,
        state: 'venues'
    });

    this.venueRef = base.syncState(`/tracks`, {
      context: this,
      state: 'tracks'
    });

    this.venueRef = base.syncState(`/songs`, {
      context: this,
      state: 'songs'
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  getContactData(contact_id) {
    let contact = {};
    const {contacts = {}}= this.state;

    Object.keys(contacts).map(art_id => {
      if (art_id == contact_id) {
        contact = contacts[contact_id]
      }
    })

    return contact;
  }
getVenueData(venue_id) {
    let venue = {};
    const { venues = {}} = this.state;
    Object.keys(venues).map(ven_id => {
      if (ven_id == venue_id) {
        venue = venues[venue_id]
      }
    })
    return venue;
  }

  getTracksForCurrentEvent(event_id) {
    const {tracks = {}} = this.state;
    let all_tracks = [];
    Object.values(tracks).map((track) => {
        if (track['event']== event_id) {
          all_tracks.push(track);
        }
    })
    return all_tracks;
  }

  renderTracks(all_tracks) {
    const {songs} = this.state;
    if (songs && Object.keys(songs).length) {
      return (
        <div>
          <h2>All Tracks</h2>
            <ul>
            {
              all_tracks.map((track, index) => {
                const song_name = songs[track['song']]['name'];
                return <li key={index}>{track['set']}...{track['order']}...{song_name}</li>
              })
            }
            </ul>
        </div>
      );
    }
  }

render() {
  const event_id = this.props.match.params.eventId;

  console.log (this.state)

  const events = this.state.events;

  let required_event_id = '';
  let required_event = events[event_id];

  if (required_event) {
    const { filename ='', date = '', name = '', type = '', contact = '', venue = '' } = required_event;
    const contact_data = this.getContactData(contact);
    const venue_data = this.getVenueData(venue);
    const all_tracks = this.getTracksForCurrentEvent(required_event_id);

    return (
      <div className="tourevents">
          <div className="header">
              <Header />
          </div>
          <div>
              <h1>Event Page</h1>
              <h2>Filename: {required_event['filename']}</h2>
              <h2>Date: {required_event['date']}</h2>
              <h2>Name (Identifyer): {required_event['name']}</h2>
              <h2>Type: {required_event['type']}</h2>
              <h2>ContactID: {required_event['contact']}</h2>
              <h2>ContactName: {contact_data.name}</h2>
              <h2>Venue: {venue_data.name}</h2>
              {this.renderTracks(all_tracks)}
          </div>
      </div>
    );
  }
  return 'Loading...';
  }
};

export default EventPage;
