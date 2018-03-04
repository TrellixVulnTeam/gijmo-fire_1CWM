import React from 'react';
import Header from './Header';
import Songs from './Songs';
import Song from './Song';
import base from '../base';

class SongApp extends React.Component {

  constructor() {
    super();
    this.addSong = this.addSong.bind(this);
    this.updateSong = this.updateSong.bind(this);
    this.removeSong = this.removeSong.bind(this);
    this.state = {
      songs: {},
    };
  }

  componentWillMount() {
    this.ref = base.syncState(`/website/${this.props.match.params.websiteId}/songs`, {
      context: this,
      state: `songs`
    });

  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  addSong(song) {
    //get a copy of the state
    const songs = {...this.state.songs};
    //add in our new songs
    const timestamp = Date.now();
    songs[`song-${timestamp}`]= song;
    //set state
    this.setState({ songs: songs })
  }

  updateSong(key, updatedSong) {
    const songs = {...this.state.songs};
    songs[key] = updatedSong;
    this.setState({ songs }, () => {
    });
  }

  removeSong(key) {
    const songs = {...this.state.songs};
    songs[key] = null;
    this.setState({ songs });
  }

  render() {
    return (
      <div className="tourgigs">
        <div className="header">
          <Header websiteId={this.props.match.params.websiteId}/>
        </div>
        <h3>Songs</h3>

        <ul className="list-of-songs">
          {
            Object
              .keys(this.state.songs)
              .map(key => <Song key={key} details={this.state.songs[key]} params={this.props.match.params} />)
          }
        </ul>
        <h3>Name | Filename</h3>

        <Songs
          addSong={this.addSong}
          params={this.props.match.params}
          songs={this.state.songs}
          updateSong={this.updateSong}
          removeSong={this.removeSong}
        />

      </div>
    )
  }
}

export default SongApp;
