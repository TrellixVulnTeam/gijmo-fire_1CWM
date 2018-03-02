import React from 'react';
import $ from 'jquery';
import Header from './Header';
import Artists from './Artists';
import Artist from './Artist';
import base from '../base';
import { slugify } from '../helper';

class ArtistApp extends React.Component {

  constructor() {
    super();
    this.addArtist = this.addArtist.bind(this);
    this.updateArtist = this.updateArtist.bind(this);
    this.removeArtist = this.removeArtist.bind(this);
    this.ifArtistNameChanged = this.ifArtistNameChanged.bind(this);
    this.updateGigsOnArtistNameChange = this.updateGigsOnArtistNameChange.bind(this);
    // get initial state
    this.state = {
      artists: {},
    };
  }

  componentWillMount() {
    this.ref = base.syncState(`/website/${this.props.match.params.websiteId}/artists`, {
      context: this,
      state: `artists`
    });
    this.gigsRef = base.syncState(`/website/${this.props.match.params.websiteId}/gigs`, {
      context: this,
      state: `gigs`
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  addArtist(artist) {
    //get a copy of the state
    const artists = {...this.state.artists};
    //add in our new artists
    const timestamp = Date.now();
    artists[`artist-${timestamp}`]= artist;
    //set state
    this.setState({ artists: artists })
  }
  ifArtistNameChanged(key, old_state, updateArtist) {
    return (old_state[key].artistName != updateArtist.artistName);
  }
  updateGigsOnArtistNameChange(key, old_state, updateArtist) {
    if (this.ifArtistNameChanged(key, old_state, updateArtist)) {
      const updated_gigs = {};
      const { gigs = {} } = this.state;

      Object.keys(gigs).map(gig_key => {
        const old_gig = gigs[gig_key];
        if (old_gig.gigArtist == key) {
          updated_gigs[gig_key] = {
            ...old_gig,
            gigFilename: old_gig.gigDate + '_' + slugify(updateArtist.artistName) + '_' + slugify(old_gig.gigName)
          }
        } else {
          updated_gigs[gig_key] = gigs[gig_key]
        }
      })
      this.setState({ gigs: updated_gigs });
    }
  }
  updateArtist(key, updatedArtist) {
    const artists = {...this.state.artists};
    artists[key] = updatedArtist;
    const old_state = this.state.artists;
    this.setState({ artists }, () => {
      this.updateGigsOnArtistNameChange(key, old_state, updatedArtist);
    });
  }

  removeArtist(key) {
    const artists = {...this.state.artists};
    artists[key] = null;
    this.setState({ artists });
  }

  render() {
    return (
      <div className="tourgigs">
        <div className="header">
          <Header websiteId={this.props.match.params.websiteId}/>
        </div>
        <ul className="list-of-artists">
          {
            Object
              .keys(this.state.artists)
              .map(key => <Artist key={key} details={this.state.artists[key]} params={this.props.match.params} />)
          }
        </ul>
        <h3>Artists</h3>
        <h3>Name | Type | Filename</h3>

        <Artists
          addArtist={this.addArtist}
          params={this.props.match.params}
          artists={this.state.artists}
          updateArtist={this.updateArtist}
          removeArtist={this.removeArtist}
        />

      </div>
    )
  }
}

export default ArtistApp;
