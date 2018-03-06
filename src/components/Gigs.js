import React from 'react';
import GigAddForm from './GigAddForm'
import { slugify } from '../helper';

class Gigs extends React.Component {
  constructor() {
    super();
    this.renderGigs = this.renderGigs.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.artistArray = [];
    this.venueArray = [];

  }

  handleChange(e, key) {
    //name is not artistName. it is its own value
    const name = e.target.name;
    const value = e.target.value;
    const gig = this.props.gigs[key];
    let gigArtistName = (this.props.artists[gig.gigArtist] ? this.props.artists[gig.gigArtist].artistName : '');
    const fileNameObject = {}

    if (name == 'gigArtist') {
      gigArtistName = this.props.artists[value].artistName;
      fileNameObject['gigFilename'] = gig.gigDate+"_"+slugify(gigArtistName);
    }

    if (name == 'gigDate') {
      fileNameObject['gigFilename'] = value+"_"+slugify(gigArtistName);
    };

    this.setState({text: value,}, () => {
      const gig = this.props.gigs[key];
      const updatedGig = {
        ...gig,
        ...fileNameObject,
        [name]: value
      }
      this.props.updateGig(key, updatedGig);
    });
  }

  getArtistsArray() {
    var arr = [];
    const artists = this.props.artists;
    Object.keys(artists).forEach((key, idx) => {
      arr.push(artists[key].artistName)
    });
  }
  
  getVenuesArray() {
    var arr = [];
    const venues = this.props.venues;
    Object.keys(venues).forEach((key, idx) => {
      arr.push(venues[key].venueName)
    });
  }

  renderGigs(key) {
    const gig = this.props.gigs[key];
    const gigArtistType = (this.props.artists[gig.gigArtist] ? this.props.artists[gig.gigArtist].artistType : '');
    const gigArtistName = (this.props.artists[gig.gigArtist] ? this.props.artists[gig.gigArtist].artistName : '');
    const gigVenueCityState = (this.props.venues[gig.gigVenue] ? this.props.venues[gig.gigVenue].venueCityState : '');

    return (
      <div className="gig-edit" key={key}>
        <input type="text" name="gigName" value={gig.gigName} placeholder="Gig Name" onChange={(e) => this.handleChange(e, key)}/>

        <input type="text" name="gigDate" value={gig.gigDate} placeholder="Gig Date" onChange={(e) => this.handleChange(e, key)}/>
        <select type="text" name="gigType" value={gig.gigType} placeholder="Gig Type" onChange={(e) => this.handleChange(e, key)}>
          <option value="concert">Concert</option>
          <option value="conference">Conference</option>
          <option value="corporate">Corportate</option>
          <option value="productLaunch">Product Launch</option>
        </select>
        <select type="text" name="gigArtist" value={gig.gigArtist} placeholder="Artist" onChange={(e) => this.handleChange(e, key)}>
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

        <select type="text" name="gigVenue" value={gig.gigVenue} placeholder="Venue" onChange={(e) => this.handleChange(e, key)}>
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
        <input type="text" name="gigDescription" value={gig.gigDescription} placeholder="Gig Description" onChange={(e) => this.handleChange(e, key)}/>


        <input type="text" name="gigFilename" value={gig.gigFilename} placeholder="Gig Filename" readOnly/>
        <input type="text" name="gigArtistType" value={gigArtistType} placeholder="Artist Type" readOnly/>
        <input type="text" name="gigArtistName" value={gigArtistName} placeholder="Artist Name" readOnly/>
        <input type="text" name="gigVenueCityState" value={gigVenueCityState} placeholder="Venue City State" readOnly/>

        <button onClick={() => this.props.removeGig(key)}>Remove Gig</button>
      </div>
    )
  }

  render() {
    return (
      <div>
        {Object.keys(this.props.gigs).map(this.renderGigs)}
        <GigAddForm
          addGig={this.props.addGig}
          params={this.props.params}
          artists={this.props.artists} 
          venues={this.props.venues} />
      </div>

    )
  }
}

export default Gigs;
