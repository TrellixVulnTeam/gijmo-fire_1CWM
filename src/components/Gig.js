import React from 'react';

class Gig extends React.Component {
  render() {
    const details = this.props.details;
    return (
      <li className="gigComponent-gig">
        {details.gigFilename}
      </li>
    )
  }
}

export default Gig;
