
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
    links.header = req.user ? logged_in_nav : anonymous_nav;

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

