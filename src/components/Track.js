import React from 'react';

class Track extends React.Component {
  render() {
    const details = this.props.details;
    return (
      <li className="trackComponent-track">
        {details.trackName}
      </li>
    )
  }
}

export default Track;
