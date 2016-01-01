var app = angular.module('uploadk', []);

angular.module('uploadk')
.directive('catchFiles', ['$rootScope', '$timeout', '$window', function ($rootScope, $timeout, $window) {
	return {
		restrict: 'A',
		scope:true,
		link: function($scope, element, attrs) {
			var defaultOptions = {
				multiple:true,
				drag:true,
				click:false,
			};
			function Catcher() {
				var self = this;

				self.callback = $scope.$eval(attrs.catchFiles) || $scope.$eval(attrs.onDrop);
				if (!self.callback) {
					throw new Error("Error : no callback defined for fileCatcher directive");
				}
				if (attrs.onDragEnter) self.onDragEnterCallback = $scope.$eval(attrs.onDragEnter);
				if (attrs.onDragLeave) self.onDragLeaveCallback = $scope.$eval(attrs.onDragLeave);

				self.options = defaultOptions;
				var options = $scope.$eval(attrs.catchOptions);
				angular.extend(self.options, options);
				element.bind('dragover', self.onDrag);
				element.bind('dragenter', self.onEnter);
				element.bind('dragleave', self.onLeave);
				self.initInput();
				element.on('click', function (e){
					document.getElementById('input-file').click();
				});
				this._addEvent(element[0], 'drop', self.onDrop);
			}

			Catcher.prototype._addEvent = function(element, event, func)
			{
				if (element.addEventListener)
					element.addEventListener(event, func, false);
				else if (element.attachEvent)
					element.attachEvent('on' + event, func);
			}

			Catcher.prototype._getTransfer = function(event) {
				return event.dataTransfer || event.originalTarget || event.target;
			}

			Catcher.prototype._preventAndStop = function(event) {
				event.preventDefault();
				event.stopPropagation();
			}

			Catcher.prototype.onEnter = function(event) {
				if (self.onDragEnterCallback) self.onDragEnterCallback(event);
			}

			Catcher.prototype.onLeave = function(event) {
				if (self.onDragLeaveCallback) self.onDragLeaveCallback(event);
			}
			
			Catcher.prototype.onDrop = function(event){
				if (self.ignore || !$scope.$eval(attrs.catchIf)) {
					self.ignore = true;
					return ;
				}
				self._preventAndStop(event);
				var transfer = self._getTransfer(event);
				if (!transfer)
					return;
				if ((event.type == 'drop' || event.type == 'change')
					&& self.callback && typeof self.callback == "function") {
					var files = transfer.files;
					if (self.options.multiple === true) {
						self.callback(files);
					} else {
						self.callback(files[0]);
					}
				}
			}

			Catcher.prototype.onDrag = function(event) {
				var transfer = self._getTransfer(event);
				transfer.dropEffect = 'copy'; // fix redirect image dropped
				self._preventAndStop(event);
			}

			Catcher.prototype.initInput = function() {
				var input = angular.element('<input id="input-file" style="display:none;" type="file" multiple="multiple"/>');
				input.on('change', function (e){
					self.onDrop(e)
				});
				element.append(input);
			}

			var self = new Catcher();
		}
	};
}]);
angular.module('uploadk').factory('canvas', ["$q", function ($q) {

    var make = function(src, cwidth)
    {
        var deferred = $q.defer();
        var canvas = document.createElement("canvas");
        canvas.width = cwidth || 100;
        canvas.height = cwidth || 100;
        var context = canvas.getContext("2d");
        var imageObj = new Image();
        imageObj.src = src;
        imageObj.onload = function()
        {
            var width = imageObj.width;
            var height = imageObj.height;
            var render = 0;
            var offsetWidth = 0;
            var offsetHeight = 0;
            if (width >= height)
            {
                render = height;
                offsetWidth = (width - render) / 2;
            }
            else
            {
                render = width;
                offsetHeight = (height - render) / 2;
            }
            context.drawImage(imageObj, offsetWidth, offsetHeight, render, render, 0, 0, cwidth, cwidth);
            var srcimg = canvas.toDataURL("image/png");
            deferred.resolve(srcimg);
        };
        return deferred.promise;
    }

    return {
        make: make
    }
}]);
angular.module('uploadk').factory('fileReader', ["$q", function ($q) {

    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };
    
    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };
    
    var onProgress = function(reader, scope) {
        return function (event) {
            scope.$broadcast("fileProgress",
            {
                total: event.total,
                loaded: event.loaded
            });
        };
    };
    
    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
    };
    
    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();
        
        var reader = getReader(deferred, scope);        
        reader.readAsDataURL(file);
        
        return deferred.promise;
    };
    
    return {
        readAsDataUrl: readAsDataURL 
    };

}]);
angular.module('uploadk').factory('fileUploader', ['$rootScope', '$q',
	function ($rootScope, $q) {
		return {
			post: function(files, method) {

				return {
					to: function(uploadUrl, headers)
					{
						var deferred = $q.defer()
						if (!files || files.length == 0) {
							deferred.reject("No files to upload");
							return deferred.promise;
						}
						if (files && (files instanceof Array) == false)
							files = [files];

						var xhr = new XMLHttpRequest();
						xhr.upload.onprogress = function(e) {
							var percentCompleted;
							if (e.lengthComputable) {
								percentCompleted = Math.round(e.loaded / e.total * 100);
								if (deferred.notify) {
									deferred.notify({prct:percentCompleted, files:files});
								}
							}
						};

						xhr.onload = function(e) {
							var response = $rootScope.$eval(xhr.response) || xhr.responseText || null;
							var result = {
								dropped: files,
								response: response,
								status:xhr.status
							};
							if (xhr.status >= 0 && xhr.status < 300)
								deferred.resolve(result);
							else if (xhr.status >= 300 && xhr.status < 1000)
								deferred.reject(result);
						};

						xhr.upload.onerror = function(e) {
							var msg = "An error occurred while posting to '" + uploadUrl + "'";
							deferred.reject(msg);
						}

						xhr.parseHeaders = function(){
							if (!headers || !(headers instanceof Object))
								return;
							for (var key in headers)
								xhr.setRequestHeader(key, headers[key]);
						}

						var formData = new FormData();
						for (var i = 0; i < files.length; i++) {
							formData.append(files[i].name, files[i]);
						}
						method = method || "POST";
						xhr.open(method, uploadUrl, true);
						xhr.parseHeaders();
						xhr.send(formData);
						return deferred.promise;               
					}
				};
			}
		};
	}]);