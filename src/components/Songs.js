import React from 'react';
import AddSongForm from './SongAddForm';
import { slugify } from '../helper';

class Songs extends React.Component {

  constructor() {
    super();
    this.renderSongs = this.renderSongs.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, key) {
    const name = e.target.name;
    const value = e.target.value;
    const song = this.props.songs[key];

    const fileNameObject = {}
    if (name == 'songName') {
      fileNameObject['songFilename'] = slugify(value);
    }


    this.setState({text: value,}, () => {
      const song = this.props.songs[key];
      const updatedSong = {
        ...song,
        ...fileNameObject,
        [name]: value
      }
      this.props.updateSong(key, updatedSong);
    });
  }

  renderSongs(key) {

    const song = this.props.songs[key];
    return (
      <div className="song-edit" key={key} data-key={key}>
        <input type="text" name="songName" value={song.songName} placeholder="Song Name" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="songFilename" value={song.songFilename} placeholder="Song Filename" readOnly/>
        <button onClick={() => this.props.removeSong(key)}>Remove Song</button>
      </div>
    )
  }

  render() {
    return (
      <div>
      {Object.keys(this.props.songs).map(this.renderSongs)}
      <AddSongForm addSong={this.props.addSong} params={this.props.params} />
      </div>
    )
  }
}

export default Songs;
