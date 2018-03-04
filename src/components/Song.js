import React from 'react';

class Song extends React.Component {
  render() {
    const details = this.props.details;
    return (
      <li className="songComponent-song">
        {details.songName}
      </li>
    )
  }
}

export default Song;
