import React from 'react';
import base from '../base';
import Gigs from './Gigs';
import Header from './Header';


class GigPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gigs: {},
      artists: {},
      venues: {}
    }
    this.getArtistData = this.getArtistData.bind(this);
    this.getVenueData = this.getVenueData.bind(this);
    this.getTracksForCurrentGig = this.getTracksForCurrentGig.bind(this);
    this.renderTracks = this.renderTracks.bind(this);
  }



  componentWillMount() {
    this.ref = base.syncState(`/website/${this.props.match.params.websiteId}/gigs`, {
      context: this,
      state: `gigs`
    });

    this.artistRef = base.syncState(`/website/${this.props.match.params.websiteId}/artists`, {
        context: this,
        state: 'artists'
    });
  
      this.venueRef = base.syncState(`/website/${this.props.match.params.websiteId}/venues`, {
        context: this,
        state: 'venues'
    });

    this.venueRef = base.syncState(`/website/${this.props.match.params.websiteId}/tracks`, {
      context: this,
      state: 'tracks'
    });

    this.venueRef = base.syncState(`/website/${this.props.match.params.websiteId}/songs`, {
      context: this,
      state: 'songs'
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  getArtistData(artist_id) {
    let artist = {};
    const {artists = {}}= this.state;
  
    Object.keys(artists).map(art_id => {
      if (art_id == artist_id) {
        artist = artists[artist_id]
      }
    })
  
    return artist;
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

  getTracksForCurrentGig(gig_id) {
    const {tracks = {}} = this.state;
    let all_tracks = [];
    Object.values(tracks).map((track) => {
        if (track['trackGig']== gig_id) {
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
                const song_name = songs[track['trackSong']]['songName'];
                return <li key={index}>{song_name} : Filename: {track['trackFilename']}</li>
              })
            }
            </ul>
        </div>
      );
    }
  }

render() {
  const gigFilename = this.props.match.params.gigFilename;

  console.log (this.state)

  const gigs = this.state.gigs;
  
  let required_gig_id = '';
  let required_gig = {};
  Object.keys(gigs).forEach((gig_id) => {
    if (gigFilename == gigs[gig_id]['gigFilename']) {
      required_gig = gigs[gig_id];
      required_gig_id = gig_id;
    }
  })

    console.log (required_gig)
    
    if (required_gig) {
      const { gigWebsite = '', gigFilename ='', gigDate = '', gigName = '', gigType = '', gigArtist = '', gigVenue = '' } = required_gig;
      const artist = this.getArtistData(gigArtist);
      const venue = this.getVenueData(gigVenue);
      const {artistName = '', artistType = ''} = artist
      const all_tracks = this.getTracksForCurrentGig(required_gig_id);
      console.log (all_tracks)

      return (

        <div className="tourgigs">
            <div className="header">
                <Header websiteId={this.props.match.params.websiteId}/>
            </div>

            <div>
                <h1>Gig Page</h1>
                <h2>Website: {required_gig['gigWebsite']}</h2>
                <h2>Filename: {required_gig['gigFilename']}</h2>
                <h2>Date: {required_gig['gigDate']}</h2>
                <h2>Name (Identifyer): {required_gig['gigName']}</h2>
                <h2>Type: {required_gig['gigType']}</h2>
                <h2>ArtistID: {required_gig['gigArtist']}</h2>
                <h2>ArtistName: {artistName}</h2>
                <h2>Venue: {required_gig['gigVenue']}</h2>
                {this.renderTracks(all_tracks)}

            </div>
        </div>

      );
    }
    return 'Loading...';
    
  }
};

export default GigPage;