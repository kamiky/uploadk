var app = angular.module('myApp', ['uploadk'])
.controller('MainCtrl', ['$scope', '$rootScope', 'fileReader', 'canvas', 'fileUploader',
	function ($scope, $rootScope, fileReader, canvas, fileUploader) {
		$scope.canUpload = true;
		$scope.options = {
			drag:true,
			click:true,
		};
		var token = "123";
		var droppedFiles = [];
		$scope.idefault = "default.png";
		$scope.images = [];

		$scope.dropCallback = function(files) {
			for (var i = 0; l = files.length, i < l; ++i) {
				if (files[i].size >= 1000000) {
					$scope.images.unshift({src:"default.png"});
					$scope.$apply();
				} else {
					fileReader.readAsDataUrl(files[i], $scope).then(function (result)
					{
						canvas.make(result, 400).then(function (src){
							var image = {src:src};
							$scope.images.unshift(image);
						});
					});
				}
				droppedFiles.push(files[i]);
			}
		};

		$scope.upload = function() {
			var headers = {
				"auth-token": token
			};
			var url = 'http://google.fr';
			/* change url and use with a server side application, have fun */
			fileUploader.post(droppedFiles)
			.to(url, headers)
			.then(function (success){
				$scope.success = success;
			}, function (error){
				$scope.error = error;
			}, function (notify){
				$scope.prct = notify.prct;
			});
		};
	}]);