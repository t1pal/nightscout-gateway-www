
var express = require('express');
var _ = require ('lodash');
var axios = require('axios');
var url = require('url');
var path = require('path');
var crypto = require('crypto');

function create_client (opts) {
  var instance = axios.create({
    baseURL: opts.baseURL,
  });
  return instance;
}

function factory (app, config) {
  var nrg = create_client({baseURL: config.gateway.api });

  var router = express.Router( );
  router.get('/:expected_name', fetch_portal_info, render_portal);
  router.get('/:expected_name/*', render_portal);

  function fetch_portal_info (req, res, next) {
    nrg.get(`/warden/v1/portal/${req.user.identity.id}/backend/for/${req.params.expected_name}`).then(function (warden) {
      res.locals.portal = warden.data;
      next( );
      
    }).catch(function (err, resp) {
      console.log("ARGS", arguments);
      res.locals.portal = err.response.data;
      next( );
      

    });

  }

  function render_portal (req, res, next) {
    res.render('portal/index');
    res.end( );
  }


  function create (opts) {
    return router;
  }
  return create;
}

module.exports = exports = factory;
