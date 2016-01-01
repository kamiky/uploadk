# uploadk
AngularJS (1.x) plugin, upload files, make canvas, drag &amp; drop, no need jquery

### Install
``` npm install uploadk ```

### How to use ?
1. Add to your module dependency ```var app = angular.module('myApp', ['uploadk'])```
2. Markup your DOM element ```<div catch-files on-drop="callback" catch-options="options">```
3. Inject factories : fileReader, fileUploader and canvas to your controller, then do your business on files catched by the directive
