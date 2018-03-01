import React from 'react';
import AddArtistForm from './ArtistAddForm';
import { slugify } from '../helper';
import $ from 'jquery';
import base from '../base';



class Artists extends React.Component {
  constructor() {
    super();
    this.renderArtists = this.renderArtists.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, key) {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
        text: value,
      }, () => {

        const artist = this.props.artists[key];
        // take a copy of the artist and update it with the new data
        const updatedArtist = {
          ...artist,
          //name is not artistName. it is its own value
          [name]: value,
          artistFilename: slugify(value)

        }
    this.props.updateArtist(key, updatedArtist);


      console.log("This is working in state", this.state.text);
      console.log("filename", artist.artistFilename);
      }
    );

    
  }


  
  renderArtists(key) {
	
    const artist = this.props.artists[key];
    return (
      <div className="artist-edit" key={key} data-key={key}>
        <input type="text" name="artistName" value={artist.artistName} placeholder="Artist Name" onChange={(e) => this.handleChange(e, key)}/>
        <select type="text" name="artistType" value={artist.artistType} placeholder="Artist Type" onChange={(e) => this.handleChange(e, key)}>
          <option value="artist">Artist</option>
          <option value="brand">Brand</option>
          <option value="person">Person</option>
          <option value="employee">Employee</option>
        </select>
        <input type="text" name="artistFilename" value={artist.artistFilename} placeholder="Artist Filename" readOnly/>

        <button onClick={() => this.props.removeArtist(key)}>Remove Artist</button>
      </div>
    )
  }

  render() {
    return (
      <div>
      {Object.keys(this.props.artists).map(this.renderArtists)}
      <AddArtistForm addArtist={this.props.addArtist} params={this.props.params} />
      </div>

    )
  }
}

export default Artists;
