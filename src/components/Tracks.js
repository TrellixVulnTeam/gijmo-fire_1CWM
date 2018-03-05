import React from 'react';
import AddTrackForm from './TrackAddForm';
import { slugify } from '../helper';

class Tracks extends React.Component {
  constructor() {
    super();
    this.renderTracks = this.renderTracks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.gigArray = [];
    this.songArray = [];
  }

  handleChange(e, key) {
    const name = e.target.name;
    const value = e.target.value;
    const track = this.props.tracks[key];
    let trackGigFilename = (this.props.gigs[track.trackGig] ? this.props.gigs[track.trackGig].gigFilename : '');
    let trackSongFilename = (this.props.songs[track.trackSong] ? this.props.songs[track.trackSong].songFilename : '');
    
    const fileNameObject = {}
    if (name == 'trackGig') {
      trackGigFilename = this.props.gigs[value].gigFilename;
      fileNameObject['trackFilename'] = trackGigFilename+ "_" + track.trackOrder +"_" + trackSongFilename;
    }

    if (name == 'trackOrder') {
      fileNameObject['trackFilename'] = trackGigFilename+ "_" + value +"_" + trackSongFilename;
    }

    if (name == 'trackSong') {
      trackSongFilename = this.props.songs[value].songFilename;
      fileNameObject['trackFilename'] = trackGigFilename+ "_" + track.trackOrder +"_" + trackSongFilename;
    }


    this.setState({text: value,}, () => {
      const track = this.props.tracks[key];
      const updatedTrack = {
        ...track,
        ...fileNameObject,
        [name]: value
      }
      this.props.updateTrack(key, updatedTrack);
    });
  }

  getGigsArray() {
    var arr = [];
    const gigs = this.props.gigs;
    Object.keys(gigs).forEach((key, idx) => {
      arr.push(gigs[key].gigFilename)
    });
  }

  getSongsArray() {
    var arr = [];
    const songs = this.props.songs;
    Object.keys(songs).forEach((key, idx) => {
      arr.push(songs[key].songFilename)
    });
  }

  renderTracks(key) {

    const track = this.props.tracks[key];
    return (
      <div className="track-edit" key={key} data-key={key}>
        <input type="text" name="trackName" value={track.trackName} placeholder="Track Name" onChange={(e) => this.handleChange(e, key)}/>
        
        <select type="text" name="trackGig" value={track.trackGig} placeholder="Gig" onChange={(e) => this.handleChange(e, key)}>
          {Object.keys(this.props.gigs).map((key) => {
            return (
              <option
              key={key}
              value={key}>
              {this.props.gigs[key].gigFilename}
              </option>
            )
          })}
        </select>

        <input type="text" name="trackOrder" value={track.trackOrder} placeholder="Track Order" onChange={(e) => this.handleChange(e, key)}/>


        <select type="text" name="trackSong" value={track.trackSong} placeholder="Song" onChange={(e) => this.handleChange(e, key)}>
          {Object.keys(this.props.songs).map((key) => {
            return (
              <option
              key={key}
              value={key}>
              {this.props.songs[key].songFilename}
              </option>
            )
          })}
        </select>
        
        
        <input type="text" name="trackFilename" value={track.trackFilename} placeholder="Track Filename" readOnly/>
        <button onClick={() => this.props.removeTrack(key)}>Remove Track</button>
      </div>
    )
  }

  render() {
    return (
      <div>
      {Object.keys(this.props.tracks).map(this.renderTracks)}
      <AddTrackForm 
        addTrack={this.props.addTrack}
        gigs={this.props.gigs}
        songs={this.props.songs}
        params={this.props.params} />
      </div>
    )
  }
}

export default Tracks;
