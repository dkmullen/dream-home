/*jshint esversion: 6 */
/* These front-end controllers make the requests necessary to build the pages */

(() => {
  angular
    .module('dreamHomeApp') // this only retrieves the module, created in app.js

    // List all members
    .controller('MemberListController', [
      '$http',
      '$log',
      '$location',
      '$window',
      function($http, $log, $location, $window) {
        let directory = this;
        directory.members = [];
        /* This gets the list of members from the DB for the home view, binds it to
         directory.members. MemberListController is called from the home view.
      */
        $http
          .get('/members', {
            headers: { 'x-access-token': $window.sessionStorage.token }
          })
          .then(data => {
            directory.members = data;
          })
          .catch(err => {
            // Check for a token from MemberController on the back-end
            if (err.status === 401) {
              $location.url('/login'); //redirect to /login view
            } else {
              $log.error('Err from MemberListController ' + err);
            }
          });
      }
    ])

    // Display one member
    .controller('MemberRecordController', [
      '$http',
      '$scope',
      '$log',
      '$location',
      '$stateParams',
      '$window',
      function($http, $scope, $log, $location, $stateParams, $window) {
        let record = this;
        record.member = [];
        $scope.id = $stateParams.id;

        // Get a single member, bind it to record.member for detail view
        $http
          .get('/members/' + $scope.id, {
            headers: { 'x-access-token': $window.sessionStorage.token }
          })
          .then(data => {
            record.member = data;
            let myPhone = data.data.phone.phoneNumber;
            let myNumber =
              myPhone.slice(0, 3) +
              '-' +
              myPhone.slice(3, 6) +
              '-' +
              myPhone.slice(6, 10);
            document.getElementById('phone').append(myNumber); // What's the Angular way?
          })
          .catch(err => {
            // Check for a token from MemberController on the back-end
            if (err.status === 401) {
              $location.url('/login'); //redirect to /login view
            } else {
              $log.error('Err from MemberRecordController' + err);
            }
          });
      }
    ])

    // Make changes to an existing member record
    .controller('UpdateRecordController', [
      'widgetFactory',
      '$scope',
      '$http',
      '$log',
      '$location',
      '$timeout',
      '$window',
      function(
        widgetFactory,
        $scope,
        $http,
        $log,
        $location,
        $timeout,
        $window
      ) {
        $http
          .get('/update', {
            headers: { 'x-access-token': $window.sessionStorage.token }
          })
          .catch(err => {
            if (err.status === 401) {
              $location.url('/login');
            } else {
              $log.error(
                'Err from UpdateRecordController loading update page ' + err
              );
            }
          });

        function populateRecord() {
          $http({
            method: 'GET',
            url: 'members/me',
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': $window.sessionStorage.token
            }
          })
            .then(member => {
              let my = member.data;
              if (Object.keys(my).length === 0) {
                // ie, if object is empty
                return $location.url('/add'); // redirect to /add page
              } else {
                let myRecord = {
                  firstName: my.firstName,
                  lastName: my.lastName,
                  dateOfBirth: new Date(my.dateOfBirth),
                  email: my.email,
                  phone: {
                    // insert some dashes for readability
                    phoneNumber:
                      my.phone.phoneNumber.slice(0, 3) +
                      '-' +
                      my.phone.phoneNumber.slice(3, 6) +
                      '-' +
                      my.phone.phoneNumber.slice(6, 10),
                    textCapable: my.phone.textCapable
                  },
                  address: {
                    streetOne: my.address.streetOne,
                    streetTwo: my.address.streetTwo,
                    city: my.address.city,
                    state: my.address.state,
                    zip: my.address.zip
                  },
                  _id: my._id,
                  image: {
                    full: my.image.full,
                    thumb: my.image.thumb
                  }
                };
                $scope.myRecord = myRecord;
              }
            })
            .catch(err => {
              if (err.status === 401) {
                $location.url('/login');
              } else {
                $log.error(
                  'Err from UpdateRecordController while populating form ' + err
                );
              }
            });
        }

        populateRecord();

        // For the cancel button on the page
        $scope.cancel = () => {
          $location.url('/member' + $scope.myRecord._id);
        };

        // These are used in the form to validate data
        $scope.successmessage = false;
        $scope.phoneregex =
          '[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}';
        $scope.zipregex = '\\d{5}([ \\-]\\d{4})?';

        // The Cloudinary widget
        let widget = cloudinary.createUploadWidget(widgetFactory, function(
          error,
          result
        ) {
          if (error) {
            console.log(error);
          } else {
            $scope.myPicture = result[0].secure_url;
          }
        });

        $scope.cloudinaryWidget = () => {
          widget.open();
        };

        $scope.updateRecord = () => {
          // Strip out non-numerics before saving phone number
          $scope.myRecord.phone.phoneNumber = $scope.myRecord.phone.phoneNumber.replace(
            /\D/g,
            ''
          );
          $scope.myRecord.image.full = $scope.myPicture;
          $scope.myRecord.image.thumb = $scope.myPicture;
          $http({
            method: 'PUT',
            url: 'members/' + $scope.myRecord._id,
            data: $scope.myRecord,
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': $window.sessionStorage.token
            }
          })
            .then(() => {
              $location.url('/member' + $scope.myRecord._id); // redirect to user's record
            })
            .catch(err => {
              if (err.status === 401) {
                $location.url('/login');
              } else {
                $log.error(
                  'Err from UpdateRecordController - PUT /members ' + err
                );
              }
            });
        };
      }
    ])

    // Create a new member record
    .controller('PostNewRecordController', [
      '$scope',
      '$http',
      '$log',
      '$location',
      '$timeout',
      '$window',
      function($scope, $http, $log, $location, $timeout, $window) {
        $scope.myPicture = '../resources/img_soon.jpg';
        // Load the page and check for a token from MemberController on the back-end
        $http
          .get('/add', {
            headers: { 'x-access-token': $window.sessionStorage.token }
          })
          .catch(err => {
            if (err.status === 401) {
              $location.url('/login');
            } else {
              $log.error(
                'Err from PostNewRecordController loading /add page' + err
              );
            }
          });

        function clearRecord() {
          $http({
            method: 'GET',
            url: 'members/me',
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': $window.sessionStorage.token
            }
          })
            .then(member => {
              // Redirect to /update page if user already has a member record
              if (Object.keys(member.data).length !== 0) {
                // ie, if object is not empty
                return $location.url('/update');
              } else {
                let myRecord = {
                  firstName: '',
                  lastName: '',
                  dateOfBirth: '',
                  email: '',
                  phone: {
                    phoneNumber: '',
                    textCapable: ''
                  },
                  address: {
                    streetOne: '',
                    streetTwo: '',
                    city: '',
                    state: 'TN',
                    zip: ''
                  },
                  image: {
                    full: $scope.myPicture,
                    thumb: $scope.myPicture
                  },
                  _creator: $window.sessionStorage.id
                };
                $scope.newRecord = myRecord;
              }
            })
            .catch(err => {
              if (err.status === 401) {
                $location.url('/login');
              } else {
                $log.error(
                  'Err from PostNewRecordController on clearing form - ' + err
                );
              }
            });
        }

        clearRecord();

        // For the reset button...
        $scope.clearform = () => {
          $scope.newRecord = clearRecord();
          $scope.newRecordForm.$setPristine();
        };

        // These are used in the form to validate data
        $scope.successmessage = false;
        $scope.phoneregex =
          '[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}';
        $scope.zipregex = '\\d{5}([ \\-]\\d{4})?';

        // The Cloudinary widget
        let widget = cloudinary.createUploadWidget(widgetFactory, function(
          error,
          result
        ) {
          if (error) {
            console.log(error);
          } else {
            $scope.myPicture = result[0].secure_url;
          }
        });

        $scope.cloudinaryWidget = () => {
          widget.open();
        };

        $scope.saveNewRecord = () => {
          $scope.newRecord.phone.phoneNumber = $scope.newRecord.phone.phoneNumber.replace(
            /\D/g,
            ''
          );
          $scope.newRecord.image.full = $scope.myPicture;
          $scope.newRecord.image.thumb = $scope.myPicture;
          $http({
            method: 'POST',
            url: 'members',
            data: $scope.newRecord,
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': $window.sessionStorage.token
            }
          })
            .then(data => {
              $scope.successmessage = true;
              $timeout(() => {
                /* We use 'apply' to add this to the watchlist so the view
          updates when this model updates. This causes the success message to
          appear for 3 seconds after user posts, then disapper. */
                $scope.$apply(() => {
                  $scope.successmessage = false;
                  $location.url('/');
                });
              }, 3000);
            })
            .catch(err => {
              // Might as well check again for a token before submitting the data
              if (err.status === 401) {
                $location.url('/login');
              } else {
                $log.error(
                  'Err from PostNewRecordController - POST /members' + err
                );
              }
            });
        };
      }
    ])

    // Nav bar related functions
    .controller('NavController', [
      '$scope',
      '$http',
      '$state',
      '$window',
      '$log',
      '$location',
      function($scope, $http, $state, $window, $log, $location) {
        // Determines which page we are on so nav pill is highlighted accordingly
        $scope.stateis = currentState => {
          return $state.is(currentState);
        };

        $scope.logOut = () => {
          $http({
            method: 'DELETE',
            url: '/users/me/token',
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': $window.sessionStorage.token
            }
          })
            .then(() => {
              $log.info('Ima out');
              delete $window.sessionStorage.token;
              delete $window.sessionStorage.id;
              console.log(
                'token is ' +
                  $window.sessionStorage.token +
                  ' and id is ' +
                  $window.sessionStorage.id
              );
              $location.url('/login');
            })
            .catch(err => {
              if (err.status === 401) {
                $location.url('/login');
              } else {
                $log.error('Err from logOut() in NavController ' + err);
              }
            });
        };
      }
    ])

    // Log in an existing user
    .controller('LogInController', [
      '$scope',
      '$http',
      '$window',
      '$log',
      '$location',
      function($scope, $http, $window, $log, $location) {
        function clearRecord() {
          let blankRecord = {
            email: '',
            password: ''
          };
          return blankRecord;
        }

        $scope.errorMessage = '';

        if ($window.sessionStorage.token) {
          $location.url('/');
        }

        $scope.logInCreds = clearRecord();
        $scope.pwregex = '^.{5,}$'; // Five or more characters

        $scope.logIn = () => {
          $http({
            method: 'POST',
            url: 'auth',
            data: $scope.logInCreds,
            message: 'Success!',
            headers: { 'Content-Type': 'application/json' }
          })
            .then(user => {
              if (user.data.success === true) {
                $window.sessionStorage.token = user.data.token;
                $window.sessionStorage.id = user.data.id;
                $scope.isAuthenticated = true;
                const encodedProfile = user.data.token.split('.')[1];
                const profile = JSON.parse(url_base64_decode(encodedProfile));
                $location.url('/');
              } else {
                $scope.errorMessage = user.data.message;
              }
            })
            .catch(err => {
              //Erase the token on failure to log in
              delete $window.sessionStorage.token;
              console.log('err');
              $scope.errorMessage =
                'The server is not responding. Please try again';
            });
        };
      }
    ])

    // Sign up a new user
    .controller('SignUpController', [
      '$scope',
      '$http',
      '$log',
      '$location',
      function($scope, $http, $log, $location) {
        function clearRecord() {
          let blankRecord = {
            name: '',
            email: '',
            password: '',
            password2: ''
          };
          return blankRecord;
        }
        $scope.signUpCreds = clearRecord();
        $scope.pwregex = '^.{5,}$'; // Five or more characters

        $scope.signUp = () => {
          $http({
            method: 'POST',
            url: 'users',
            data: $scope.signUpCreds,
            headers: { 'Content-Type': 'application/json' }
          })
            .then(data => {
              if (data.data.success === false) {
                $scope.errorMessage = data.data.message;
              } else {
                $location.url('/login');
              }
            })
            .catch(err => {
              $log.error('Err from signUp() in SignUpController ' + err);
            });
        };
      }
    ])

    .factory('authInterceptor', function($rootScope, $q, $location, $window) {
      return {
        request: config => {
          config.headers = config.headers || {};
          if ($window.sessionStorage.token) {
            config.headers.Authorization =
              'Bearer ' + $window.sessionStorage.token;
          }
          return config;
        },
        responseError: rejection => {
          if (rejection.status === 401) {
            $location.url('/login');
          }
          return $q.reject(rejection);
        }
      };
    })

    .config(function($httpProvider) {
      $httpProvider.interceptors.push('authInterceptor');
    });

  //this is used to parse the profile
  function url_base64_decode(str) {
    var output = str.replace('-', '+').replace('_', '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw 'Illegal base64url string!';
    }
    return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
  }
})();
