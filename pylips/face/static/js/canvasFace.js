// Track active interpolation goals for each action unit
const activeGoals = {};
var looking = false

// Face parameters
const params = {
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
    nose_vertical_position: -40,
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

// Face state with only action units
const faceState = {
    AU1L: 0,
    AU1R: 0,
    AU2L: 0,
    AU2R: 0,
    AU3L: 0,
    AU3R: 0,
    AU4L: 0,
    AU4R: 0,
    AU5L: 0,
    AU5R: 0,
    AU6L: 0,
    AU6R: 0,
    AU7L: 0,
    AU7R: 0,
    AU8L: 0,
    AU8R: 0,
    AU9L: 0,
    AU9R: 0,
    AU10L: 0,
    AU10R: 0,
    AU11L: 0,
    AU11R: 0,
    AU12L: 0,
    AU12R: 0,
    AU13L: 0,
    AU13R: 0,
    AU14L: 0,
    AU14R: 0,
    AU15L: 0,
    AU15R: 0,
    AU16L: 0,
    AU16R: 0,
    AU17L: 0,
    AU17R: 0,
    AU18L: 0,
    AU18R: 0,
    AU19L: 0,
    AU19R: 0,
    AU20L: 0,
    AU20R: 0,
    AU21L: 0,
    AU21R: 0,
    AU22L: 0,
    AU22R: 0,
    AU23L: 0,
    AU23R: 0,
    AU24L: 0,
    AU24R: 0,
    AU25L: 0,
    AU25R: 0,
    AU26L: 0,
    AU26R: 0,
    AU27L: 0,
    AU27R: 0,
    AU43L: 0,
    AU43R: 0,
    lookAtX: 0,
    lookAtY: 0,
    lookAtZ: 2000
};


/*

Face Drawing Functions

*/
function interpolateSpline(ctx, points, thickness, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round'; // Set the line cap style to round

    // Validate the input
    if (points.length !== 6 && points.length !== 8) {
        throw new Error("Invalid number of points: use either 3 points (6 values) or 4 points (8 values)");
    }

    const numPoints = points.length / 2;

    // Begin the path
    ctx.beginPath();

    // Loop through control points
    for (let i = 0; i < numPoints - 1; i++) {
        const p0 = [points[i * 2], points[i * 2 + 1]]; // Point i
        const p1 = [points[(i + 1) * 2], points[(i + 1) * 2 + 1]]; // Point i+1

        // Calculate tangents for p0 and p1
        let tangent0, tangent1;

        if (i === 0) {
            // For the first point, average with the next point
            tangent0 = [(p1[0] - p0[0]) / 2, (p1[1] - p0[1]) / 2];
        } else {
            tangent0 = [(p1[0] - points[(i - 1) * 2]) / 2, (p1[1] - points[(i - 1) * 2 + 1]) / 2];
        }

        if (i === numPoints - 2) {
            // For the last point, average with the previous point
            tangent1 = [(p1[0] - p0[0]) / 2, (p1[1] - p0[1]) / 2];
        } else {
            tangent1 = [(points[(i + 2) * 2] - p0[0]) / 2, (points[(i + 2) * 2 + 1] - p0[1]) / 2];
        }

        // Draw the Hermite curve segment
        const steps = 16; // Number of interpolation steps
        for (let t = 0; t <= 1; t += 1 / steps) {
            const t2 = t * t;
            const t3 = t2 * t;

            // Cubic Hermite spline formula
            const x = (2 * t3 - 3 * t2 + 1) * p0[0] +
                (t3 - 2 * t2 + t) * tangent0[0] +
                (-2 * t3 + 3 * t2) * p1[0] +
                (t3 - t2) * tangent1[0];

            const y = (2 * t3 - 3 * t2 + 1) * p0[1] +
                (t3 - 2 * t2 + t) * tangent0[1] +
                (-2 * t3 + 3 * t2) * p1[1] +
                (t3 - t2) * tangent1[1];

            if (t === 0) {
                ctx.moveTo(x, y); // Move to the first point
            } else {
                ctx.lineTo(x, y);
            }
        }
    }

    // Stroke the path
    ctx.stroke();
}









// Helper function to create an eye with lookAt feature
function drawEye(side, params, faceState, ctx) {

    const eyeCenter = (side === 'L') ? params.leftEyeCenter : params.rightEyeCenter;
    const { lookAtX, lookAtY, lookAtZ } = faceState;
    const dir = (side === 'L') ? 1 : -1;

    // Calculate the offset for the iris based on lookAt coordinates
    const dx = dir * (params.eye_size * (params.eye_separation / 2 + dir * lookAtX)) / (Math.sqrt(Math.pow(lookAtZ, 2) + Math.pow(params.eye_separation / 2 + dir * lookAtX, 2)))
    const dy = - (lookAtY * params.eye_size) / lookAtZ

    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = params.eye_size - params.iris_size;
    const irisOffsetX = (dist > maxDist) ? (dx / dist) * maxDist : dx;
    const irisOffsetY = (dist > maxDist) ? (dy / dist) * maxDist : dy;

    // Draw the white part of the eye (eyeball)
    ctx.fillStyle = params.eyeball_color;
    ctx.beginPath();
    ctx.arc(eyeCenter.x, eyeCenter.y, params.eye_size, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the iris
    ctx.fillStyle = params.iris_color;
    ctx.beginPath();
    ctx.arc(eyeCenter.x + irisOffsetX, eyeCenter.y + irisOffsetY, params.iris_size, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the pupil
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(
        eyeCenter.x + irisOffsetX,
        eyeCenter.y + irisOffsetY,
        params.iris_size * params.pupil_scale,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // Draw the eye shine
    if (params.eye_shine) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
            eyeCenter.x + irisOffsetX - (params.iris_size * params.pupil_scale) / 2,
            eyeCenter.y + irisOffsetY - (params.iris_size * params.pupil_scale) / 1.6,
            params.iris_size * params.pupil_scale / 3,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

// Helper function to draw eyelids
function drawLids(side, params, faceState, ctx) {

    const eyeCenter = (side === 'L') ? params.leftEyeCenter : params.rightEyeCenter;

    let cx = eyeCenter.x;
    let cy = eyeCenter.y;

    const AU5 = faceState[`AU5${side}`];
    const AU7 = faceState[`AU7${side}`];
    const AU43 = faceState[`AU43${side}`];

    // Adjust the upper eyelid
    cy_upper = cy - 0.15 * params.eye_size * AU5 + 0.8 * params.eye_size * AU43;
    // Upper lid
    ctx.fillStyle = params.background_color;
    ctx.beginPath();
    ctx.moveTo(cx - params.eye_size, cy_upper);
    ctx.quadraticCurveTo(cx - params.eye_size * 0.75, cy_upper - params.eye_size * 0.5, cx, cy_upper - params.eye_size * 0.5);
    ctx.quadraticCurveTo(cx + params.eye_size * 0.75, cy_upper - params.eye_size * 0.5, cx + params.eye_size, cy_upper);
    ctx.lineTo(cx + params.eye_size, cy_upper - 2.5 * params.eye_size);
    ctx.lineTo(cx - params.eye_size, cy_upper - 2.5 * params.eye_size);
    ctx.closePath();
    ctx.fill();

    // Adjust the lower eyelid
    cy_lower = cy - 0.2 * params.eye_size * AU7 - 0.8 * params.eye_size * AU43;
    ctx.fillStyle = params.background_color;
    ctx.beginPath();
    ctx.moveTo(cx - params.eye_size, cy_lower);
    ctx.quadraticCurveTo(cx - params.eye_size * 0.75, cy_lower + params.eye_size * 0.5, cx, cy_lower + params.eye_size * 0.5);
    ctx.quadraticCurveTo(cx + params.eye_size * 0.75, cy_lower + params.eye_size * 0.5, cx + params.eye_size, cy_lower);
    ctx.lineTo(cx + params.eye_size, cy_lower + 2.5 * params.eye_size);
    ctx.lineTo(cx - params.eye_size, cy_lower + 2.5 * params.eye_size);
    ctx.closePath();
    ctx.fill();


    // Add Two Rectangles on Lower Lid
    const rectWidth = params.eye_size / 10;
    const rectHeight = params.eye_size;

    const rect1_x = cx - params.eye_size;
    const rect1_y = cy_lower - params.eye_size / 2;
    ctx.fillRect(rect1_x, rect1_y, rectWidth, rectHeight); // Draw the first rectangle

    const rect2_x = cx + params.eye_size - rectWidth;
    const rect2_y = cy_lower - params.eye_size / 2;
    ctx.fillRect(rect2_x, rect2_y, rectWidth, rectHeight); // Draw the second rectangle

}

function drawBrows(side, params, faceState, ctx) {
    const dir = (side === 'L') ? -1 : 1;
    const cx = params.canvas_width / 2 + dir * params.eye_separation / 2
    const cy = params.canvas_height / 2 - params.brow_height;

    points = [cx - dir * params.brow_width, cy + .7 * params.brow_thickness,
    cx - dir * params.brow_width / 8, cy,
    cx + dir * params.brow_width, cy + 1.2 * params.brow_thickness];
    
    //inner, middle, outer
    points[0] -= .05 * params.eye_separation * dir * (faceState[`AU1${side}`] + 1.3 * faceState[`AU4${side}`]);
    points[1] -= 2 * params.brow_thickness * (faceState[`AU1${side}`] - .7 * faceState[`AU4${side}`]);
    points[2] -= .05 * params.eye_separation * dir * (-.7 * faceState[`AU2${side}`] + 1 * faceState[`AU4${side}`]);
    points[3] -= 2 * params.brow_thickness * (.05 * faceState[`AU1${side}`] + .7 * faceState[`AU2${side}`] - .4 * faceState[`AU4${side}`]);
    points[4] -= .05 * params.eye_separation * dir * (-.7 * faceState[`AU2${side}`]);
    points[5] -= 2 * params.brow_thickness * (.6 * faceState[`AU2${side}`]);
    // Draw the brow
    interpolateSpline(ctx, points, params.brow_thickness, params.brow_color);
}

function drawNose(params, faceState, ctx) {
    const cx = params.canvas_width / 2;
    const cy = params.canvas_height / 2 + params.nose_vertical_position;

    ctx.fillStyle = params.nose_color;
    ctx.beginPath();
    ctx.moveTo(cx - params.nose_width / 2, cy - faceState.AU9L * params.nose_height/4);
    ctx.lineTo(cx + params.nose_width / 2, cy - faceState.AU9R * params.nose_height/4);
    ctx.lineTo(cx, cy - params.nose_height - .5*(faceState.AU9L + faceState.AU9R) * params.nose_height/8);
    ctx.closePath();
    ctx.fill();
}


// Helper function to draw the mouth
function drawMouth(params, faceState, ctx) {
    const cx = params.canvas_width / 2;
    const cy = params.canvas_height / 2 + params.mouth_y;

    upperLipPoints = [
        cx - params.mouth_width / 2, cy,   // Left corner
        cx - params.mouth_width / 6, cy + params.mouth_height,   // Left control point
        cx + params.mouth_width / 6, cy + params.mouth_height,   // Right control point
        cx + params.mouth_width / 2, cy    // Right corner
    ];

    lowerLipPoints = [
        cx - params.mouth_width / 2, cy,   // Left corner
        cx - params.mouth_width / 6, cy + params.mouth_height,   // Left control point
        cx + params.mouth_width / 6, cy + params.mouth_height,   // Right control point
        cx + params.mouth_width / 2, cy    // Right corner
    ];

    max_up_dist = params.mouth_height * 2.25;
    max_down_dist = params.mouth_height * 2.25;
    max_x_variation = params.mouth_width / 4;

    // Left and right corners adjustments
    lcorner_x = max_x_variation * (-0.2 * faceState.AU12L - 0.05 * faceState.AU13L - 0.25 * faceState.AU14L + 0.1 * faceState.AU26L + 0.3 * faceState.AU27L - 0.35 * faceState.AU17L + 0.75 * faceState.AU18L - 0.25 * faceState.AU20L + 0.2 * faceState.AU23L + 0.1 * faceState.AU24L) / 1.1;
    lcorner_y = max_down_dist * (0.2 * faceState.AU25L + 0.2 * faceState.AU26L - 0.7 * faceState.AU13L + 1.5 * faceState.AU15L + 0.5 * faceState.AU27L + 0.2 * faceState.AU20L + 0.3 * faceState.AU23L + 0.5 * faceState.AU24L) / 3.4;

    rcorner_x = -max_x_variation * (-0.2 * faceState.AU12R - 0.05 * faceState.AU13R - 0.25 * faceState.AU14R + 0.1 * faceState.AU26R + 0.3 * faceState.AU27R - 0.35 * faceState.AU17R + 0.75 * faceState.AU18R - 0.25 * faceState.AU20R + 0.2 * faceState.AU23R + 0.1 * faceState.AU24R) / 1.1;
    rcorner_y = max_down_dist * (0.2 * faceState.AU25R + 0.2 * faceState.AU26R - 0.7 * faceState.AU13R + 1.5 * faceState.AU15R + 0.5 * faceState.AU27R + 0.2 * faceState.AU20R + 0.3 * faceState.AU23R + 0.5 * faceState.AU24R) / 3.4;

    upperLipPoints[0] += lcorner_x; // Adjust left corner
    upperLipPoints[1] += lcorner_y;
    upperLipPoints[6] += rcorner_x; // Adjust right corner
    upperLipPoints[7] += rcorner_y;

    lowerLipPoints[0] += lcorner_x; // Adjust left corner
    lowerLipPoints[1] += lcorner_y;
    lowerLipPoints[6] += rcorner_x; // Adjust right corner
    lowerLipPoints[7] += rcorner_y;

    // Control points adjustments
    upperLipPoints[2] += max_x_variation * (0.55 * faceState.AU10L - 0.25 * faceState.AU14L + 0.4 * faceState.AU18L - 0.25 * faceState.AU20L + 0.1 * faceState.AU23L) / 1.05;
    upperLipPoints[3] += max_up_dist * (-0.1 * faceState.AU25L - 0.3 * faceState.AU26L - 0.6 * faceState.AU27L - 0.55 * faceState.AU10L - 0.35 * faceState.AU17L) / 2.2;
    upperLipPoints[4] -= max_x_variation * (0.55 * faceState.AU10R - 0.25 * faceState.AU14R + 0.4 * faceState.AU18R - 0.25 * faceState.AU20R + 0.1 * faceState.AU23R) / 1.05;
    upperLipPoints[5] += max_up_dist * (-0.1 * faceState.AU25R - 0.3 * faceState.AU26R - 0.6 * faceState.AU27R - 0.55 * faceState.AU10R - 0.35 * faceState.AU17R) / 2.2;

    lowerLipPoints[2] += max_x_variation * (-0.25 * faceState.AU14L - 0.5 * faceState.AU16L - 0.2 * faceState.AU26L + 0.4 * faceState.AU18L - 0.25 * faceState.AU20L + 0.2 * faceState.AU23L) / 1.05;
    lowerLipPoints[3] += max_down_dist * (0.4 * faceState.AU25L + 0.7 * faceState.AU26L + 1.6 * faceState.AU27L - 0.55 * faceState.AU10L + 0.2 * faceState.AU16L - 0.45 * faceState.AU17L) / 2.2;
    lowerLipPoints[4] -= max_x_variation * (-0.25 * faceState.AU14R - 0.5 * faceState.AU16R - 0.2 * faceState.AU26R + 0.4 * faceState.AU18R - 0.25 * faceState.AU20R + 0.2 * faceState.AU23R) / 1.05;
    lowerLipPoints[5] += max_down_dist * (0.4 * faceState.AU25R + 0.7 * faceState.AU26R + 1.6 * faceState.AU27R - 0.55 * faceState.AU10R + 0.2 * faceState.AU16R - 0.45 * faceState.AU17R) / 2.2;

    // Draw the lips
    interpolateSpline(ctx, upperLipPoints, params.mouth_thickness, params.mouth_color);
    interpolateSpline(ctx, lowerLipPoints, params.mouth_thickness, params.mouth_color);
}



// Function to draw the entire face
function draw_face(params, faceState, canvas) {
    const ctx = canvas.getContext("2d");

    params['canvas_width'] = canvas.width;
    params['canvas_height'] = canvas.height;

    const leftEyeCenter = { x: canvas.width / 2 - params.eye_separation / 2, y: canvas.height / 2 - params.eye_height };
    const rightEyeCenter = { x: canvas.width / 2 + params.eye_separation / 2, y: canvas.height / 2 - params.eye_height };
    params['leftEyeCenter'] = leftEyeCenter;
    params['rightEyeCenter'] = rightEyeCenter;

    // Clear the canvas
    ctx.fillStyle = params.background_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);



    // Draw the eyes
    drawEye('L', params, faceState, ctx)
    drawEye('R', params, faceState, ctx);

    // Draw the lids
    drawLids('L', params, faceState, ctx);
    drawLids('R', params, faceState, ctx);

    // Draw the brows
    drawBrows('L', params, faceState, ctx);
    drawBrows('R', params, faceState, ctx);

    // Draw the nose
    drawNose(params, faceState, ctx);

    // Draw the mouth
    drawMouth(params, faceState, ctx);

}


/*

Canvas Functions

*/

// Function to set up the canvas
function setupCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    document.body.appendChild(canvas);
    return canvas;
}

// Function to resize the canvas and redraw the face
function resizeCanvas(canvas, params) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear the canvas and redraw the face
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    draw_face(params, faceState, canvas); // Redraw the face with the updated dimensions
}


// Function to start the face drawing process
function startFace(params) {
    const canvas = setupCanvas();

    // Initial face drawing
    draw_face(params, faceState, canvas);

    // Add event listener to handle window resizing
    window.addEventListener("resize", function () {
        resizeCanvas(canvas, params);
    });

    return canvas; // Return canvas for further use
}




/*

Animation Functions

*/
// Function to interpolate action units over time
function interpolateAUs(newGoals) {
    for (const [au, { targetValue, duration }] of Object.entries(newGoals)) {
        const initialValue = faceState[au] || 0;

        // Set active goals for interpolation with initial and target values
        activeGoals[au] = { initialValue, targetValue, duration, startTime: performance.now() };
    }
}

// Cubic ease-in-out function
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Function to update the face state based on active goals
function updateFaceState(canvas) {
    const now = performance.now();

    for (const [au, { initialValue, targetValue, duration, startTime }] of Object.entries(activeGoals)) {
        const elapsed = now - startTime;

        // Calculate the interpolation factor
        const t = Math.min(elapsed / duration, 1);
        // Apply the easing function
        const easedT = easeInOutCubic(t);

        // Interpolating directly between initial and target values
        faceState[au] = initialValue + (targetValue - initialValue) * easedT;

        // Remove the goal once the duration is complete
        if (t >= 1) {
            delete activeGoals[au];
        }
    }

    // Redraw the face with the updated state
    draw_face(params, faceState, canvas);

    // Continue updating face state
    requestAnimationFrame(() => updateFaceState(canvas));
}



/*

PyLips Callbacks

*/
function au(number, degree, side, time) {
    if (side != 'r' && side != 'R') {
        interpolateAUs({
            [`AU${number}L`]: { targetValue: parseFloat(degree), duration: time }
        });
    }
    if (side != 'l' && side != 'L') {
        interpolateAUs({
            [`AU${number}R`]: { targetValue: parseFloat(degree), duration: time }
        });
    }
}
function zero_aus(aus, t) {
    for (let i = 0; i < aus.length; i++) {
        interpolateAUs({
            [`AU${aus[i]}L`]: { targetValue: 0, duration: t },
            [`AU${aus[i]}R`]: { targetValue: 0, duration: t }
        });
    }
}

function lookat(x, y, z, time) {
    interpolateAUs({
        lookAtX: { targetValue: x, duration: time },
        lookAtY: { targetValue: y, duration: time },
        lookAtZ: { targetValue: z, duration: time }
    });
}


function viseme(viseme_name, t) {
    console.log("Viseme: " + viseme_name)
    switch (viseme_name) {

        // --------------- CONSONANTS ---------------------//

        // M,B,P -> My, Buy, Pie
        case 'BILABIAL':
            zero_aus([10, 13, 16, 18, 20, 25, 26, 27], t)
            au(23, .75, 'b', t)
            au(14, .25, 'b', t)
            au(24, .7, 'b', t)
            break;

        // F,V -> oFFer, Vest
        case "LABIODENTAL":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(10, 0.5, 'b', t)
            au(20, 0.4, 'b', t)
            au(25, .8, 'b', t)
            break;

        // TH, TH - THin, THis
        case "INTERDENTAL":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(10, .6, 'b', t)
            au(18, .75, 'b', t)
            au(25, .5, 'b', t)

            break;

        // L,T,D,Z,S,N -> Light, Top, DaD, Zebra, Sad, Nope
        case "DENTAL_ALVEOLAR":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(25, .65, 'b', t)
            break;

        // R,SH,ZH,CH -> Red, SHould, aSia, CHart
        case "POSTALVEOLAR":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(10, .75, 'b', t)
            au(18, 1, 'b', t)
            au(25, 1, 'b', t)
            break;

        // K,G,NG -> Cat, Game, thiNG
        case "VELAR_GLOTTAL":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(10, .6, 'b', t)
            // au(18,.5)
            au(26, .5, 'b', t)
            break;

        // ------------------ VOWELS ------------------------//
        // EE, I -> flEEce, bIt
        case "CLOSE_FRONT_VOWEL":
            zero_aus([ 13, 14, 16, 18, 23, 24, 25, 27], t)
            au(26, 1, 'b', t)
            au(20, 1, 'b', t)
            au(10, .4, 'b', t)
            break;

        // OO -> bOOt
        case "CLOSE_BACK_VOWEL":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(10, .5, 'b', t)
            au(13, .8, 'b', t)
            au(16, .6, 'b', t)
            au(18, 1, 'b', t)
            au(23, 1, 'b', t)
            au(24, 1, 'b', t)
            au(25, 1, 'b', t)
            au(26, .4, 'b', t)
            break;

        // schwa -> ArenA
        case "MID_CENTRAL_VOWEL":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(26, 1, 'b', t)
            au(25, .5, 'b', t)
            au(23, 1, 'b', t)
            break;

        // AE,AU,A,AY,EH -> trAp, mOUth, fAther, fAce, drEss
        case "OPEN_FRONT_VOWEL":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(14, 1, 'b', t)
            au(20, 1, 'b', t)
            au(25, .7, 'b', t)
            au(26, .75, 'b', t)
            break;

        // AW,OI,O -> thOUght, chOIce, gOAt
        case "OPEN_BACK_VOWEL":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            au(26, .5, 'b', t)
            au(27, 1, 'b', t)
            break;

        case "IDLE":
            zero_aus([10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27], t)
            break;
    }
}

function play_visemes(visemes, time_per_viseme, times) {
    for (let i = 0; i < visemes.length; i++) {
        setTimeout(() => {
            viseme(visemes[i], time_per_viseme);
        }, parseFloat(times[i])*1000 - time_per_viseme);
    }
}


/*
idle behaviors
*/

function triggerRandomInterval(minInterval, maxInterval, callback) {
    // Calculate a random time between minInterval and maxInterval
    const randomTime = Math.random() * (maxInterval - minInterval) + minInterval;

    // Set a timeout to trigger the callback after the random time
    setTimeout(() => {
        callback();

        // Recursively call the function again for the next random interval
        triggerRandomInterval(minInterval, maxInterval, callback);
    }, randomTime);
}

// gaze behavior
triggerRandomInterval(4000, 7000, () => {
    if (typeof gui === "undefined" && !looking) {
        lookat(Math.random() * 400 - 200, Math.random() * 400 - 200, 2000, 1000);
    }
});

// blink behavior
triggerRandomInterval(6000, 10000, () => {
    if (typeof gui === "undefined" && !looking) {
        au(43, 1, 'b', 200);
        setTimeout(() => {
            au(43, 0, 'b', 200);
        }, 200);
    }
});





// Start the face drawing when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
    const canvas = startFace(params); // Store the canvas for later use
    updateFaceState(canvas); // Start updating face state
});

