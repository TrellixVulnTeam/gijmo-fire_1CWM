import React from 'react';
import { slugify } from '../helper';


class AddVenueForm extends React.Component {

  createVenue(event) {
    event.preventDefault();
    console.log('Entering Venue');
    const venue = {
      venueName: this.venueName.value,
      venueType: this.venueType.value,
      venueFilename: slugify(this.venueName.value+"_"+this.venueCity.value),
      venueWebsite: this.props.params.websiteId,
      venueCity: this.venueCity.value,
      venueState: this.venueState.value,
      venueCityState: this.venueCity.value+", "+this.venueState.value,


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
            <option value="theatre">Theatre</option>
            <option value="stadium">Stadium</option>
            <option value="amphitheatre">Amphitheatre</option>
            <option value="store">Store</option>
        </select>
        <input ref={(input) => this.venueCity = input} type="text" placeholder="Venue City" />
        <input ref={(input) => this.venueState = input} type="text" placeholder="Venue State" />

        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default AddVenueForm;
