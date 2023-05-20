
function configure (app, config) {
  function set_links (req, res, next) {
    var links = {
      nav: {
        home: config.oauth.base_url,
        self: req.originalUrl,
        util: {
          login: '',
          logout: '',
          register: ''

        },
        header: {
          dashboard: '',
          groups: '',
          group_details: '',
          portal: '',
          view: '',

        }
      }
    };
    var anonymous_nav = {
      links: [
        { text: 'Home',
          href: '/dashboard'
        },
        { text: 'About',
          href: '/#About'
        },
        { text: 'Log in',
          href: '/auth/login'
        },
        { text: 'Sign up',
          href: '/auth/registration'
        }

      ]

    };
    var logged_in_nav = {
      links: [
        { text: 'Home',
          href: '/dashboard'
        },
        { text: 'Account',
          href: '/settings'
        },
        { text: 'Groups',
          href: '/groups'
        },
        // { text: 'Activity', href: '#/groups' },
        { text: 'Logout',
          href: '/auth/logout'
        }
      ]
    };
    links.logged_in = req.user ? true : false;
    links.header = req.user ? logged_in_nav : anonymous_nav;

    links.header.links.forEach(function (elem) {
      var page_url = req.originalUrl.slice(0, elem.href.length);
      elem.classes = '';
      console.log(req.originalUrl, page_url, elem.href, page_url, page_url == elem.href);
      if (page_url == elem.href) {
        elem.active = true;
        elem.classes = 'active';
      }
    });
    res.locals.links = links;
    next( );
  }

  function create ( ) {
    return set_links;
  }

  create.handlers = {
    set_links
  };

  return create;
}
module.exports = exports = configure;

