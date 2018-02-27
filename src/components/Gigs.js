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
    var arr = [];
    const artists = this.props.artists;
    Object.keys(artists).forEach((key, idx) => {
      arr.push(artists[key].artistName)
    });
  }


  renderGigs(key) {
    const gig = this.props.gigs[key];
    return (
      <div className="gig-edit" key={key}>
        <input type="text" name="gigName" value={gig.gigName} placeholder="Gig Name" onChange={(e) => this.handleChange(e, key)}/>
        <select type="text" name="gigType" value={gig.gigType} placeholder="Gig Type" onChange={(e) => this.handleChange(e, key)}>
          <option value="gig">Gig</option>
          <option value="brand">Brand</option>
          <option value="person">Person</option>
          <option value="employee">Employee</option>
        </select>
        <select type="text" name="artistName" value={gig.artistName} placeholder="Artist Name" onChange={(e) => this.handleChange(e, key)}>
    {/*<select ref={(input) => this.artistName = input}>*/}
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
