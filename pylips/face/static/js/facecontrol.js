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
var params = {
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

  //3 Action Units for Eyebrows
  var brows = gui.addFolder( 'Eyebrow Action Units' );
  brows.add( params, 'AU1', 0, 1 ).name('AU1 - Raise Inner').step( 0.01 ).listen().onChange( function( value ) { au(1 , value, getSide()); move_face(1); getData()['AU1']=value;} );
  brows.add( params, 'AU2', 0, 1 ).name('AU2 - Raise Outer').step( 0.01 ).listen().onChange( function( value ) { au(2 , value, getSide()); move_face(1); getData()['AU2']=value;} );
  brows.add( params, 'AU4', 0, 1 ).name('AU4 - Draw and Lower').step( 0.01 ).listen().onChange( function( value ) { au(4 , value, getSide()); move_face(1); getData()['AU4']=value;} );

  //4 Action Units for Nose, Eyes, and Cheeks
  var mid = gui.addFolder( 'Eye/Nose Action Units' );
  mid.add( params, 'AU5', 0, 1 ).name('AU5 - Raise Upper Lids').step( 0.01 ).listen().onChange( function( value ) { au(5 , value, getSide()); move_face(1); getData()['AU5']=value; } );
  // mid.add( params, 'AU6', 0, 1 ).name('AU6 - Raise Cheeks').step( 0.01 ).listen().onChange( function( value ) { au(6 , value, getSide()); move_face(1); getData()['AU6']=value; } );
  mid.add( params, 'AU7', 0, 1 ).name('AU7 - Raise Lower Lid').step( 0.01 ).listen().onChange( function( value ) { au(7 , value, getSide()); move_face(1); getData()['AU7']=value; } );
  mid.add( params, 'AU9', 0, 1 ).name('AU9 - Raise Nose').step( 0.01 ).listen().onChange( function( value ) { au(9 , value, getSide()); move_face(1); getData()['AU9']=value; } );
  mid.add( params, 'AU43', 0, 1 ).name('AU43 - Blink').step( 0.01 ).listen().onChange( function( value ) { au(43 , value, getSide()); move_face(1); getData()['AU43']=value; } );

  //15 Mouth Action Units
  var mouth = gui.addFolder( 'Mouth Action Units' );
  mouth.add( params, 'AU10', 0, 1 ).name('AU10 - Raise Upper Lip').step( 0.01 ).listen().onChange( function( value ) { au(10 , value, getSide()); move_face(1); getData()['AU10']=value; } );
  mouth.add( params, 'AU11', 0, 1 ).name('AU11').step( 0.01 ).listen().onChange( function( value ) { au(11 , value); move_face(1); getData()['AU11']=value; } );
  mouth.add( params, 'AU12', 0, 1 ).name('AU12 - Lip Corners Out').step( 0.01 ).listen().onChange( function( value ) { au(12 , value, getSide()); move_face(1); getData()['AU12']=value; } );
  mouth.add( params, 'AU13', 0, 1 ).name('AU13 - Sharp Lip Puller').step( 0.01 ).listen().onChange( function( value ) { au(13 , value, getSide()); move_face(1); getData()['AU13']=value; } );
  mouth.add( params, 'AU14', 0, 1 ).name('AU14 - Dimpler').step( 0.01 ).listen().onChange( function( value ) { au(14 , value, getSide()); move_face(1); getData()['AU14']=value;});
  mouth.add( params, 'AU15', 0, 1 ).name('AU15 - Lip Corners Down').step( 0.01 ).listen().onChange( function( value ) { au(15 , value, getSide()); move_face(1); getData()['AU15']=value; } );
  mouth.add( params, 'AU16', 0, 1 ).name('AU16 - Lower Lip Depressor').step( 0.01 ).listen().onChange( function( value ) { au(16 , value, getSide()); move_face(1); getData()['AU16']=value; } );
  mouth.add( params, 'AU17', 0, 1 ).name('AU17 - Push Chin Up').step( 0.01 ).listen().onChange( function( value ) { au(17 , value, getSide()); move_face(1); getData()['AU17']=value; } );
  mouth.add( params, 'AU18', 0, 1 ).name('AU18 - Lip Pucker').step( 0.01 ).listen().onChange( function( value ) { au(18 , value, getSide()); move_face(1); getData()['AU18']=value; } );
  mouth.add( params, 'AU20', 0, 1 ).name('AU20 - Lip Stretcher').step( 0.01 ).listen().onChange( function( value ) { au(20 , value, getSide()); move_face(1); getData()['AU20']=value; } );
  mouth.add( params, 'AU23', 0, 1 ).name('AU23 - Lip Tightener').step( 0.01 ).listen().onChange( function( value ) { au(23 , value, getSide()); move_face(1); getData()['AU23']=value; } );
  mouth.add( params, 'AU24', 0, 1 ).name('AU24 - Lip Pressor').step( 0.01 ).listen().onChange( function( value ) { au(24 , value, getSide()); move_face(1); getData()['AU24']=value; } );
  mouth.add( params, 'AU25', 0, 1 ).name('AU25 - Part Lips').step( 0.01 ).listen().onChange( function( value ) { au(25 , value, getSide()); move_face(1); getData()['AU25']=value; } );
  mouth.add( params, 'AU26', 0, 1 ).name('AU26 - Jaw Drop').step( 0.01 ).listen().onChange( function( value ) { au(26 , value, getSide()); move_face(1); getData()['AU26']=value; } );
  mouth.add( params, 'AU27', 0, 1 ).name('AU27 - Mouth Stretch').step( 0.01 ).listen().onChange( function( value ) { au(27 , value, getSide()); move_face(1); getData()['AU27']=value; } );

  //Radio buttons to select the side to modify
  var leftSelect = gui.add(params, 'left').name('Right Side').listen().onChange(function(value){setVals(leftVal);});
  var rightRight = gui.add(params, 'right').name('Left Side').listen().onChange(function(value){setVals(rightVal);});
  var bothSelect = gui.add(params, 'both').name('Both Sides').listen().onChange(function(value){setVals(bothVal);});
  var obj = {Reset:function(){clearVals(params, 'both'); clearVals(bothVal, 'both'); clearVals(rightVal, 'right'); clearVals(leftVal, 'left');}};
  var reset = gui.add(obj,'Reset');

  function getData(){
    if(params['left'] == true){
      return leftVal
    }
    if(params['right'] == true){
      return rightVal
    }
    if(params['both'] == true){
      return bothVal
    }
  }

  function setVals( data ){
    for (var key in params){
      params[key] = data[key];
    }
  }

  function clearVals(data, type){
    for (var key in data){
      data[key] = 0;
      data[key] = false;
    }
    zeroFace(1);
    data[type] = true;
  }
  /*
  helper function so only one checkbox is selected at a time
  prop is the variable name from the params array (as a string)
  */
  function setChecked( prop ){
     for (let parameter in params){
        params[parameter] = false;
      }
      params[prop] = true;
    }

  //helper function to determine the side of the face that is being modified.
  function getSide(){
    if(params['left'] == true){
      return 'l'
    }
    if(params['right'] == true){
      return 'r'
    }
    if(params['both'] == true){
      return 'b'
    }
  }

  //sets the gui to open on the page load
gui.open();
