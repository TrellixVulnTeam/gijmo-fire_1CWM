import React from 'react';

const Header = (props) => {
  return (
    <header className="top">
      <h3 className="tagline">Website: {props.websiteId}</h3>
      <h3>Collections: <a href={'/website/' + props.websiteId + '/artists'}>Artists</a>  <a href={'/website/' + props.websiteId + '/gigs'}>Gigs</a> <a href={'/website/' + props.websiteId + '/venues'}>Venues</a> <a href={'/website/' + props.websiteId + '/tracks'}>Tracks</a> <a href={'/website/' + props.websiteId + '/songs'}>Songs</a></h3>
      <h3>Website: <a href={'/website/' + props.websiteId + '/pages'}>Pages</a>  <a href={'/website/' + props.websiteId + '/sections'}>Sections</a> <a href={'/website/' + props.websiteId + '/sections_type'}>Section Type</a></h3>

    </header>
  )
}
export default Header;
