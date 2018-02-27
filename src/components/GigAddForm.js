import React from 'react';
import { slugify } from '../helper';


class GigAddForm extends React.Component {
  createGig(event) {
    event.preventDefault();
    console.log('Entering Gig');
    const gig = {
      gigName: this.gigName.value,
      gigType: this.gigType.value,
      gigFilename: slugify(this.gigName.value+"_"+this.gigType.value),
      gigWebsite: this.props.params.websiteId,
    }
    console.log(gig)
    this.props.addGig(gig);
    this.gigForm.reset();
  }
  
  render() {
    return (
      <form ref={(input) => this.gigForm = input} className="gig-edit" onSubmit={(e) => this.createGig(e)}>
        <input ref={(input) => this.gigName = input} type="text" placeholder="Gig Name" />
        <select ref={(input) => this.gigType = input}>
          <option value="gig">Gig</option>
          <option value="brand">Brand</option>
          <option value="person">Person</option>
          <option value="employee">Employee</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default GigAddForm;
