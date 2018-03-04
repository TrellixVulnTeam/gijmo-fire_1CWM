import React from 'react';
import AddTrackForm from './TrackAddForm';
import { slugify } from '../helper';

class Tracks extends React.Component {

  constructor() {
    super();
    this.renderTracks = this.renderTracks.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, key) {
    const name = e.target.name;
    const value = e.target.value;
    const track = this.props.tracks[key];

    const fileNameObject = {}
    if (name == 'trackName') {
      fileNameObject['trackFilename'] = slugify(value);
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

  renderTracks(key) {

    const track = this.props.tracks[key];
    return (
      <div className="track-edit" key={key} data-key={key}>
        <input type="text" name="trackName" value={track.trackName} placeholder="Track Name" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="trackFilename" value={track.trackFilename} placeholder="Track Filename" readOnly/>
        <button onClick={() => this.props.removeTrack(key)}>Remove Track</button>
      </div>
    )
  }

  render() {
    return (
      <div>
      {Object.keys(this.props.tracks).map(this.renderTracks)}
      <AddTrackForm addTrack={this.props.addTrack} params={this.props.params} />
      </div>
    )
  }
}

export default Tracks;
