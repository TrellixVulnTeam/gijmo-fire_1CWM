import React from 'react';
import { slugify } from '../helper';


class AddArtistForm extends React.Component {
  
  createArtist(event) {
    event.preventDefault();
    console.log('Entering Artist');
    const artist = {
      artistName: this.artistName.value,
      artistType: this.artistType.value,
      artistFilename: slugify(this.artistName.value+"_"+this.artistType.value),
      artistWebsite: this.props.params.websiteId,
    }
    console.log(artist)
    this.props.addArtist(artist);
    this.artistForm.reset();
  }
  render() {
    return (
      <form ref={(input) => this.artistForm = input} className="artist-edit" onSubmit={(e) => this.createArtist(e)}>
        <input ref={(input) => this.artistName = input} type="text" placeholder="Artist Name" />
        <select ref={(input) => this.artistType = input}>
          <option value="artist">Artist</option>
          <option value="brand">Brand</option>
          <option value="person">Person</option>
          <option value="employee">Employee</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default AddArtistForm;
