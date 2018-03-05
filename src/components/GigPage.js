import React from 'react';
import base from '../base';
import Gigs from './Gigs';
import Header from './Header';


class GigPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gigs: {}
    }
  }

  componentWillMount() {
    this.ref = base.syncState(`/website/${this.props.match.params.websiteId}/gigs`, {
      context: this,
      state: `gigs`
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }
  
render() {
  const gigFilename = this.props.match.params.gigFilename;
  console.log (this.state)

  const gigs = this.state.gigs;
  console.log(Object.values(gigs))

    const required_gig = Object.values(gigs).find((gig) => {
      return gig['gigFilename'] == gigFilename
    })
    console.log (required_gig)
    
    if (required_gig) {
      return (
        <div className="tourgigs">
            <div className="header">
                <Header websiteId={this.props.match.params.websiteId}/>
            </div>

            <div>
                <h1>Gig Page</h1>
                <h2>Website: {required_gig['gigWebsite']}</h2>
                <h2>Filename: {required_gig['gigFilename']}</h2>
                <h2>Date: {required_gig['gigDate']}</h2>
                <h2>Name (Identifyer): {required_gig['gigName']}</h2>
                <h2>Type: {required_gig['gigType']}</h2>
                <h2>Artist: {required_gig['gigArtist']}</h2>
                <h2>Venue: {required_gig['gigVenue']}</h2>




            </div>
        </div>

      );
    }
    return 'Loading...';
    
  }
};

export default GigPage;