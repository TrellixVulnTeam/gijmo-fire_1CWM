import React from 'react';
import Artists from './Artists';

const Header = (props) => {
  return (
    <header className="top">
      <h3 className="tagline">Website: {props.websiteId}</h3>
      <h3>Collections: <a href={'/website/' + props.websiteId + '/artists'}>Artists</a>  <a href={'/website/' + props.websiteId + '/artists'}>Events</a></h3>
    </header>
  )
}
export default Header;
