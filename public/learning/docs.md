CSS Animations Complete Cheatsheet
Part 1: @keyframes - The Animation Blueprint
Basic Structure
css@keyframes your-animation-name {
  0% {
    /* Properties at the START of animation */
  }
  100% {
    /* Properties at the END of animation */
  }
}
What each part means:

@keyframes = "I'm defining an animation"
your-animation-name = Name it whatever you want (no spaces)
0% = Beginning of animation (can also use from)
100% = End of animation (can also use to)

Multiple Keyframes Example
css@keyframes bounce-ball {
  0% {
    top: 0px;           /* Ball starts at top */
    transform: scale(1); /* Normal size */
  }
  50% {
    top: 200px;         /* Ball hits bottom */
    transform: scale(1.2); /* Squished bigger */
  }
  100% {
    top: 0px;           /* Ball back at top */
    transform: scale(1); /* Normal size again */
  }
}
Alternative Syntax (from/to)
css@keyframes fade-in {
  from {
    opacity: 0;  /* Invisible */
  }
  to {
    opacity: 1;  /* Fully visible */
  }
}

Part 2: animation Property - Making It Happen
Basic Usage
css.my-element {
  animation: animation-name duration;
}

/* Example */
.my-box {
  animation: bounce-ball 2s;
}
All Animation Properties (The Full Syntax)
css.my-element {
  animation: name duration timing-function delay iteration-count direction fill-mode play-state;
}
Or write them separately:
css.my-element {
  animation-name: bounce-ball;
  animation-duration: 2s;
  animation-timing-function: ease-in-out;
  animation-delay: 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-fill-mode: forwards;
  animation-play-state: running;
}

Part 3: Animation Properties Explained
animation-name
cssanimation-name: bounce-ball;  /* Must match your @keyframes name */
animation-name: none;         /* No animation */
animation-duration
cssanimation-duration: 2s;      /* 2 seconds */
animation-duration: 500ms;   /* 500 milliseconds */
animation-duration: 0.5s;    /* Half a second */
animation-timing-function (How it moves)
cssanimation-timing-function: linear;        /* Constant speed */
animation-timing-function: ease;          /* Slow-fast-slow (DEFAULT) */
animation-timing-function: ease-in;       /* Starts slow */
animation-timing-function: ease-out;      /* Ends slow */
animation-timing-function: ease-in-out;   /* Slow start AND end */
animation-timing-function: steps(4);      /* Jumpy, 4 distinct steps */
animation-delay
cssanimation-delay: 0s;      /* Start immediately (DEFAULT) */
animation-delay: 1s;      /* Wait 1 second before starting */
animation-delay: -0.5s;   /* Start halfway through animation */
animation-iteration-count
cssanimation-iteration-count: 1;        /* Play once (DEFAULT) */
animation-iteration-count: 3;        /* Play 3 times */
animation-iteration-count: infinite; /* Play forever */
animation-iteration-count: 2.5;      /* Play 2.5 times */
animation-direction
cssanimation-direction: normal;     /* 0% → 100% (DEFAULT) */
animation-direction: reverse;    /* 100% → 0% */
animation-direction: alternate;  /* 0% → 100% → 0% → 100%... */
animation-direction: alternate-reverse; /* 100% → 0% → 100% → 0%... */
animation-fill-mode (What happens when animation stops)
cssanimation-fill-mode: none;      /* Back to original state (DEFAULT) */
animation-fill-mode: forwards;  /* Stay at final keyframe (100%) */
animation-fill-mode: backwards; /* Start at first keyframe (0%) even during delay */
animation-fill-mode: both;      /* Both forwards AND backwards */
animation-play-state
cssanimation-play-state: running; /* Playing (DEFAULT) */
animation-play-state: paused;  /* Frozen in place */

Part 4: Common Animation Patterns
Fade In
css@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-element {
  animation: fade-in 1s ease-out;
}
Slide In From Left
css@keyframes slide-in-left {
  from { 
    transform: translateX(-100%); 
    opacity: 0;
  }
  to { 
    transform: translateX(0); 
    opacity: 1;
  }
}

.slide-element {
  animation: slide-in-left 0.5s ease-out;
}
Bounce
css@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-30px);
  }
  70% {
    transform: translateY(-15px);
  }
  90% {
    transform: translateY(-4px);
  }
}

.bounce-element {
  animation: bounce 1s ease-in-out;
}
Spin/Rotate
css@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 2s linear infinite;
}
Pulse (Growing and Shrinking)
css@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.pulse-element {
  animation: pulse 1s ease-in-out infinite;
}
Shake
css@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.shake-element {
  animation: shake 0.5s ease-in-out;
}

Part 5: Multiple Animations
Apply Multiple Animations to One Element
css.multi-animated {
  animation: 
    fade-in 1s ease-out,
    slide-up 1s ease-out,
    pulse 2s ease-in-out infinite;
}

Part 6: Animation Properties You Can Animate
Position & Movement
css/* Position */
left, right, top, bottom

/* Transform (PREFERRED - better performance) */
transform: translateX(100px);   /* Move horizontally */
transform: translateY(50px);    /* Move vertically */
transform: translate(100px, 50px); /* Move both directions */
Size & Scale
css/* Size */
width, height

/* Transform Scale (PREFERRED) */
transform: scale(1.5);      /* 150% size */
transform: scaleX(2);       /* Double width only */
transform: scaleY(0.5);     /* Half height only */
Rotation
csstransform: rotate(45deg);     /* Rotate 45 degrees */
transform: rotateX(90deg);    /* 3D rotation on X axis */
transform: rotateY(180deg);   /* 3D rotation on Y axis */
Colors
csscolor                /* Text color */
background-color     /* Background color */
border-color        /* Border color */
Transparency
cssopacity: 0;    /* Invisible */
opacity: 0.5;  /* Semi-transparent */
opacity: 1;    /* Fully visible */
Other Properties
cssbox-shadow          /* Drop shadows */
text-shadow         /* Text shadows */
border-radius       /* Rounded corners */
filter: blur(5px);  /* Visual effects */

Part 7: Performance Tips
✅ GOOD (Hardware Accelerated)
css/* Use these for smooth animations */
transform: translateX()
transform: translateY()
transform: scale()
transform: rotate()
opacity
filter
❌ AVOID (Causes Repaints)
css/* These can be choppy */
left, right, top, bottom
width, height
margin, padding

Part 8: Quick Examples
Button Hover Effect
css@keyframes button-hover {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

.button:hover {
  animation: button-hover 0.2s ease-out forwards;
}
Loading Spinner
css@keyframes loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner {
  animation: loading-spin 1s linear infinite;
}
Modal Slide In
css@keyframes modal-slide-in {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal {
  animation: modal-slide-in 0.3s ease-out;
}

Part 9: Debugging Animations
Common Issues & Solutions
Animation doesn't start:

Check spelling of animation name
Make sure @keyframes matches animation-name exactly
Verify element has the animation property

Animation is choppy:

Use transform instead of changing left/top/width/height
Add will-change: transform to the element

Animation happens too fast/slow:

Adjust animation-duration

Animation only happens once but you want it to repeat:

Add animation-iteration-count: infinite

Element snaps back after animation:

Add animation-fill-mode: forwards


Part 10: Browser Support
Modern browsers: All modern browsers support CSS animations
Prefix needed for older browsers:
css@-webkit-keyframes bounce {
  /* keyframes here */
}

.element {
  -webkit-animation: bounce 1s;
  animation: bounce 1s;
}