/*
 * Copyright 2019 XEBIALABS
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var versionsApp = angular.module('staterVersions', ['ui.bootstrap']);

versionsApp.config(function($httpProvider) {
    // The following code retrieves credentials from the main XL Deploy application
    // and tells AngularJS to append them to every request.
    var flexApp = parent.document.getElementById("flexApplication");
    if (flexApp) $httpProvider.defaults.headers.common.Authorization = flexApp.getBasicAuth();
});

versionsApp.factory('versionsService', function($http, $q) {
    return {
        getDefaultApp: function() {
            var deferred = $q.defer();
            $http.get('/api/extension/xld-versions-plugin/default-app').success(
                function (response) {
                    deferred.resolve(response.entity);
                }
            );
            return deferred.promise;
        },
        getEnvOrder: function() {
            var deferred = $q.defer();
            $http.get('/api/extension/xld-versions-plugin/env-order').success(
                function (response) {
                    deferred.resolve(response.entity);
                }
            );
            return deferred.promise;
        },
        getApplications: function() {
            var deferred = $q.defer();
            $http.get('/api/extension/xld-versions-plugin/applications').success(
                function (response) {
                    var apps = response.entity;
                    apps.sort();
                    deferred.resolve(apps);
                }
            );
            return deferred.promise;
        },
        getVersions: function(app) {
            var deferred = $q.defer();
            if (app) {
                $http.get('/api/extension/xld-versions-plugin/versions', {"params": {"application": app}}).then(
                    function (response) {
                        deferred.resolve(response.data.entity);
                    }
                );
            }
            else {
                deferred.reject('Please select an application');
            }
            return deferred.promise;
        },
        getEnvDetails: function(env, app) {
            var deferred = $q.defer();
            $http.get('/api/extension/xld-versions-plugin/env-details' , {"params": {"env": env, "application": app}}).then(
                function (response) {
                    deferred.resolve(response.data.entity);
                }
            );
            return deferred.promise;
        },
        getVersionDetails: function(version) {
            var deferred = $q.defer();
            $http.get('/api/extension/xld-versions-plugin/version-details', {'params': {'version': version}}).then(
                function (response) {
                    deferred.resolve(response.data.entity);
                }
            );
            return deferred.promise;
        }
    }
});

versionsApp.controller('EnvDetailsController', function ($scope, $modalInstance, envDetails) {
    $scope.envDetails = envDetails;

    $scope.dismiss = function () {
        $modalInstance.dismiss('dismiss');
    };
});

versionsApp.controller('CompareController', function ($scope, $modalInstance, env, envVersion, compareVersion) {
    $scope.env = env;
    $scope.envVersion = envVersion;
    $scope.compareVersion = compareVersion;

    $scope.dismiss = function () {
        $modalInstance.dismiss('dismiss');
    };
});

versionsApp.controller('VersionsController', function ($scope, $modal, versionsService) {
    function compareEnvironments(a,b) {
        var envOrder = $scope.envOrder
        for (var i = 0; i < envOrder.length; i++) {
            var regex = new RegExp(envOrder[i], 'g')
            a = a.replace(regex, ("00000" + i).slice(-5))
            b = b.replace(regex, ("00000" + i).slice(-5))
        }

        return a.localeCompare(b);
    }

    function getEnvironments() {
        var environments = new Array();
        for (v in $scope.versions) {
            var envs = $scope.versions[v]["envs"];

            environments.push.apply(environments,envs);
        }
        return environments.sort(compareEnvironments)
    }

    $scope.countKeys = function(obj) {
        if (obj) {
            return Object.keys(obj).length;
        }
        return 0;
    }

    $scope.showEnvDetails = function(env) {
        versionsService.getEnvDetails(env, $scope.application).then( function (envDetails) {
            $modal.open({
                templateUrl: 'envDetails.html',
                controller:  'EnvDetailsController',
                resolve: {
                    envDetails: function () {
                        return envDetails;
                    }
                }
            });
        });
    }

    $scope.compareVersion = function(env, compareVersionId) {
        var envVersion, compareVersion;
        versionsService.getVersionDetails(compareVersionId)
            .then(function (compareVersionsDetails) {
                compareVersion = compareVersionsDetails
            })
            .then(angular.bind(this, versionsService.getEnvDetails, env, $scope.application))
            .then(function (envDetails) {
                return versionsService.getVersionDetails(envDetails.version)
            })
            .then(function (envVersionsDetails) {
                envVersion = envVersionsDetails;
            })
            .then(function () {
                for (package in compareVersion.packages) {
                    if (!envVersion.packages[package]) {
                        envVersion.packages[package] = "-"
                    }
                }
                for (package in envVersion.packages) {
                    if (!compareVersion.packages[package]) {
                        compareVersion.packages[package] = "-"
                    }
                }

                $modal.open({
                    templateUrl: 'compare.html',
                    controller: 'CompareController',
                    size: 'lg',
                    scope: $scope,
                    resolve: {
                        env:            function() { return env; },
                        envVersion:     function() { return envVersion; },
                        compareVersion: function() { return compareVersion; }
                    }
                });
            });
    }

    $scope.refresh = function() {
        $scope.message = "Loading versions ...";
        versionsService.getEnvOrder()
            .then(function(envOrder) {
                $scope.envOrder = envOrder;
            })
            .then(versionsService.getApplications)
            .then(function(apps) {
                $scope.applications = apps;
            })
            .then(angular.bind(this, versionsService.getVersions, $scope.application))
            .then(function(versions) {
                $scope.versions = versions;
                $scope.environments = getEnvironments();
                $scope.message = "";
            })
            .catch(function(error) {
                $scope.message = error;
            });
    }

    versionsService.getDefaultApp().then(function(defaultApp) {
        $scope.message = "Please select an application"
        $scope.application = defaultApp;
        $scope.refresh()
    })
});
