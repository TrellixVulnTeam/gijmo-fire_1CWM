import React from 'react';
import { slugify } from '../helper';


class GigAddForm extends React.Component {

  createGig(event) {
    event.preventDefault();
    console.log('Entering Gig');
    const artistName = this.props.artists[this.artist.value].artistName;
    const gig = {
      gigName: this.gigName.value,
      gigDate: this.gigDate.value,
      gigType: this.gigType.value,
      gigFilename: this.gigDate.value + "_" + slugify(artistName),
      gigWebsite: this.props.params.websiteId,
      gigArtist: this.artist.value,
      gigVenue: this.venue.value,
    }
    this.props.addGig(gig);
    this.gigForm.reset();
  }

  render() {
    return (
      <form ref={(input) => this.gigForm = input} className="gig-edit" onSubmit={(e) => this.createGig(e)}>
        <input ref={(input) => this.gigName = input} type="text" placeholder="Gig Name" />
        <input ref={(input) => this.gigDate = input} type="text" placeholder="Gig Date" />

        <select ref={(input) => this.gigType = input}>
          <option value="concert">Concert</option>
          <option value="conference">Conference</option>
          <option value="corporate">Corportate</option>
          <option value="productLaunch">Product Launch</option>
        </select>
        <select ref={(input) => this.artist = input}>
          {Object.keys(this.props.artists).map((key) => {
            return (
              <option
              key={key}
              value={key}>
              {this.props.artists[key].artistName}
              </option>
            )
          })}
        </select>
        <select ref={(input) => this.venue = input}>
          {Object.keys(this.props.venues).map((key) => {
            return (
              <option
              key={key}
              value={key}>
              {this.props.venues[key].venueName}
              </option>
            )
          })}
        </select>



        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default GigAddForm;
