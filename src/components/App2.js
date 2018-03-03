
import React from 'react';
import Header from './Header';
import Artists from './Artists';
import Artist from './Artist';
import Venues from './Venues';
import base from '../base';


class App extends React.Component {

  constructor() {
    super();
    this.addArtist = this.addArtist.bind(this);
    this.updateArtist = this.updateArtist.bind(this);
    this.addArtist = this.addArtist.bind(this);
    this.removeArtist = this.removeArtist.bind(this);


    // get initial state
    this.state = {
      artists: {},
      venues:{}
    };
  }

  componentWillMount() {
    this.ref = base.syncState(`${this.props.location.pathname}/artists`
    , {
      context: this,
      state: `artists`
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

  updateArtist(key, updatedArtist) {
    const artists = {...this.state.artists};
    artists[key] = updatedArtist;
    this.setState({ artists });
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
          <Header tagline={this.props.match.params.websiteId}/>
          <ul className="list-of-collections">
            <li><a href={'/website/' + this.props.match.params.websiteId + '/artists'}>Artists</a></li>
          </ul>
        </div>

      </div>
    )
  }
}

export default App;
