import React from 'react';
import { slugify } from '../helper';


class AddSongForm extends React.Component {

  createSong(event) {
    event.preventDefault();
    console.log('Entering Song');
    const song = {
      songName: this.songName.value,
      songFilename: slugify(this.songName.value),
      songWebsite: this.props.params.websiteId

    }
    console.log(song)
    this.props.addSong(song);
    this.songForm.reset();
  }
  render() {
    return (
      <form ref={(input) => this.songForm = input} className="song-edit" onSubmit={(e) => this.createSong(e)}>
        <input ref={(input) => this.songName = input} type="text" placeholder="Song Name" />
        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default AddSongForm;
