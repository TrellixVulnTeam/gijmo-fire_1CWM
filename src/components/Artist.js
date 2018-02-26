import React from 'react';

class Artist extends React.Component {
  render() {
    const details = this.props.details;
    return (
      <li className="artistComponent-artist">
        {details.artistName}
        {details.artistType}
        {details.artistHometown}
        {details.artistFilename}
      </li>
    )
  }
}

export default Artist;
