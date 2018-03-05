import React from 'react';
import { Link } from 'react-router-dom';

class Gig extends React.Component {
  render() {
    const details = this.props.details;
    return (
      <li className="gigComponent-gig">
        <Link to={`/website/${this.props.params.websiteId}/gigs/${details.gigFilename}`}> {details.gigFilename} </Link>
        | Date: {details.gigDate}
        | Type: {details.gigType}
        | Artist: {details.gigArtist}
        | Venue: {details.gigVenue}
        | Name: {details.gigName}
      </li>
    )
  }
}

export default Gig;