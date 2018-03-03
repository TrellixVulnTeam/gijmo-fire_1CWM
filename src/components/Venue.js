import React from 'react';

class Venue extends React.Component {
  render() {
    const details = this.props.details;
    return (
      <li className="venueComponent-venue">
        {details.venueName}
      </li>
    )
  }
}

export default Venue;
