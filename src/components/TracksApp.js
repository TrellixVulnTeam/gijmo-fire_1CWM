import React from 'react';
import Header from './Header';
import Tracks from './Tracks';
import Track from './Track';
import base from '../base';

class TrackApp extends React.Component {

  constructor() {
    super();
    this.addTrack = this.addTrack.bind(this);
    this.updateTrack = this.updateTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.state = {
      tracks: {},
    };
  }

  componentWillMount() {
    this.ref = base.syncState(`/website/${this.props.match.params.websiteId}/tracks`, {
      context: this,
      state: `tracks`
    });
    this.gigsRef = base.syncState(`/website/${this.props.match.params.websiteId}/gigs`, {
      context: this,
      state: `gigs`
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  addTrack(song) {
    //get a copy of the state
    const tracks = {...this.state.tracks};
    //add in our new tracks
    const timestamp = Date.now();
    tracks[`song-${timestamp}`]= song;
    //set state
    this.setState({ tracks: tracks })
  }

  updateTrack(key, updatedTrack) {
    const tracks = {...this.state.tracks};
    tracks[key] = updatedTrack;
    this.setState({ tracks }, () => {
    });
  }

  removeTrack(key) {
    const tracks = {...this.state.tracks};
    tracks[key] = null;
    this.setState({ tracks });
  }

  render() {
    return (
      <div className="tourgigs">
        <div className="header">
          <Header websiteId={this.props.match.params.websiteId}/>
        </div>
        <h3>Tracks</h3>

        <ul className="list-of-tracks">
          {
            Object
              .keys(this.state.tracks)
              .map(key => <Track key={key} details={this.state.tracks[key]} params={this.props.match.params} />)
          }
        </ul>
        <h3>Name | Filename</h3>

        <Tracks
          addTrack={this.addTrack}
          params={this.props.match.params}
          tracks={this.state.tracks}
          updateTrack={this.updateTrack}
          removeTrack={this.removeTrack}
        />

      </div>
    )
  }
}

export default TrackApp;
