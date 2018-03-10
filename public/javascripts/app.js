/*jshint esversion: 6 */
// This file sets the various front-end app states for angular

(() => {
  const app = angular.module('dreamHomeApp', ['ui.router']);
  app.config(($stateProvider, $urlRouterProvider) => {
    $stateProvider

      .state('home', {
        url: '/',
        views: {
          header: {
            templateUrl: '/views/header.html',
            controller: 'NavController'
          },
          content: {
            templateUrl: '/views/home.html'
          },
          footer: {
            templateUrl: '/views/footer.html'
          }
        }
      })

      .state('write', {
        url: '/write',
        views: {
          header: {
            templateUrl: '/views/header.html',
            controller: 'NavController'
          },
          content: {
            templateUrl: '/views/write.html'
            //controller:
          },
          footer: {
            templateUrl: '/views/footer.html'
          }
        }
      })

      .state('form', {
        url: '/add',
        views: {
          header: {
            templateUrl: '/views/header.html',
            controller: 'NavController'
          },
          content: {
            templateUrl: '/views/form.html'
          },
          footer: {
            templateUrl: '/views/footer.html'
          }
        }
      })

      .state('viewmydream', {
        url: '/viewmydream',
        views: {
          header: {
            templateUrl: '/views/header.html',
            controller: 'NavController'
          },
          content: {
            templateUrl: '/views/viewmydream.html'
          },
          footer: {
            templateUrl: '/views/footer.html'
          }
        }
      })

      .state('signin', {
        url: '/signin',
        views: {
          content: {
            templateUrl: '/views/signin.html'
          }
        }
      })

      .state('signup', {
        url: '/signup',
        views: {
          content: {
            templateUrl: '/views/signup.html'
          }
        }
      })

      .state('404', {
        url: '/404',
        views: {
          content: {
            templateUrl: '/views/404.html'
          }
        }
      });

    // All other routes redirect to main view
    $urlRouterProvider.otherwise('/');
  });
})();
