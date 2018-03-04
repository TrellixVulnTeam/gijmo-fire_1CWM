import React from 'react';
import { slugify } from '../helper';


class AddTrackForm extends React.Component {

  createTrack(event) {
    event.preventDefault();
    console.log('Entering Track');

    const track = {
      trackName: this.trackName.value,
      trackFilename: slugify(this.trackName.value),
      trackWebsite: this.props.params.websiteId,
      trackGig: this.gig.value,


    }
    console.log(track)
    this.props.addTrack(track);
    this.trackForm.reset();
  }
  render() {
    return (
      <form ref={(input) => this.trackForm = input} className="track-edit" onSubmit={(e) => this.createTrack(e)}>
        <input ref={(input) => this.trackName = input} type="text" placeholder="Track Name" />
        <select ref={(input) => this.gig = input}>
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

        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default AddTrackForm;
