import React from 'react';
import { slugify } from '../helper';


class AddVenueForm extends React.Component {

  createVenue(event) {
    event.preventDefault();
    console.log('Entering Venue');
    const venue = {
      venueName: this.venueName.value,
      venueType: this.venueType.value,
      venueFilename: slugify(this.venueName.value),
      venueWebsite: this.props.params.websiteId,
    }
    console.log(venue)
    this.props.addVenue(venue);
    this.venueForm.reset();
  }
  render() {
    return (
      <form ref={(input) => this.venueForm = input} className="venue-edit" onSubmit={(e) => this.createVenue(e)}>
        <input ref={(input) => this.venueName = input} type="text" placeholder="Venue Name" />
        <select ref={(input) => this.venueType = input}>
            <option value="venue">Theatre</option>
          <option value="brand">Stadium</option>
          <option value="person">Amphitheatre</option>
          <option value="employee">Store</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default AddVenueForm;
