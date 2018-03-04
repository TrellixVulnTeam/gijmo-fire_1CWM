import React from 'react';
import { slugify } from '../helper';


class AddTrackForm extends React.Component {

  createTrack(event) {
    event.preventDefault();
    console.log('Entering Track');
    const track = {
      trackName: this.trackName.value,
      trackFilename: slugify(this.trackName.value),
      trackWebsite: this.props.params.websiteId

    }
    console.log(track)
    this.props.addTrack(track);
    this.trackForm.reset();
  }
  render() {
    return (
      <form ref={(input) => this.trackForm = input} className="track-edit" onSubmit={(e) => this.createTrack(e)}>
        <input ref={(input) => this.trackName = input} type="text" placeholder="Track Name" />
        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default AddTrackForm;
