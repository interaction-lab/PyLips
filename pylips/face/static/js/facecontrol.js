//------------------------------------------------------------------------------
// GUI to Control Face, allowing for testing of AUs
// Copyright (C) 2018 Nathaniel Steele Dennler and Gauri Jain
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//------------------------------------------------------------------------------

// Last updated: 6/28/2018

//refer to: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4157835/ for action units and their controlled muscles
//see also: https://www.cs.cmu.edu/~face/facs.htm

  /*
  parameters are all the action units as well as the side to modify
  look at dat.gui documentation for more understanding http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  */
var bothVal = {
            AU1: 0,
            AU2: 0,
            AU3: 0,
            AU4: 0,
            AU5: 0,
            AU6: 0,
            AU7: 0,
            AU8: 0,
            AU9: 0,
            AU10: 0,
            AU11: 0,
            AU12: 0,
            AU13: 0,
            AU14: 0,
            AU15: 0,
            AU16: 0,
            AU17: 0,
            AU18: 0,
            AU19: 0,
            AU20: 0,
            AU21: 0,
            AU22: 0,
            AU23: 0,
            AU24: 0,
            AU25: 0,
            AU26: 0,
            AU27: 0,
            AU43: 0,
            left: false,
            right: false,
            both: true
          };
var leftVal = {
            AU1: 0,
            AU2: 0,
            AU3: 0,
            AU4: 0,
            AU5: 0,
            AU6: 0,
            AU7: 0,
            AU8: 0,
            AU9: 0,
            AU10: 0,
            AU11: 0,
            AU12: 0,
            AU13: 0,
            AU14: 0,
            AU15: 0,
            AU16: 0,
            AU17: 0,
            AU18: 0,
            AU19: 0,
            AU20: 0,
            AU21: 0,
            AU22: 0,
            AU23: 0,
            AU24: 0,
            AU25: 0,
            AU26: 0,
            AU27: 0,
            AU43: 0,
            left: true,
            right: false,
            both: false
          };
var rightVal = {
            AU1: 0,
            AU2: 0,
            AU3: 0,
            AU4: 0,
            AU5: 0,
            AU6: 0,
            AU7: 0,
            AU8: 0,
            AU9: 0,
            AU10: 0,
            AU11: 0,
            AU12: 0,
            AU13: 0,
            AU14: 0,
            AU15: 0,
            AU16: 0,
            AU17: 0,
            AU18: 0,
            AU19: 0,
            AU20: 0,
            AU21: 0,
            AU22: 0,
            AU23: 0,
            AU24: 0,
            AU25: 0,
            AU26: 0,
            AU27: 0,
            AU43: 0,
            left: false,
            right: true,
            both: false
          };
var gui_params = {
            AU1: 0,
            AU2: 0,
            AU3: 0,
            AU4: 0,
            AU5: 0,
            AU6: 0,
            AU7: 0,
            AU8: 0,
            AU9: 0,
            AU10: 0,
            AU11: 0,
            AU12: 0,
            AU13: 0,
            AU14: 0,
            AU15: 0,
            AU16: 0,
            AU17: 0,
            AU18: 0,
            AU19: 0,
            AU20: 0,
            AU21: 0,
            AU22: 0,
            AU23: 0,
            AU24: 0,
            AU25: 0,
            AU26: 0,
            AU27: 0,
            AU43: 0,
            left: false,
            right: false,
            both: true
          };

  //create a new gui object and adjust width so all descriptions can be read
  var gui = new dat.GUI({hideable: true});
  gui.width = 400;

  var expression = gui.addFolder( 'Expression Interface' );

  //3 Action Units for Eyebrows
  var brows = expression.addFolder( 'Eyebrow Action Units' );
  brows.add( gui_params, 'AU1', 0, 1 ).name('AU1 - Raise Inner').step( 0.01 ).listen().onChange( function( value ) { au(1 , value, getSide(), 1); getData()['AU1']=value;} );
  brows.add( gui_params, 'AU2', 0, 1 ).name('AU2 - Raise Outer').step( 0.01 ).listen().onChange( function( value ) { au(2 , value, getSide(), 1); getData()['AU2']=value;} );
  brows.add( gui_params, 'AU4', 0, 1 ).name('AU4 - Draw and Lower').step( 0.01 ).listen().onChange( function( value ) { au(4 , value, getSide(), 1); getData()['AU4']=value;} );

  //4 Action Units for Nose, Eyes, and Cheeks
  var mid = expression.addFolder( 'Eye/Nose Action Units' );
  mid.add( gui_params, 'AU5', 0, 1 ).name('AU5 - Raise Upper Lids').step( 0.01 ).listen().onChange( function( value ) { au(5 , value, getSide(), 1); getData()['AU5']=value; } );
  // mid.add( gui_params, 'AU6', 0, 1 ).name('AU6 - Raise Cheeks').step( 0.01 ).listen().onChange( function( value ) { au(6 , value, getSide(), 1); getData()['AU6']=value; } );
  mid.add( gui_params, 'AU7', 0, 1 ).name('AU7 - Raise Lower Lid').step( 0.01 ).listen().onChange( function( value ) { au(7 , value, getSide(), 1); getData()['AU7']=value; } );
  mid.add( gui_params, 'AU9', 0, 1 ).name('AU9 - Raise Nose').step( 0.01 ).listen().onChange( function( value ) { au(9 , value, getSide(), 1); getData()['AU9']=value; } );
  mid.add( gui_params, 'AU43', 0, 1 ).name('AU43 - Blink').step( 0.01 ).listen().onChange( function( value ) { au(43 , value, getSide(), 1); getData()['AU43']=value; } );

  //15 Mouth Action Units
  var mouth = expression.addFolder( 'Mouth Action Units' );
  mouth.add( gui_params, 'AU10', 0, 1 ).name('AU10 - Raise Upper Lip').step( 0.01 ).listen().onChange( function( value ) { au(10 , value, getSide(), 1); getData()['AU10']=value; } );
  // mouth.add( gui_params, 'AU11', 0, 1 ).name('AU11').step( 0.01 ).listen().onChange( function( value ) { au(11 , value); getData()['AU11']=value; } );
  mouth.add( gui_params, 'AU12', 0, 1 ).name('AU12 - Lip Corners Out').step( 0.01 ).listen().onChange( function( value ) { au(12 , value, getSide(), 1); getData()['AU12']=value; } );
  mouth.add( gui_params, 'AU13', 0, 1 ).name('AU13 - Sharp Lip Puller').step( 0.01 ).listen().onChange( function( value ) { au(13 , value, getSide(), 1); getData()['AU13']=value; } );
  mouth.add( gui_params, 'AU14', 0, 1 ).name('AU14 - Dimpler').step( 0.01 ).listen().onChange( function( value ) { au(14 , value, getSide(), 1); getData()['AU14']=value;});
  mouth.add( gui_params, 'AU15', 0, 1 ).name('AU15 - Lip Corners Down').step( 0.01 ).listen().onChange( function( value ) { au(15 , value, getSide(), 1); getData()['AU15']=value; } );
  mouth.add( gui_params, 'AU16', 0, 1 ).name('AU16 - Lower Lip Depressor').step( 0.01 ).listen().onChange( function( value ) { au(16 , value, getSide(), 1); getData()['AU16']=value; } );
  mouth.add( gui_params, 'AU17', 0, 1 ).name('AU17 - Push Chin Up').step( 0.01 ).listen().onChange( function( value ) { au(17 , value, getSide(), 1); getData()['AU17']=value; } );
  mouth.add( gui_params, 'AU18', 0, 1 ).name('AU18 - Lip Pucker').step( 0.01 ).listen().onChange( function( value ) { au(18 , value, getSide(), 1); getData()['AU18']=value; } );
  mouth.add( gui_params, 'AU20', 0, 1 ).name('AU20 - Lip Stretcher').step( 0.01 ).listen().onChange( function( value ) { au(20 , value, getSide(), 1); getData()['AU20']=value; } );
  mouth.add( gui_params, 'AU23', 0, 1 ).name('AU23 - Lip Tightener').step( 0.01 ).listen().onChange( function( value ) { au(23 , value, getSide(), 1); getData()['AU23']=value; } );
  mouth.add( gui_params, 'AU24', 0, 1 ).name('AU24 - Lip Pressor').step( 0.01 ).listen().onChange( function( value ) { au(24 , value, getSide(), 1); getData()['AU24']=value; } );
  mouth.add( gui_params, 'AU25', 0, 1 ).name('AU25 - Part Lips').step( 0.01 ).listen().onChange( function( value ) { au(25 , value, getSide(), 1); getData()['AU25']=value; } );
  mouth.add( gui_params, 'AU26', 0, 1 ).name('AU26 - Jaw Drop').step( 0.01 ).listen().onChange( function( value ) { au(26 , value, getSide(), 1); getData()['AU26']=value; } );
  mouth.add( gui_params, 'AU27', 0, 1 ).name('AU27 - Mouth Stretch').step( 0.01 ).listen().onChange( function( value ) { au(27 , value, getSide(), 1); getData()['AU27']=value; } );

  //Radio buttons to select the side to modify
  var leftSelect = expression.add(gui_params, 'left').name('Right Side').listen().onChange(function(value){setVals(leftVal);});
  var rightRight = expression.add(gui_params, 'right').name('Left Side').listen().onChange(function(value){setVals(rightVal);});
  var bothSelect = expression.add(gui_params, 'both').name('Both Sides').listen().onChange(function(value){setVals(bothVal);});
  var obj = {'Reset Expression':function(){clearVals(gui_params, 'both'); clearVals(bothVal, 'both'); clearVals(rightVal, 'right'); clearVals(leftVal, 'left');}};
  var reset = expression.add(obj,'Reset Expression');

  function getData(){
    if(gui_params['left'] == true){
      return leftVal
    }
    if(gui_params['right'] == true){
      return rightVal
    }
    if(gui_params['both'] == true){
      return bothVal
    }
  }

  function setVals( data ){
    for (var key in gui_params){
      gui_params[key] = data[key];
    }
  }

  function clearVals(data, type){
    for (var key in data){
      data[key] = 0;
      data[key] = false; 
    }
    zero_aus([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,43], 1)
    data[type] = true;
  }
  /*
  helper function so only one checkbox is selected at a time
  prop is the variable name from the gui_params array (as a string)
  */
  function setChecked( prop ){
     for (let parameter in gui_params){
        gui_params[parameter] = false;
      }
      gui_params[prop] = true;
    }

  //helper function to determine the side of the face that is being modified.
  function getSide(){
    if(gui_params['left'] == true){
      return 'l'
    }
    if(gui_params['right'] == true){
      return 'r'
    }
    if(gui_params['both'] == true){
      return 'b'
    }
  }



// Default face parameters
var facegui_params = {
  background_color: '#D7E4F5',
  eyeball_color: '#ffffff',
  iris_color: '#800080',
  eye_size: 140,
  eye_height: 80,
  eye_separation: 400,
  iris_size: 80,
  pupil_scale: 0.7,
  eye_shine: true,
  nose_color: '#ff99cc',
  nose_vertical_position: 10,
  nose_width: 0,
  nose_height: 0,
  mouth_color: '#2c241b',
  mouth_thickness: 18,
  mouth_width: 450,
  mouth_height: 20,
  mouth_y: 50,
  brow_color: '#2c241b',
  brow_width: 130,
  brow_height: 210,
  brow_thickness: 18
};

var face = gui.addFolder('Face Design Interface');

// Folder for overall settings
face.addColor(facegui_params, 'background_color').name('Background Color').onChange(() => params.background_color = facegui_params.background_color);

// Folder for eyes
var eyeFolder = face.addFolder('Eyes');
eyeFolder.addColor(facegui_params, 'eyeball_color').name('Eyeball Color').onChange(() => params.eyeball_color = facegui_params.eyeball_color);
eyeFolder.addColor(facegui_params, 'iris_color').name('Iris Color').onChange(() => params.iris_color = facegui_params.iris_color);
eyeFolder.add(facegui_params, 'eye_size', 50, 300).name('Eye Size').onChange(() => params.eye_size = facegui_params.eye_size);
eyeFolder.add(facegui_params, 'eye_height', -100, 150).name('Eye Height').onChange(() => params.eye_height = facegui_params.eye_height);
eyeFolder.add(facegui_params, 'eye_separation', 200, 800).name('Eye Separation').onChange(() => params.eye_separation = facegui_params.eye_separation);
eyeFolder.add(facegui_params, 'iris_size', 20, 200).name('Iris Size').onChange(() => params.iris_size = facegui_params.iris_size);
eyeFolder.add(facegui_params, 'pupil_scale', 0.1, 1.0).name('Pupil Scale').onChange(() => params.pupil_scale = facegui_params.pupil_scale);
eyeFolder.add(facegui_params, 'eye_shine').name('Eye Shine').onChange(() => params.eye_shine = facegui_params.eye_shine); 

// Folder for nose
var noseFolder = face.addFolder('Nose');
noseFolder.addColor(facegui_params, 'nose_color').name('Nose Color').onChange(() => params.nose_color = facegui_params.nose_color);
noseFolder.add(facegui_params, 'nose_vertical_position', -50, 50).name('Nose Vertical Position').onChange(() => params.nose_vertical_position = facegui_params.nose_vertical_position);
noseFolder.add(facegui_params, 'nose_width', 0, 100).name('Nose Width').onChange(() => params.nose_width = facegui_params.nose_width);
noseFolder.add(facegui_params, 'nose_height', 0, 100).name('Nose Height').onChange(() => params.nose_height = facegui_params.nose_height);

// Folder for mouth
var mouthFolder = face.addFolder('Mouth');
mouthFolder.addColor(facegui_params, 'mouth_color').name('Mouth Color').onChange(() => params.mouth_color = facegui_params.mouth_color);
mouthFolder.add(facegui_params, 'mouth_width', 100, 600).name('Mouth Width').onChange(() => params.mouth_width = facegui_params.mouth_width);
mouthFolder.add(facegui_params, 'mouth_height', 10, 100).name('Mouth Height').onChange(() => params.mouth_height = facegui_params.mouth_height);  
mouthFolder.add(facegui_params, 'mouth_thickness', 1, 50).name('Mouth Thickness').onChange(() => params.mouth_thickness = facegui_params.mouth_thickness);
mouthFolder.add(facegui_params, 'mouth_y', 0, 150).name('Mouth Y Position').onChange(() => params.mouth_y = facegui_params.mouth_y);

// Folder for eyebrows
var browFolder = face.addFolder('Eyebrows');
browFolder.addColor(facegui_params, 'brow_color').name('Brow Color').onChange(() => params.brow_color = facegui_params.brow_color);
browFolder.add(facegui_params, 'brow_width', 50, 200).name('Brow Width').onChange(() => params.brow_width = facegui_params.brow_width);
browFolder.add(facegui_params, 'brow_height', 150, 350).name('Brow Height').onChange(() => params.brow_height = facegui_params.brow_height);
browFolder.add(facegui_params, 'brow_thickness', 1, 50).name('Brow Thickness').onChange(() => params.brow_thickness = facegui_params.brow_thickness);

// Function to reset and update all GUI elements
var obj = {
  'Reset Face': function() {
      // Default parameter values
      let defaultgui_params = {
        background_color: '#D7E4F5',
    eyeball_color: '#ffffff',
    iris_color: '#800080',
    eye_size: 140,
    eye_height: 80,
    eye_separation: 400,
    iris_size: 80,
    pupil_scale: 0.7,
    eye_shine: true,
    nose_color: '#ff99cc',
    nose_vertical_position: 10,
    nose_width: 0,
    nose_height: 0,
    mouth_color: '#2c241b',
    mouth_thickness: 18,
    mouth_width: 450,
    mouth_height: 20,
    mouth_y: 50,
    brow_color: '#2c241b',
    brow_width: 130,
    brow_height: 210,
    brow_thickness: 18
      };

      // Set face parameters to default
      setFaceVals(defaultgui_params);

      // Update all controllers
      updateAllControllers(gui);
  },

  'Save Face': function() {
    // Save face parameters to database
    const jsonString = JSON.stringify(facegui_params, null, 2); // Convert dictionary to JSON string (pretty print)
    const blob = new Blob([jsonString], { type: "application/json" }); // Create a blob from the JSON string
    const url = URL.createObjectURL(blob); // Create a downloadable URL

    // Create a temporary anchor element and trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "face_params.json"; // Name of the file to be downloaded
    document.body.appendChild(a);
    a.click(); // Trigger the download
    document.body.removeChild(a); // Clean up the DOM

  }
};

// Add Reset Face button to GUI
var reset_face = face.add(obj, 'Reset Face');
var save_face = face.add(obj, 'Save Face');

// Function to set face parameters
function setFaceVals(data) {
  for (var key in facegui_params) {
      if (data.hasOwnProperty(key)) {
          facegui_params[key] = data[key];
          params[key] = data[key]
      }
  }
}

// Function to update all controllers in the GUI
function updateAllControllers(gui) {
  // Update main controllers
  face.__controllers.forEach(function(controller) {
      controller.updateDisplay();
  });

  eyeFolder.__controllers.forEach(function(controller) {
    controller.updateDisplay();
  });
  
  noseFolder.__controllers.forEach(function(controller) {
    controller.updateDisplay();
  });

  mouthFolder.__controllers.forEach(function(controller) {
    controller.updateDisplay();
  });
}




  //sets the gui to open on the page load
gui.open();
