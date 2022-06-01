
var _ = require ('lodash');
var axios = require('axios');
var express = require('express');

function create_client (opts) {
  var instance = axios.create({
    baseURL: opts.baseURL,
  });
  return instance;
}

function create (app, config) {

  var nrg = create_client({baseURL: config.gateway.api });

  var router = express.Router( );
  function configure (opts) {
    router.get('/', fetch_memberships, render_groups);
    router.get('/:group_id', fetch_details, render_details);
    router.post('/:group_id/actions/leave', leave_group, left_group);
    return router;
  }

  function fetch_memberships (req, res, next) {
    nrg.get('/api/v1/privy/' + req.user.identity.id + '/groups/available' ).then(function (results) {
      res.locals.groups = results.data;
      next( );

    }).catch(next);
  }

  function fetch_details (req, res, next) {
    nrg.get('/api/v1/privy/' + req.user.identity.id + '/groups/available/details/' + req.params.group_id).then(function (results) {
      res.locals.groups = results.data;
      next( );

    }).catch(next);
  }

  function leave_group (req, res, next) {
    nrg.delete('/api/v1/privy/' + req.user.identity.id + '/groups/joined/' + req.params.group_id).then(function (results) {
      res.locals.groups = results.data;
      next( );

    }).catch(next);
  }

  function left_group (req, res, next) {
    res.redirect('./..');
  }

  function render_groups (req, res, next) {
    res.render('groups/index');
  }

  function render_details (req, res, next) {
    res.render('groups/details');
  }

  var handlers = {
  };
  configure.handlers = handlers;
  return configure;
}

module.exports = exports = create;
