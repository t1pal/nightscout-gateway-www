T1Pal Example
===


This is based on @primaryobject's excellent [Node.js Bootstrap Starter Template](https://github.com/primaryobjects/Node.js-Bootstrap-Starter-Template).

This uses the oauth2 protocol to authenticate a T1Pal user.  Connecting through T1Pal enables authenticated client applications to access the resources of an authenticated T1Pall user.

The following endpoints are demonstrated:

### Welcome
The welcome/home page implements a "hello world" workflow.

### Authenticate
Visiting `/auth/connect` with start the oauth2 workflow with T1Pal.

### Dashboard
Visiting `/dashboard` Requires signing in through T1Pal.  The
authenticated information is used to request information about the user
and the sites associated with their account.  The following API endpoints
are used:
* `/api/v1/own/account/sites.json` - The `sites` property includes a list
  of all the Nightscout sites owned by this user's primary account.

The page will offer a list links to inspect the details of each available site.

### Details
Visiting `/details/:site_name` will show basic information about the user's
Nightscout site, as well a list of public links.
The following T1Pal API endpoints are used:
* `/api/v1/own/account/sites/:site_name'` The parameter `site_name` will
  give basic information about a site.  By default, every user's account
  is associated with a new site called `my` when subscribing to the
  service.
* `/api/v1/own/account/sites/:site_name/views'` - Get list of views usable for this site.


## Usage
- Clone repository.
- Request OAUTH2 API Client from support@t1pal.com.
- Open a command prompt, navigate to the folder, and enter: npm install
- Next, run the app by entering: node app
- Browse to http://localhost:3000

## Demo:
Coming soon.



