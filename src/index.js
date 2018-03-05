import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './components/App';
import ArtistApp from './components/ArtistApp';
import GigRouteController from './components/GigRouteController';
import VenuesApp from './components/VenuesApp';
import SongsApp from './components/SongsApp';
import TracksApp from './components/TracksApp';

import WebsiteCreator from './components/WebsiteCreator';

import NotFound from './components/NotFound';

const Root = () => {
  return (
    <BrowserRouter>
      <div>
          <Switch>
            <Route exact path="/" component={WebsiteCreator} />
            <Route exact path="/website/:websiteId/" component={App} />
            <Route exact path="/website/:websiteId/artists"  component={ArtistApp} />
            <Route path="/website/:websiteId/gigs"  component={GigRouteController} />
            <Route exact path="/website/:websiteId/venues"  component={VenuesApp} />
            <Route exact path="/website/:websiteId/tracks"  component={TracksApp} />
            <Route exact path="/website/:websiteId/songs"  component={SongsApp} />


            <Route component={NotFound} />
          </Switch>
      </div>
    </BrowserRouter>
  )
}

render(<Root/>, document.getElementById('main'));
