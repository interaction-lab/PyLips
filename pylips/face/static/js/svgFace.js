//------------------------------------------------------------------------------
// A web-based face for social robots.
// Copyright (C) 2024 Nathaniel Dennler
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

var listener,ros, latency_listener, latency_publisher, two;
var container, stats;

var camera, scene, renderer;
var tweens;

var  text, plane;

var parts;
var aus_l;
var aus_r;
var n_aus = 43;

var upperLipControlPoints = []; lowerLipControlPoints = [];
var lBrowControlPoints = []; rBrowControlPoints = [];

var lockIdleUntil = 0; //variable to lock idling, if a behavioral blink is occuring

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var camera_depth = 550;

// Idle behavior
var last_blink;
var last_glance;
var looking;
var poked, poke_end, poke_time;
var blinking, blink_end, blink_time;

var background_color;
var cm_per_px;
var ros_master_uri;
var viseme_adjustment;
var viseme_buffer, viseme_time_buffer, viseme_dur, viseme_start;
var startup_time, prev_frame_time;


/*
This is the first function that is called by the HTML Script.
It is responsible for the creation of all the face parts, and defines color, sizes, orientations, etc.
**See kiwi.html or chili.html for types of the input arguments.**
*/
function startFace(bkgd_color,
       robot_name,
       ros_uri,
       cm_per_pixel,
       viseme_adj,
       eye_white_color,
       eye_iris_color,
       eye_size,
       eye_height,
       eye_separation,
       eye_iris_size,
       eye_pupil_scale,
       eye_shine,
       eyelid_color,
       eyelid_width,
       eyelid_height,
       eyelid_arch,
       nose_color,
       nose_x,
       nose_y,
       nose_width,
       nose_height,
       mouth_color,
       mouth_x,
       mouth_y,
       mouth_width,
       mouth_height,
       mouth_thickness,
       mouth_opening,
       mouth_dimple_size,
       upper_lip_height_scale,
       lower_lip_height_scale,
       brow_color,
       brow_width,
       brow_height,
       brow_thickness,
       brow_innersize){

          d = new Date();
          startup_time = d.getTime()
          prev_frame_time = startup_time
          viseme_buffer = []
          viseme_time_buffer = []
          poked = false
          poke_start_time=0

          parts = []

          background_color = bkgd_color;
          cm_per_px = cm_per_pixel;
          // ros_master_uri = ros_uri;


          container = document.createElement( 'div' );
          container.setAttribute("id", "face-div");
          document.body.appendChild( container );
          // viseme_adjustment=viseme_adj

          var elem = document.getElementById('face-div');
          var params = { fullscreen:true };
          two = new Two(params).appendTo(elem);


          var rect = two.makeRectangle(windowHalfX, windowHalfY, window.innerWidth, window.innerHeight);
          rect.fill = background_color;
          rect.stroke = 'None'


          // addEyes(white_color, iris_color, size, height, separation, iris_size, pupil_scale, pupil_shape)
          addEyes(eye_white_color,
            eye_iris_color,
            eye_size,
            eye_height,
            eye_separation,
            eye_iris_size,
            eye_pupil_scale,
            eye_shine);
          //
          // addLids(color, width, height, arch)
          addLids(eyelid_color,
            eyelid_width,
            eyelid_height,
            eyelid_arch)

          // addNose(color, x, y, width, height)
          addNose(nose_color,
            nose_x,
            nose_y,
            nose_width,
            nose_height)

          // addMouth(color, x, y, width, height, thickness, opening, dimple_size, ulip_h_scale, llip_h_scale)
          addMouth( mouth_color,
              mouth_x,
              mouth_y,
              mouth_width,
              mouth_height,
              mouth_thickness,
              mouth_opening,
              mouth_dimple_size,
              upper_lip_height_scale,
              lower_lip_height_scale)

          // addBrows(color, width, height, thickness, arch)
          addBrows(brow_color,
             brow_width,
             brow_height,
             brow_thickness,
             brow_innersize)

          last_blink = 0;
          last_gaze = 0;
          looking = false;

          aus_l = []
          aus_r = []
          for(i=0;i<=n_aus+1;i++){
            aus_l.push(0)
            aus_r.push(0)
          }

          document.addEventListener( 'mousedown', onDocumentMouseDown, false );
          document.addEventListener( 'touchstart', onDocumentTouchStart, false );
          document.addEventListener( 'touchmove', onDocumentTouchMove, false );
          window.addEventListener( 'resize', onWindowResize, false );

          zeroFace(5)
          //finally, start the animation loop.
          two.bind('update', animate).play();
}

/**
Receives and processes the FaceRequest Message sent from the face_keyframe_server
message - a FaceRequest Message, which contains visemes and/or aus to send to the face.
          the message also contains timing information and magnitude information.
**/
function get_goal(message) {
  if(message.visemes.length!=0){
    console.log('Message received: visemes: ' + message.visemes);
    console.log(message)
    stop_visemes()
    // play_visemes(message.visemes, message.viseme_ms, message.times, message.start)
    play_visemes(message.visemes, 35, message.times, message.start)
  }

  if(message.aus.length!=0){
    console.log('Message received: aus: ' + message.aus + " degrees: " + message.au_degrees + " side: " + message.side)
    for(a in message.aus){
      this_au = message.aus[a]
      console.log(this_au)
      if(message.au_ms[a]<0){
        console.log("Time cannot be less than zero!")

      } else if(this_au == 'ZeroFace'){
        zeroFace(message.au_ms)
        console.log('clearing AUS')

      } else {
        //if the au is unilateral, it will have an 'r' or 'l' at the end to indicate the side to move
        if(this_au.slice(-1) == 'l' || this_au.slice(-1) == 'r'){
          au(parseInt(this_au.slice(0,-1)), message.au_degrees[a], this_au.slice(-1))
        }
        //otherwise assume bilateral movement
        else {
          au(parseInt(this_au), message.au_degrees[a])
        } if(parseInt(this_au) == 43){
          lockIdleUntil = new Date().getTime() + message.au_ms + 500
          console.log(new Date().getTime())
          console.log(lockIdleUntil)
        }
      }

    }
    move_face(message.au_ms)
  }
  if(message.hold_gaze==1){
    looking = true
  }
  if(message.hold_gaze==2){
    looking = false
  }
  if(message.retarget_gaze){
    console.log("Message received: gaze: " + message.gaze_target.x + "," + message.gaze_target.y + "," +  message.gaze_target.z)
    x = message.gaze_target.x
    y = message.gaze_target.y
    z = message.gaze_target.z
    gaze_vel = message.gaze_vel
    if(gaze_vel > 0){
      lookat_real_world(x, y, z, gaze_vel)
    }
    else {
      lookat_real_world(x, y, z, 1.7) //1.7 rad/s is an average human eye saccade speed
    }
  }
}

function get_latency(msg){
    console.log(msg)
    d = new Date();
    time = d.getTime()-startup_time
    latency_publisher.publish({data:msg.data+":"+time})
}

/*
Checks to see if any visemes have been added to the buffer.
If they have, it then plays the viseme for the indicated time
*/
function check_and_play_visemes(){
    if(viseme_buffer.length==0){return}
    d = new Date();
    elapsed = d.getTime()-viseme_start+viseme_dur;
    elapsed = elapsed/1000.0
    if(viseme_time_buffer[0]>elapsed){return};
    while(viseme_time_buffer[0]<elapsed){
      play_viseme = viseme_buffer.shift()
      viseme_time = viseme_time_buffer.shift()
    }
    // console.log(elapsed, viseme_time)
    console.log(play_viseme, viseme_dur)
    viseme(play_viseme,viseme_dur);
}

/*
adds a viseme information to the buffers.
visemes - a string representing the type of viseme to play
time_per - the length of the viseme to play
times - the time at which the viseme should be played
*/
function play_visemes(visemes, time_per, times){
    viseme_buffer = visemes
    console.log(times)
    for(time in times){
      times[time]-=.035;
    }
    console.log(times)
    viseme_time_buffer = times
    viseme_dur = time_per
    d = new Date();
    viseme_start = d.getTime();
}

/*
Stops the face from speaking
*/
function stop_visemes(){
    please_stop = true
    viseme_buffer = []
}

/*
Sets AU on a certain side to the given degree.
id - an integer representing the AU to change
degree - a float from 0 to 1 to control the intensity of the AU
side - a string indicating the side of the AU to modify (does both if left blank)
*/
function au(id, degree, side){

    if(side == "r"){
      aus_r[id] = degree
    } else if(side == "l"){
      aus_l[id] = degree
    } else{
      aus_l[id] = degree
      aus_r[id] = degree
    }
}

/*
Zeros all the AU's and moves the face to its neutral position.
t - time to move in milliseconds
*/
function zeroFace(t){
    for(a in aus_l){
        au(a,0)
    }
    move_face(t)
}

/*
Sets all AUs to One and moves to it.
t - time to move in milliseconds
*/
function oneFace(t){
    for(a in aus_l){
       au(a,1.0)
    }
    move_face(t)
}

/*
zeros an array of aus, and moves to the face.
to_zero - an array of integers representing the number of the aus to zero
t -  time to move to the face (in milliseconds)
*/
function zero_aus(to_zero, t){
    for(a in to_zero){
  au(to_zero[a],0)
    }
    move_face(t)
}

/*
Same as above, but it does not move the face.
*/
function zero_aus_no_move(to_zero){
    for(a in to_zero){
      au(to_zero[a],0)
    }
}

/*
Calculates the positions of all the facial features based on the current value of all the aus
t - float representing the milliseconds it should take to move to the current AU set
notViseme - flag to determine if the movement is a viseme. If it is, we only will modify the mouth shape
*/
function move_face(t, notViseme){
    if(notViseme == undefined){
      notViseme = true
    }

    if(notViseme){
      // ***** BROWS ***** (AU 1, 2, 4)
      lbrow = getPart("lbrow")
      rbrow = getPart("rbrow")

      var max_x = lbrow.idleControlPoint.x1/2
      var max_y = lbrow.idle_pos.y/3

      lInner = {x:lbrow.idleControlPoint.x2, y:lbrow.idleControlPoint.y2}
      rInner = {x:rbrow.idleControlPoint.x2, y:rbrow.idleControlPoint.y2}

      lInner.y -= max_y * (0.5*aus_l[1] + .1*aus_l[2] - .3*aus_l[4])
      lInner.x -= max_x * (0.15*aus_l[1] + 0.5*aus_l[4])
      rInner.y -= max_y * (0.5*aus_r[1] + .1*aus_r[2] - .3*aus_r[4])
      rInner.x += max_x * (0.15*aus_r[1]  + 0.5*aus_r[4])

      lMid = {x:lbrow.idleControlPoint.x1, y:lbrow.idleControlPoint.y1}
      rMid = {x:rbrow.idleControlPoint.x1, y:rbrow.idleControlPoint.y1}

      lMid.y -= max_y * (0.1*aus_l[1] + .6*aus_l[2] - 0.2*aus_l[4])
      lMid.x -= max_x * (aus_l[1] + -0.3*aus_l[2] + aus_l[4])
      rMid.y -= max_y * (0.1*aus_r[1] + .6*aus_r[2]  - 0.2*aus_r[4])
      rMid.x += max_x * (aus_r[1] + -0.3*aus_r[2] + aus_r[4])

      lOuter = {x:lbrow.idleControlPoint.x0, y:lbrow.idleControlPoint.y0}
      rOuter = {x:rbrow.idleControlPoint.x0, y:rbrow.idleControlPoint.y0}

      lOuter.y -= max_y * (0.5*aus_l[2] + 0.1*aus_l[4])
      lOuter.x -= max_x * (-.2*aus_l[2]  + 0.2*aus_l[4])
      rOuter.y -= max_y * (0.5*aus_r[2] + 0.1*aus_r[4])
      rOuter.x += max_x * (-.2*aus_r[2]  + 0.2*aus_l[4])


      rBrow = {x0:rOuter.x,y0:rOuter.y , x1:rMid.x,y1:rMid.y , x2:rInner.x,y2:rInner.y}
      lBrow = {x0:lOuter.x,y0:lOuter.y , x1:lMid.x,y1:lMid.y , x2:lInner.x,y2:lInner.y}

      rbrow.interpolateBrows(rBrow, t);
      lbrow.interpolateBrows(lBrow, t);

      // ***** EYELIDS ******
      // closure = -.5
      // urlid = getPart("urlid");
      // ullid = getPart("ullid");
      // lrlid = getPart("lrlid");
      // lllid = getPart("lllid");
      //
      //
      // // eyelid flattening (au 7)
      // lid_flattenr = .6*aus_r[7]
      // lid_flattenl = .6*aus_l[7]
      //
      // lrlid.scale({y:lrlid.idle_scale.y*(1-lid_flattenr)},t);
      // lllid.scale({y:lllid.idle_scale.y*(1-lid_flattenl)},t);
      //
      // // eyelid closing (aus 5,7,43)
      urlid_p = urlid.idle_pos.y;
      lrlid_p = lrlid.idle_pos.y;
      ullid_p = ullid.idle_pos.y;
      lllid_p = lllid.idle_pos.y;
      // lid_width = ullid.idle_size.x/4;
      //
      var eyeSize = getPart('reye').size

      r_eye_width = eyeSize //(urlid_p-lrlid_p)+urlid.threedee.scale.y*lid_width+lrlid.threedee.scale.y*lid_width;
      l_eye_width = eyeSize //(ullid_p-lllid_p)+ullid.threedee.scale.y*lid_width+lllid.threedee.scale.y*lid_width;
      //
      // //[-.5,0]
      openr = -.5 * aus_r[5]
      openl = -.5 * aus_l[5]
      //
      // //[0,.6]
      closer = .6 * aus_r[7]
      closel = .6 * aus_l[7]
      //
      // //[-.5,1]

      //
      urlid.pos({y:urlid_p+ r_eye_width/1.8*(aus_r[43]) + r_eye_width/4 * openr},t);
      lrlid.pos({y:lrlid_p-r_eye_width/1.8*(aus_r[43]) - r_eye_width/4 * closer},t);
      ullid.pos({y:ullid_p+l_eye_width/1.8*(aus_l[43]) + l_eye_width/4 * openl},t);
      lllid.pos({y:lllid_p-l_eye_width/1.8*(aus_l[43]) - l_eye_width/4 * closel },t);

      // ***** NOSE *****

      // nose wrinkle (raise) (au 9)
      wrinkle_dist = 30*aus_l[9];
      nose = getPart("nose");
      nose.pos({y:nose.idle_pos.y+wrinkle_dist}, t);

      // nose width (aus 38,39)
      width_scale = 1+.35*aus_l[38]-.35*aus_l[39];
      nose = getPart("nose");
      // nose.scale({x:nose.idle_scale.x*width_scale}, t);

    }

    // ***** MOUTH *****
    ulip=getPart("ulip");
    llip=getPart("llip");

    max_up_dist = (nose.idle_pos.y-ulip.idle_pos.y)/1.5
    max_down_dist = (nose.idle_pos.y-llip.idle_pos.y)/1.5
    max_x_variation = (ulip.idleControlPoint.x0 - ulip.idleControlPoint.x3) / 4; //should be width divided by 2 I think

    lcorner = {x:ulip.idleControlPoint.x0, y:ulip.idleControlPoint.y0}
    rcorner = {x:ulip.idleControlPoint.x3, y:ulip.idleControlPoint.y3}

    lcorner.x += max_x_variation*(.2*aus_l[12] + .05*aus_l[13] + .25*aus_l[14] -.1*aus_l[26] -.3*aus_l[27] +.35*aus_l[17]-.7*aus_l[18] + .25*aus_l[20] -.2*aus_l[23] -.1*aus_l[24])/1.1
    lcorner.y += max_down_dist*(-.2*aus_l[25] -.2*aus_l[26] + .7*aus_l[13]-1.5*aus_l[15]-.5*aus_l[27] - .2*aus_l[20] -.3*aus_l[23] -.5*aus_l[24])/3.4
    rcorner.x -= max_x_variation*(.2*aus_r[12] + .05*aus_r[13] + .25*aus_r[14]-.1*aus_r[26] -.3*aus_r[27] +.35*aus_r[17]-.7*aus_r[18] + .25*aus_r[20] -.2*aus_r[23] -.1*aus_r[24])/1.1
    rcorner.y += max_down_dist*(-.2*aus_r[25] -.2*aus_r[26] + .7*aus_r[13]-1.5*aus_r[15]-.5*aus_r[27] - .2*aus_r[20] -.3*aus_r[23] -.5*aus_r[24])/3.4


    upperl = {x:ulip.idleControlPoint.x1, y:ulip.idleControlPoint.y1}
    upperr = {x:ulip.idleControlPoint.x2, y:ulip.idleControlPoint.y2}

    upperl.x += max_x_variation*(.55*aus_l[10] + .25*aus_l[14]-.4*aus_l[18]+ .25*aus_l[20] -.1*aus_l[23])/1.05
    upperl.y += max_up_dist*(.1*aus_l[25] +.3*aus_l[26] +.6*aus_l[27] + .55*aus_l[10]+.35*aus_l[17])/2.2
    upperr.x -= max_x_variation*(.55*aus_r[10] + .25*aus_r[14]-.4*aus_r[18] + .25*aus_r[20] -.1*aus_r[23])/1.05
    upperr.y += max_up_dist*(.1*aus_r[25] +.3*aus_r[26] +.6*aus_r[27] + .55*aus_r[10]+.35*aus_r[17])/2.2


    lowerl = {x:llip.idleControlPoint.x1, y:llip.idleControlPoint.y1}
    lowerr = {x:llip.idleControlPoint.x2, y:llip.idleControlPoint.y2}

    lowerl.x += max_x_variation*(.25*aus_l[14] + .5*aus_l[16] + .2*aus_l[26]-.4*aus_l[18]+ .25*aus_l[20] -.2*aus_l[23])/1.05
    lowerl.y += max_down_dist*(-.4*aus_l[25] -.7*aus_l[26] -1.6*aus_l[27]+ .55*aus_l[10] -.2*aus_l[16] +.45*aus_l[17])/2.2
    lowerr.x -= max_x_variation*(.25*aus_r[14] + .5*aus_r[16] + .2*aus_r[26]-.4*aus_r[18] + .25*aus_r[20] -.2*aus_r[23])/1.05
    lowerr.y += max_down_dist*(-.4*aus_r[25] -.7*aus_r[26] -1.6*aus_r[27] + .55*aus_r[10] -.2*aus_r[16] +.45*aus_r[17])/2.2

    upperLip = {x3:rcorner.x,y3:rcorner.y, x2:upperr.x,y2:upperr.y, x1:upperl.x,y1: upperl.y , x0:lcorner.x,y0:lcorner.y}
    lowerLip = {x3:rcorner.x,y3:rcorner.y, x2:lowerr.x,y2:lowerr.y, x1:lowerl.x,y1: lowerl.y , x0:lcorner.x,y0:lcorner.y}


    ulip.interpolateLips(upperLip, t);
    llip.interpolateLips(lowerLip, t);
}

/*
Sets the AUs for the respective viseme.
viseme_name - a string that explains the viseme
t - a float to represent the time to move the face to the new position
*/
function viseme(viseme_name, t){
    console.log("Viseme: " + viseme_name)
    switch(viseme_name){

    // --------------- CONSONANTS ---------------------//

    // M,B,P -> My, Buy, Pie
    case 'BILABIAL':
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(23, .75)
    au(14, .25)
    au(24, .7)

    move_face(t, false)
    break;

    // F,V -> oFFer, Vest
    case "LABIODENTAL":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(10,0.5);
    au(20,0.4);
    au(25,.8);

    move_face(t, false)
    break;

    // TH, TH - THin, THis
    case "INTERDENTAL":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(10,.6)
    au(18,.75)
    au(25,.5)

    move_face(t, false)
    break;

    // L,T,D,Z,S,N -> Light, Top, DaD, Zebra, Sad, Nope
    case "DENTAL_ALVEOLAR":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(25,.65)

    move_face(t, false)
    break;

    // R,SH,ZH,CH -> Red, SHould, aSia, CHart
    case "POSTALVEOLAR":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(10, .75)
    au(18, 1)
    au(25, 1)

    move_face(t, false)
    break;

    // K,G,NG -> Cat, Game, thiNG
    case "VELAR_GLOTTAL":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(10,.6)
    // au(18,.5)
    au(26,.5)

    move_face(t, false)
    break;

    // ------------------ VOWELS ------------------------//
    // EE, I -> flEEce, bIt
    case "CLOSE_FRONT_VOWEL":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(26,1)
    au(20,1)
    au(10,.4)
    move_face(t, false)
    break;

    // OO -> bOOt
    case "CLOSE_BACK_VOWEL":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(10,.5)
    au(13,.8)
    au(16,.6)
    au(18,1)
    au(23,1)
    au(24,1)
    au(25,1)
    au(26,.4)

    move_face(t, false)

    break;

    // schwa -> ArenA
    case "MID_CENTRAL_VOWEL":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(26, 1)
    au(25, .5)
    au(23,1)

    move_face(t, false)
    break;

    // AE,AU,A,AY,EH -> trAp, mOUth, fAther, fAce, drEss
    case "OPEN_FRONT_VOWEL":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(14, 1)
    au(20, 1)
    au(25, .7)
    au(26, .75)

    move_face(t, false)
    break;

    // AW,OI,O -> thOUght, chOIce, gOAt
    case "OPEN_BACK_VOWEL":
    zero_aus_no_move([10,13,14,16,18,20,23,24,25,26,27])
    au(26, .5)
    au(27, 1)

    move_face(t, false)
    break;

    case "IDLE":
    zeroFace(t)
    break;
    }
}

/*
Create a new face part object that tracks the metadata for the THREE.Object3D, which is the part that is actually drawn.
Lip objects are created with a different constructor that enables control points rather than scale, rotate, translate
name - a string that represents the name of the face part
x - float representing x offset
y - float representing y offset
z - float representing z offset
*/
function facePart(name, group, x, y){
    this.name = name;
    this.idle_pos = {x:x, y:y};
    this.idle_rot = 0;
    this.idle_scale = 1;
    //below MUST be set after assembling the part
    this.idle_size = {x:0, y:0, z:0};

    this.group = group
    this.group.translation.set(x,y)

    this.group.id = name
    parts.push(this)
    // scene.add(this.threedee)
    this.rot = function(goal, t){
        TWEEN.remove(this.group.rotation);

        var goal = goal;
        var target = this.group.rotation;
        var tween = new TWEEN.Tween(target, {override:true}).to(goal,t);
        tween.easing(TWEEN.Easing.Quadratic.InOut);
        tween.start();
    }

    this.pos = function(goal, t){
      TWEEN.remove(this.group.translation);

      var goal = goal;
      var target = this.group.translation;
      var tween = new TWEEN.Tween(target, {override:true}).to(goal,t);
      tween.easing(TWEEN.Easing.Quadratic.InOut);
      tween.start();
    }

    this.scale = function(goal, t){
      TWEEN.remove(this.group.scale);

      var goal = goal;
      var target = this.group.scale;
      var tween = new TWEEN.Tween(target, {override:true}).to(goal,t);
      tween.easing(TWEEN.Easing.Quadratic.InOut);
      tween.start();
    }

}


/*
initializes the eye objects. Handles the placement within the facePart reference frame.
Eyes are spheres with circular irises, circular pupils and a circular catchlight (the white shine)
TODO: put the cat pupils in I guess
*/
function addEyes(white_color, iris_color, size, height, separation, iris_size, pupil_scale, eye_shine){

    function makeEyeGroup(){
      var iris = two.makeCircle(0, 0, iris_size);
      var pupil = two.makeCircle(0, 0, iris_size * pupil_scale);
      var eyeShine = two.makeCircle( - iris_size*pupil_scale/2 ,  - iris_size*pupil_scale/1.6, iris_size * pupil_scale / 3);


      iris.fill = iris_color
      iris.stroke = 'None'
      pupil.fill = 'black'
      if(eye_shine){
        return two.makeGroup(iris,pupil,eyeShine)
      } else {
        return two.makeGroup(iris,pupil)
      }
      
    }

    var x_adj = two.width/2// (separation)//*(size/camera_depth);
    var y_adj = two.height/2//height //* (size/camera_depth);

  reyewhite = two.makeCircle(x_adj + separation/2, y_adj-height, size);
  reyewhite.fill = white_color
  reyewhite.stroke = 'None'

  reye = new facePart("reye", makeEyeGroup(), x_adj + separation/2, y_adj-height)//-(separation/2)-x_adj, y_adj);
  reye.separation = separation
  reye.size = size


  leyewhite = two.makeCircle(x_adj - separation/2, y_adj-height, size);
  leyewhite.fill = white_color
  leyewhite.stroke = 'None'

  leye = new facePart("leye", makeEyeGroup(), x_adj - separation/2, y_adj-height);
  leye.separation = separation
  leye.size = size
}

/*
Adds the lid objects. These are actually very large rectangles with a "U" cutout.
Blinking moves them in the y direction.
*/
function addLids(color, width, height, arch){
  //make the shape for an upper lid (basically a big rectunguloid with a u-shaped cutout)
    function makeUpperLidGroup(){
      var curve = two.makeCurve(-1.1*width, -2*width, -1.1*width, -1*width,-1.1*width, 0,-1.1*width, width, -width,width,      -width/2, width/2, width/2, width/2,     width, width, 1.1*width, width,1.1*width, 0, 1.1*width, -1*width, 1.1*width, -2*width)
      curve.fill = color
      curve.stroke = 'None'
      return two.makeGroup(curve)
    }

    var leye = getPart("leye");
    var reye = getPart("reye");

    var xl = leye.group.translation.x
    var xr = reye.group.translation.x

    var y = reye.group.translation.y - height //+ (camera_depth*leye.threedee.position.y/(camera_depth-leye.threedee.position.z));

    ullid = new facePart("ullid", makeUpperLidGroup(), xl,y)

    urlid = new facePart("urlid",makeUpperLidGroup(), xr,y)

    //make the shapes for the lower lid (same as upper lid, but in reverse, and with two rectangles to stop sharp corners)
    function makeLowerLidGroup(){
      var curve = two.makeCurve(1.1*width, 2*width, 1.1*width, 1*width,1.1*width, 0,1.1*width, -width, width,-width,    width/2, -width/2, -width/2, -width/2,      -width, -width, -1.1*width, -width,-1.1*width, 0, -1.1*width, 1*width, -1.1*width, 2*width)
      var rect = two.makeRectangle(-0.9*width,-width, width/3, 2*width)
      var rect2 = two.makeRectangle(0.9*width,-width, width/3, 2*width)
      rect.fill = color
      rect2.fill = color
      curve.fill = color
      curve.stroke = 'None'
      rect.stroke = 'None'
      rect2.stroke = 'None'
      return two.makeGroup(rect, rect2, curve)
    }

    y = reye.group.translation.y + height

    lllid = new facePart("lllid", makeLowerLidGroup(), xl,y)

    lrlid = new facePart("lrlid",makeLowerLidGroup(), xr,y)
}

/*
Initializes the nose object. Its shape is an upside down triangle of size width and height
*/
function addNose(color, x, y, width, height){
    var xc = width/2;
    var yc = height/2

    function makeNoseGroup(){
      var triangle = two.makePath(-xc,yc , xc,yc , 0,-yc , -xc,yc)
      triangle.fill = color
      triangle.stroke = 'None'
      return two.makeGroup(triangle)
    }

    nose = new facePart("nose", makeNoseGroup(), windowHalfX + x, windowHalfY - y);

}

/*
Adds both brow objects. The brows are controlled by three points and taper at the ends
TODO: add a parameter for the height of the brow arch
*/
function addBrows(color, width, height, thickness, innerSize){

    function makeBrowGroup(side){
      var sign = side == 'left' ? -1 : 1
      var browCurve = two.makeCurve( sign*width,0, sign*width/8,-0.75*thickness , -sign*width, thickness, true)
      browCurve.fill = 'None'
      browCurve.linewidth = thickness
      browCurve.stroke = color
      browCurve.cap = 'round'
      
      // var keypoint_color = '#e8cd25'
      // kp1 = two.makeCircle(sign*width,0, 30);
      // kp1.fill = 'transparent'; // Set fill to transparent
      // kp1.stroke = keypoint_color; // Set stroke color (you can change it to any color you prefer)
      // kp1.linewidth = 1; 

      // kp2 = two.makeCircle(sign*width/8,-0.75*thickness, 30);
      // kp2.fill = 'transparent'; // Set fill to transparent
      // kp2.stroke = keypoint_color; // Set stroke color (you can change it to any color you prefer)
      // kp2.linewidth = 10; 

      // kp3 = two.makeCircle(-sign*width, thickness, 30);
      // kp3.fill = 'transparent'; // Set fill to transparent
      // kp3.stroke = keypoint_color; // Set stroke color (you can change it to any color you prefer)
      // kp3.linewidth = 20; 

      // return two.makeGroup(browCurve, kp1,kp2,kp3)
      return two.makeGroup(browCurve)
    }

    function getIdleCoords(side){
      var sign = side == 'left' ? 1 : -1
      return {x0:-sign*width,y0:thickness , x1:sign*width/8,y1:-0.75*thickness , x2:sign*width, y2:0}
    }

    function interpolateBrows(goal, t){
      TWEEN.remove(this.currentControlPoint);
      var goal = goal;
      var target = this.currentControlPoint;
      var tween = new TWEEN.Tween(target, {override:true}).to(goal,t);
      tween.easing(TWEEN.Easing.Quadratic.InOut);
      var browInfo = this.group.children[0]
      // var kp1 = this.group.children[1]
      // var kp2 = this.group.children[2]
      // var kp3 = this.group.children[3]
      tween.onUpdate(function() {

            browInfo.vertices[0].x = this.x0
            browInfo.vertices[0].y = this.y0

            browInfo.vertices[1].x = this.x1
            browInfo.vertices[1].y = this.y1

            browInfo.vertices[2].x = this.x2
            browInfo.vertices[2].y = this.y2

            // kp1.translation.x = this.x0
            // kp1.translation.y = this.y0

            // kp2.translation.x = this.x1
            // kp2.translation.y = this.y1

            // kp3.translation.x = this.x2
            // kp3.translation.y = this.y2
      });
      tween.start();
    }

    var leye = getPart("leye");
    var reye = getPart("reye");

    var xl = leye.group.translation.x
    var xr = reye.group.translation.x

    var y = reye.group.translation.y - height

    lbrow = new facePart("rbrow", makeBrowGroup('left'), xl, y)
    lbrow.idleControlPoint = getIdleCoords('left')
    lbrow.currentControlPoint = getIdleCoords('left')
    lbrow.interpolateBrows = interpolateBrows

    rbrow = new facePart("lbrow", makeBrowGroup('right'), xr, y);
    rbrow.idleControlPoint = getIdleCoords('right')
    rbrow.currentControlPoint = getIdleCoords('right')
    rbrow.interpolateBrows = interpolateBrows
}

/*
Initializes the mouth object, which consists of two lip objects.
The lip objects each consist of 4 control points: two mouth corners and two intermediate control points.
The lips share the same lip corners
*/
function addMouth(color, x, y, width, height, thickness, opening, dimple_size, ulip_h_scale, llip_h_scale){

    function makeLipGroup(){
      var lipCurve = two.makeCurve(width/2,0 , width/8,height , -width/8,height , -width/2,0 , true)
      lipCurve.fill = 'None'
      lipCurve.linewidth = thickness
      lipCurve.stroke = color
      lipCurve.cap = 'round'

      // var keypoint_color = '#e8cd25'
      // kp1 = two.makeCircle(width/2,0, 30);
      // kp1.fill = 'transparent'; // Set fill to transparent
      // kp1.stroke = keypoint_color; // Set stroke color (you can change it to any color you prefer)
      // kp1.linewidth = 10; 

      // kp2 = two.makeCircle(width/8,height, 30);
      // kp2.fill = 'transparent'; // Set fill to transparent
      // kp2.stroke = keypoint_color; // Set stroke color (you can change it to any color you prefer)
      // kp2.linewidth = 10; 

      // kp3 = two.makeCircle(-width/8,height, 30);
      // kp3.fill = 'transparent'; // Set fill to transparent
      // kp3.stroke = keypoint_color; // Set stroke color (you can change it to any color you prefer)
      // kp3.linewidth = 10; 

      // kp4 = two.makeCircle(-width/2,0, 30);
      // kp4.fill = 'transparent'; // Set fill to transparent
      // kp4.stroke = keypoint_color; // Set stroke color (you can change it to any color you prefer)
      // kp4.linewidth = 10; 

      // return two.makeGroup(lipCurve, kp1,kp2,kp3,kp4)
      return two.makeGroup(lipCurve)
    }

    function interpolateLips(goal, t){
      TWEEN.remove(this.currentControlPoint);

      var goal = goal;
      var target = this.currentControlPoint;
      var tween = new TWEEN.Tween(target, {override:true}).to(goal,t);
      tween.easing(TWEEN.Easing.Quadratic.InOut);
      var mouthInfo = this.group.children[0]

      // var kp1 = this.group.children[1]
      // var kp2 = this.group.children[2]
      // var kp3 = this.group.children[3]
      // var kp4 = this.group.children[4]

      tween.onUpdate(function() {
            mouthInfo.vertices[0].x = this.x0
            mouthInfo.vertices[0].y = this.y0

            mouthInfo.vertices[1].x = this.x1
            mouthInfo.vertices[1].y = this.y1

            mouthInfo.vertices[2].x = this.x2
            mouthInfo.vertices[2].y = this.y2

            mouthInfo.vertices[3].x = this.x3
            mouthInfo.vertices[3].y = this.y3

            // kp1.translation.x = this.x0
            // kp1.translation.y = this.y0

            // kp2.translation.x = this.x1
            // kp2.translation.y = this.y1

            // kp3.translation.x = this.x2
            // kp3.translation.y = this.y2

            // kp4.translation.x = this.x3
            // kp4.translation.y = this.y3
      });
      tween.start();
    }

    llip = new facePart('llip', makeLipGroup(), windowHalfX + x, windowHalfY - y)
    llip.idleControlPoint = {x0:width/2,y0:0 , x1:width/5,y1:height , x2:-width/5,y2:height , x3:-width/2,y3:0}
    llip.currentControlPoint = {x0:width/2,y0:0 , x1:width/5,y1:height , x2:-width/5,y2:height , x3:-width/2,y3:0}
    llip.interpolateLips = interpolateLips

    ulip = new facePart('ulip', makeLipGroup(), windowHalfX + x, windowHalfY - y)
    ulip.idleControlPoint = {x0:width/2,y0:0 , x1:width/5,y1:height , x2:-width/5,y2:height , x3:-width/2,y3:0}
    ulip.currentControlPoint = {x0:width/2,y0:0 , x1:width/5,y1:height , x2:-width/5,y2:height , x3:-width/2,y3:0}
    ulip.interpolateLips = interpolateLips

}

/*
returns the part from the list of parts in the scene based on name.
*/
function getPart(name){
    for(i in parts){
  if(parts[i].name==name){
      return parts[i];
  }
    }
    return null;
}

/*
looks at a given point in the x,y,z space
x,y,z - floats representing to coordinates of the point to look at
t - float representing time to move to the location
*/
function lookat(x,y,z,t){
    //console.log("Looking at: " + x + "," + y + "," + z)

    var leye = getPart("leye")

    var ygoal = leye.idle_pos.y - (y * leye.size) / z
    var xoffset = (leye.size*(leye.separation/2 + x))/(Math.sqrt(Math.pow(z,2) + Math.pow(leye.separation/2 + x,2)))
    var xgoal = leye.idle_pos.x + xoffset


    leye.pos({x: xgoal, y:ygoal}, t);

    var reye = getPart("reye")

    xoffset = (reye.size*(reye.separation/2 - x))/(Math.sqrt(Math.pow(z,2) + Math.pow(reye.separation/2 - x,2)))
    xgoal = reye.idle_pos.x - xoffset
    //ygoal is same for both eyes

    reye.pos({x: xgoal, y:ygoal}, t);
}

// for looking at things IRL; use avg velocity rather than time
// velocity is in radians/sec
function lookat_real_world(realx,realy,realz,vel){
    x = realx/cm_per_px;
    y = realy/cm_per_px;
    z = realz/cm_per_px;


    var leye = getPart("leye")

    var ygoal = leye.idle_pos.y - (y * leye.size) / z
    var lxoffset = (leye.size*(leye.separation/2 + x))/(Math.sqrt(Math.pow(z,2) + Math.pow(leye.separation/2 + x,2)))
    var lxgoal = leye.idle_pos.x + lxoffset




    var reye = getPart("reye")

    var rxoffset = (reye.size*(reye.separation/2 - x))/(Math.sqrt(Math.pow(z,2) + Math.pow(reye.separation/2 - x,2)))
    var rxgoal = reye.idle_pos.x - rxoffset
    //ygoal is same for both eyes
    var t = Math.max(Math.abs(rxoffset/vel), Math.abs(lxoffset/vel), Math.abs((y * leye.size) / z))

    leye.pos({x: lxgoal, y:ygoal}, t);
    reye.pos({x: rxgoal, y:ygoal}, t);
}


/*
function to perform idle animation, which consists of looking around the room at random
*/
function doIdle(){

    var d = new Date();
    var now = d.getTime();
    if(poked){
      if(now-poke_end >= 0){
          zeroFace(poke_time/2)
          poked=false
      }
    }

    if(blinking){
      if(now-blink_end >= 0){
          au(43, 0)
          move_face(blink_time/2)
          blinking=false
      }
    }
    if((Math.floor((Math.random() * 500))==0 && now-last_blink > 2000)|| now-last_blink > 8000){
      blink(300);
      last_blink = now;
    }


    if(!looking){
    var xrange = windowHalfX;
    var yrange = windowHalfY;
    var zrange = 1000;

    if((Math.floor((Math.random() * 500))==0 && now-last_gaze > 2000)|| now-last_gaze > 5000){
        var xgoal = -xrange/2 + Math.floor((Math.random() * xrange));
        var ygoal = -yrange/2 + Math.floor((Math.random() * yrange));
        var zgoal = 2000;
        lookat(xgoal,ygoal,zgoal, 700);
        last_gaze = now
    }
    }
}


function blink(t){
    au(43, 1.0);
    move_face(t/2)
    blink_time=t

    d = new Date()
    blink_end = d.getTime()+t/2;
    blinking=true
}

function animate(){

  if (typeof gui === "undefined" && new Date().getTime() > lockIdleUntil){
    doIdle();
  }

  check_and_play_visemes()
  TWEEN.update();

  //print_elapsed()
  //set_time()
}


/*
Puckers the lips, blinks and raises the nose
*/
function doPoke(){
    poke_time=600
    au(9,1);
    au(43,1);
    au(18,1);
    au(2,1)
    move_face(300)

    d = new Date()
    poke_end = d.getTime()+500;
    poked=true;
}


function onWindowResize() {

    //TODO: make this look good

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    two.width = window.innerWidth
    two.height = window.innerHeight

}

function onDocumentMouseMove( event ) {
/**
    mouseX = event.clientX - windowHalfX;

    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
    //update_goal((event.clientX)/100)
**/
}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    //document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    //document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    //document.addEventListener( 'mouseout', onDocumentMouseOut, false );

    mouseX = event.clientX - windowHalfX;
    mouseY = windowHalfY - event.clientY;
    clickOrTouch(mouseX, mouseY)

}

function clickOrTouch( x, y) {
  console.log('click')
  if (typeof gui === "undefined"){
    //don't do the poke animation if the  gui is up or else dragging the controllers makes the poke happen
    doPoke();
  }
    lookat_real_world(0, 0, 60, 1.7);
}


function onDocumentMouseUp( event ) {
/**
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
**/
}

function onDocumentMouseOut( event ) {
/**
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
**/
}

function onDocumentTouchStart( event ) {
/**
    if ( event.touches.length == 1 ) {

  event.preventDefault();

  mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
  update_goal((event.touches[ 0 ].pageX)/100)
  targetRotationOnMouseDown = targetRotation;

    }
**/
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = windowHalfY - event.touches[0].pageY;
    clickOrTouch(mouseX, mouseY)


}

function onDocumentTouchMove( event ) {
/**
    if ( event.touches.length == 1 ) {

  event.preventDefault();

  mouseX = event.touches[ 0 ].pageX - windowHalfX;
  update_goal((event.touches[ 0 ].pageX)/100)
  targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

    }
**/
}