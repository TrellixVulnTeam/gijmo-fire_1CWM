import React from 'react';
import GigAddForm from './GigAddForm'
import Artists from './Artists';


class Gigs extends React.Component {
  constructor() {
    super();
    this.renderGigs = this.renderGigs.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.artistArray = [];
  }

  handleChange(e, key) {
    const gig = this.props.gigs[key];
    // take a copy of the gig and update it with the new data
    const updatedGig = {
      ...gig,
      //name is not gigName. it is its own value
      [e.target.name]: e.target.value
    }
    this.props.updateGig(key, updatedGig);
  }

  getArtistsArray() {
    //we also need to get the artistId or key?
    var arr = [];
    const artists = this.props.artists;
    Object.keys(artists).forEach((key, idx) => {
      arr.push(artists[key].artistName)
    });
  }


  renderGigs(key) {
    const gig = this.props.gigs[key];
    const gigArtistType = (this.props.artists[gig.gigArtist] ? this.props.artists[gig.gigArtist].artistType : '');

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
    {/*<select ref={(input) => this.artistName = input}>*/}
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
        <select type="text" name="gigVenue" value={gig.gigVenue} placeholder="Gig Venue" onChange={(e) => this.handleChange(e, key)}>
          <option value="redRocks">Red Rocks</option>
          <option value="theFox">The Fox</option>
          <option value="theBeacon">The Beacon</option>
          <option value="Stubbs">Stubbs</option>
        </select>
        <input type="text" name="gigContactType" value={gigArtistType} placeholder="Artist Type" readOnly/>

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
          artists={this.props.artists} />
      </div>

    )
  }
}

export default Gigs;
