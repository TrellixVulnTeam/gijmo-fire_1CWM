import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import GigsApp from './GigsApp';
import GigPage from './GigPage';
import NotFound from './NotFound';

const GigRouteController = () => {

  return (
    <Switch>
      <Route exact path='/website/:websiteId/gigs' component={GigsApp} />
      <Route path='/website/:websiteId/gigs/:gigFilename' component={GigPage} />
    </Switch>
  );
};

export default GigRouteController;