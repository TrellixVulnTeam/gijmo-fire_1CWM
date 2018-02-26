import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import App2 from './components/App2';
import ArtistApp from './components/ArtistApp';


import WebsiteCreator from './components/WebsiteCreator';

import NotFound from './components/NotFound';

const Root = () => {
  return (
    <BrowserRouter>
      <div>
          <Switch>
            <Route exact path="/" component={WebsiteCreator} />
            <Route exact path="/website/:websiteId/" component={App2} />
            <Route exact path="/website/:websiteId/artists"  component={ArtistApp} />



            <Route component={NotFound} />
          </Switch>
      </div>
    </BrowserRouter>
  )
}

render(<Root/>, document.getElementById('main'));
