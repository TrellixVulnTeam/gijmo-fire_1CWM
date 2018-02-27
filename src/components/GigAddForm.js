import React from 'react';
import { slugify } from '../helper';



class GigAddForm extends React.Component {

  createGig(event) {
    event.preventDefault();
    console.log('Entering Gig');
    const gig = {
      gigName: this.gigName.value,
      gigDate: this.gigDate.value,
      gigType: this.gigType.value,
      gigFilename: slugify(this.gigName.value+"_"+this.gigType.value),
      gigWebsite: this.props.params.websiteId,
      gigArtistName: this.artistName.value,
      gigVenue: this.gigVenue.value

    }
    console.log(gig)
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
        <select ref={(input) => this.artistName = input}>
          {Object.keys(this.props.artists).map((key) => {
            return (
              <option
              key={key}
              value={this.props.artists[key].artistName}>
              {this.props.artists[key].artistName}
              </option>
            )
          })}
        </select>
        <select ref={(input) => this.gigVenue = input}>
          <option value="redRocks">Red Rocks</option>
          <option value="theFox">The Fox</option>
          <option value="theBeacon">The Beacon</option>
          <option value="Stubbs">Stubbs</option>
        </select>



        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default GigAddForm;
