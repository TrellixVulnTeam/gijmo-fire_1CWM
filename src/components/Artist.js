import React from 'react';

class Artist extends React.Component {
  render() {
    const details = this.props.details;
    return (
      <li className="artistComponent-artist">
        {details.artistName}
      </li>
    )
  }
}

export default Artist;
