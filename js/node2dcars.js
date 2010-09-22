var box2d = require("./box2d/box2d");
Object.extend = require("./box2d/object.extend").extend;
var sys = require("sys");

// DEMO BASE
function createWorld() {
	var worldAABB = new box2d.b2AABB();
	worldAABB.minVertex.Set(-1000, -1000);
	worldAABB.maxVertex.Set(1000, 1000);
	var gravity = new box2d.b2Vec2(0, 300);
	var doSleep = true;
	var world = new box2d.b2World(worldAABB, gravity, doSleep);
	createGround(world);
	createBox(world, 0, 225, 10, 250);
	createBox(world, 600, 225, 10, 250);
	return world;
}

function createGround(world) {
	var groundSd = new box2d.b2BoxDef();
	groundSd.extents.Set(1200, 50);
	groundSd.restitution = 0.5;
	groundSd.friction = 0.3;
	var groundBd = new box2d.b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(-600, 440);
	return world.CreateBody(groundBd)
}

function createBall(world, x, y) {
	var ballSd = new box2d.b2CircleDef();
	ballSd.density = 1.0;
	ballSd.radius = 20;
	ballSd.restitution = 0.6;
	ballSd.friction = 0.4;
	var ballBd = new box2d.b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	return world.CreateBody(ballBd);
}

function createBox(world, x, y, width, height, fixed) {
	if (typeof(fixed) == 'undefined') fixed = true;
	var boxSd = new box2d.b2BoxDef();
	boxSd.restitution = 0.6;
	boxSd.friction = .3;
	if (!fixed) boxSd.density = 1.0;
	boxSd.extents.Set(width, height);
	var boxBd = new box2d.b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	return world.CreateBody(boxBd)
}

var demos = {};
demos.InitWorlds = [];

// CRANK JS
demos.crank = {};
demos.crank.initWorld = function(world) {
	var ground = world.m_groundBody;

	// Define crank.
	var sd = new box2d.b2BoxDef();
	sd.extents.Set(5, 25);
	sd.density = 1.0;

	var bd = new box2d.b2BodyDef();
	bd.AddShape(sd);
	
	var rjd = new box2d.b2RevoluteJointDef();

	var prevBody = ground;

	bd.position.Set(600/2, 300);
	var body = world.CreateBody(bd);

	rjd.anchorPoint.Set(600/2, 325);
	rjd.body1 = prevBody;
	rjd.body2 = body;
	rjd.motorSpeed = -1.0 * Math.PI;
	rjd.motorTorque = 500000000.0;
	rjd.enableMotor = true;
	world.CreateJoint(rjd);

	prevBody = body;

	// Define follower.
	sd.extents.Set(5, 45);
	bd.position.Set(600/2, 230);
	body = world.CreateBody(bd);

	rjd.anchorPoint.Set(600/2, 275);
	rjd.body1 = prevBody;
	rjd.body2 = body;
	rjd.enableMotor = false;
	world.CreateJoint(rjd);

	prevBody = body;

	// Define piston
	sd.extents.Set(20, 20);
	bd.position.Set(600/2, 185);
	body = world.CreateBody(bd);

	rjd.anchorPoint.Set(600/2, 185);
	rjd.body1 = prevBody;
	rjd.body2 = body;
	world.CreateJoint(rjd);

	var pjd = new box2d.b2PrismaticJointDef();
	pjd.anchorPoint.Set(600/2, 185);
	pjd.body1 = ground;
	pjd.body2 = body;
	pjd.axis.Set(0.0, 1.0);
	pjd.motorSpeed = 0.0; // joint friction
	pjd.motorForce = 100000.0;
	pjd.enableMotor = true;

	world.CreateJoint(pjd);

	// Create a payload
	sd.density = 2.0;
	bd.position.Set(600/2, 50);
	world.CreateBody(bd);
}
demos.InitWorlds.push(demos.crank.initWorld);

//  DEMOS.JS
var initId = 0;
var world = createWorld();
var ctx = null;
var currBuffer = 0;

var canvasWidth;
var canvasHeight;
var canvasTop;
var canvasLeft;

function setupWorld(did) {
	if (!did) did = 0;
	world = createWorld();
	initId += did;
	initId %= demos.InitWorlds.length;
	if (initId < 0) initId = demos.InitWorlds.length + initId;
	demos.InitWorlds[initId](world);
}
function setupNextWorld() { setupWorld(1); }
function setupPrevWorld() { setupWorld(-1); }

var frames = 0;
var lastTime = (new Date()).getTime();
var lastFrameTime = (new Date()).getTime();
var stepSize = 1;
var delayAvg = 0;
var maxStepSize = 40;
var missedFrames = 11;
var targetFPS = 30;
var timeStep = 1.0/targetFPS;
var lastDelay = timeStep * 1000;
function step() {

	world.Step(timeStep, Math.round(stepSize));

  if ((delayAvg > 0) || (missedFrames > 5)) {


	for (var j = world.m_jointList; j; j = j.m_next) {
//		drawJoint(j, context);
//        sys.log(j.m_body1.m_position.x+', '+j.m_body1.m_position.y+' - '+j.m_body2.m_position.x+', '+j.m_body2.m_position.y);
	}
	for (var b = world.m_bodyList; b; b = b.m_next) {
//        sys.log('body'+b.m_position.y);
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
	        sys.log('body'+s.m_position.x+', '+s.m_position.y);
//			drawShape(s, context, b);
		}
	}
//    drawWorld(world, ctx);
    missedFrames = 0;
    frames += 1;
    if ((targetFPS < 30) && (delayAvg > 10)) {
      targetFPS++;
      timeStep = 1/targetFPS;
    }
  } else {
    missedFrames += 1;
    if (missedFrames > 3) {
      targetFPS--;
      targetFPS = (targetFPS < 25) ? 25 : targetFPS;
      timeStep = 1/targetFPS;
    }
  }

  // double buffered svg : switch the buffers here
  // ctx.svg.change(ctx.buffers[currBuffer], {'visiblity': 'visible'});
  // currBuffer++;
  // currBuffer %= 2;
  // ctx.svg.change(ctx.buffers[currBuffer], {'visiblity': 'hidden'});


  var currTime = (new Date()).getTime();
  if ((currTime - lastTime) >= 1000) {
//    jQuery('#fpsText').text(world.m_bodyCount + " bodies. " + frames);
//    jQuery('#stepSize').text(stepSize.toFixed(1));

    lastTime = currTime;

    if (frames > (targetFPS + 2)) {
      stepSize+=0.1;
      stepSize = (stepSize > maxStepSize) ? maxStepSize : stepSize;
    } else if (frames < (targetFPS - 2)) {
      if ((targetFPS - frames) > 5) {
        stepSize-=2;
      } else {
        stepSize-=0.1;
      }
      stepSize = (stepSize < 1) ? 1 : stepSize;
    }

//    jQuery('#delayVal').text((delayAvg / frames).toFixed(1));
    frames = 0;
    delayAvg = 0.001;
  } 
  var delay = (stepSize * timeStep * 1000) - (currTime - lastFrameTime);
  delay = (delay + lastDelay) / 2;
  lastDelay = delay;

  delayAvg += delay;
  lastFrameTime = currTime;
  
  setTimeout(step, (delay > 0) ? delay : 0);
}

/*
function initBuffers(svgContext) {
  ctx.buffers[0] = svgContext.group('buffer1');
  // ctx.buffers[1] = svgContext.group('buffer2', {'visibility':'hidden'});
}
*/
setupWorld();

step();

