# uploadk
AngularJS (1.x) plugin, upload files, make canvas, drag &amp; drop, no need jquery

### Install
``` npm install uploadk ```

### How to use ?
1. Add to your module dependency ```var app = angular.module('myApp', ['uploadk'])```
2. Markup your DOM element ```<div catch-files on-drop="callback" catch-options="options">```
3. Inject factories : fileReader, fileUploader and canvas to your controller, then do your business on files catched by the directive

### FilesCatch Directive attributes
- **files-catch / on-drop**
They both do the same action, its a matter of choice, evaluate your $scope properties to find the matching callback function

controller :
```$scope.dropCallback = function(files) { //do business };```

html :
```<div catch-files on-drop="dropCallback"></div>```

- **on-drag-enter / on-drag-leave**
same syntax

- **catch-if**
This attributes will evaluate your expression, if your expression is equivalent to undefined or false, the directive will be inactive.
```<div catch-files="dropCallback" catch-if="user"></div>```

- **catch-options**
the directive will extend its default options to your own, you can override each options properties (see below)

controller:
```
$scope.options = {
  multiple = false;
};
```

html :
```<div catch-files="dropCallback catch-options="options"></div>```

### FilesCatch options
- **multiple (default:true)**
if set to false, the directive will only provide the first file catched to your callback function

- **drag (default:true)**
define if the drag & drop feature is active or not

- **click (default:false)**
define if the click feature is active or not (will create an hidden input and pop a file window on the click event)

### Factories

- **fileReader**
```fileReader.readAsDataURL(file, scope);```

- **canvas**
```canvas.make(dataUrl, height);```

- **fileUploader**
```
fileUploader.post(files, [method])
			.to(url, headers)
			.then(function (success){

				}, function (err){

			}, function (notify){
	});
```

example :
```
angular.module('myApp').controller('MainController', ['$scope', fileReader', 'canvas', 'fileUploader', function($scope, fileReader, canvas, fileUploader){
	var droppedFiles = [];
	$scope.images = [];
	$scope.dropCallback =  function(files) {
		for (var i = 0; l = files.length, i < l; ++i) {
                droppedFiles.push(files[i]);
                fileReader.readAsDataUrl(files[i], $scope).then(function (result)
                {
                    canvas.make(result, 400).then(function (src){
                        var image = {src:src};
                        $scope.images.unshift(image);
                    });
                });
            }
	};
}]);
```
