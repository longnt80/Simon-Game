$(document).ready(function(){
   var AudioContext = window.AudioContext || window.webkitAudioContext || false;
   
   if(!AudioContext) {

      // Sorry, but the game won't work for you
      alert('Sorry, but the Web Audio API is not supported by your browser.'
            + ' Please, consider downloading the latest version of '
            + 'Google Chrome or Mozilla Firefox');

   }
   else {
      var winLevel = 10;
      // var audioContext = new AudioContext();
      var mouseTarget; // To detect the mouse down target

      var theBtn = $('button.color');
      var onOffBtn = $('button#onOff');
      var startBtn = $('button#start');
      var strictBtn = $('button#strict');
      var display = $('.screen span');
      // console.log(theBtn[0]);
      
      var mouseClickable = 0; // 0: unclickable; 1: clickable
      var mouseDown = 0;
      var onOff = 0; // 0: OFF; 1: ON
      // var gameState = 0 // 0: not started; 1: started
      var strict = 0 // 0: not stricted; 1: strict mode
      var playList = [];
      var playListCopy = [];
      var wrong = 0; // 1: player click the wrong button
      var timeoutID;
      var count = 0;
      
      function logging() {
         console.log({playList,playListCopy,onOff,mouseClickable,strict,wrong});
      }
      // logging();


      // Array for sound
      var freqArr = ["329.63","261.63","220","164.81"]

      var sound = {

         ctx: new AudioContext(),
         play: function() {
            this.osc = this.ctx.createOscillator();
            // For volume control
            this.gain = this.ctx.createGain();
            //Connecting nodes together in this order: source (oscillator)-gain node-destination
            this.osc.connect(this.gain);
            this.gain.connect(this.ctx.destination);

            // Oscillator settings
            this.osc.type = this.shape;
            this.osc.frequency.value = this.freq;

            // Volume setting
            this.gain.gain.value = 0.1; // default volume
            this.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.00999);


            this.osc.start(this.ctx.currentTime);
         },
         stop: function() {
            this.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.015); // Ease the sound out when the sound stops
            // gain.gain.setTargetAtTime(0, context.currentTime, 0.015);
            this.osc.stop(this.ctx.currentTime + 0.02);
         }
      }

      var btnSound = Object.create(sound);
      btnSound.shape = 'sine';

      var errSound = Object.create(sound);
      errSound.shape = 'triangle';
      errSound.freq = '329.63';
      
      //***************************************************************************************************************************************
      // FUNCTIONS
      //***************************************************************************************************************************************
      // Generate random number in a range
      function randomRange(max,min) {
         return Math.round(Math.random() * (max - min) + min);
      }

      function playErr() {
         console.log('Error');
         errSound.play();
         wrong = 1;
         mouseClickable = 0;
         display.html('--').addClass('blink');
         timeoutID = setTimeout(function() {
            errSound.stop();
            display.removeClass('blink');
            timeoutID = setTimeout(function() {
               if (strict==1) {
                  playList = [];
                  wrong = 0;
               }
               playTones();
            },1500);
         },1000);
      }

      function setTimeLimit() {
         mouseClickable = 1;
         console.log('Start time limit');
         // logging();
         timeoutID = setTimeout(function() {
            playErr();
         },5000);
      }

      function playTones(index) {
         // debugger;
         index = index || 0;
         var toneDuration = 200;
         var temple = (index==0) ? (1500) : (200);
         mouseClickable = 0;
         function playRandomNote() {
            let random = randomRange(3,0);
            console.log('Play a random num: ', random);
            playList.push(random);
            $(theBtn[random]).addClass('active');
            btnSound.freq = freqArr[random];
            btnSound.play();
            timeoutID = setTimeout(function(){
               $(theBtn[random]).removeClass('active');
               btnSound.stop();
               playListCopy = playList.slice();
               setTimeLimit();
            },toneDuration);
         }


         if (wrong==0) {
            display.text( (playList.length+1<10) ? ('0' + (playList.length+1).toString()) : (playList.length+1) );
            // console.log(display.text());
         }
         else if (wrong==1) {
            display.text( (playList.length<10) ? ('0' + (playList.length).toString()) : (playList.length) );
            // console.log(display.text());
         }
         timeoutID = setTimeout(function(){
            if (index == 0) { display.addClass('blink'); }
            
            timeoutID = setTimeout(function() {
               display.removeClass('blink');

               if (playList.length == 0) {
                  playRandomNote();
               }
               else if (index == playList.length) {
                  if ( wrong==0 ) {
                     playRandomNote();
                  }
                  else if ( wrong==1 ) {
                     playListCopy = playList.slice();
                     setTimeLimit();
                  }
               }
               else if (playList.length != 0 && index < playList.length) {
                  var btn = $(theBtn[playList[index]]);
                  btnSound.freq = freqArr[playList[index]];
                  
                  btn.addClass('active');
                  btnSound.play();
                  console.log('Play the list: ');

                  timeoutID = setTimeout(function(){
                     btn.removeClass('active');
                     btnSound.stop();
                     playTones(index + 1);                  
                  },toneDuration);
               }
               
               // console.log(playList);
               // logging();
               
            },temple);
         },100);
                  
      }
      
      //***************************************************************************************************************************************
      // DOMS
      //***************************************************************************************************************************************
      theBtn
         .on('mousedown touchstart', function(e){
            e.preventDefault();
            if (mouseClickable == 0) {
               return;
            }
            else {
            clearTimeout(timeoutID);
               if ($(this).val() == playListCopy[0]) {
                  wrong = 0;
                  btnSound.freq = freqArr[$(this).val()];
                  btnSound.play();
                  // console.log(btnSound.gain);
                  $(this).addClass('active');
                  mouseDown = 1;
                  console.log({mouseDown});
                  mouseTarget = this;
               }
               else if ($(this).val() != playListCopy[0]) {
                  playErr();
               }
            console.log('mousedown');
            console.log({wrong});
            console.log(e.target);
            }
            // logging();
         })
         .on('mouseup touchend',function(e){
            if (mouseClickable == 0 || mouseDown == 0 || e.target !== mouseTarget) {
               return;
            }
            else {
               console.log('mouseup');
               // if ($(this).val() == playListCopy[0]) {
                  wrong = 0;
                  playListCopy.shift();
                  btnSound.stop();
                  $(this).removeClass('active');
                  if (playListCopy.length > 0) {
                     setTimeLimit();
                  }
                  else if (playListCopy.length == 0) {
                     mouseClickable = 0;
                     if (playList.length==winLevel) {
                        display.text('--').addClass('blinkInfi');
                        timeoutID = setTimeout(function() {
                           display.text('reset').removeClass('blinkInfi').addClass('marquee');
                           timeoutID = setTimeout(function() {
                              display.removeClass('marquee').text('--').addClass('blink');
                              mouseClickable = 0;
                              playList = [];
                              wrong = 0;
                              theBtn.removeClass('active');
                              if (btnSound.gain) {btnSound.stop();}
                              if (errSound.gain) {errSound.stop();}
                              timeoutID = setTimeout(function() {
                                 display.removeClass('blink');
                                 playTones();
                              },1000);
                           },3000);
                           
                        },2000)
                     }
                     else {
                        display.text('--').addClass('blink');
                        timeoutID = setTimeout(function() {
                           display.removeClass('blink');
                           playTones();
                        },1500);
                     }
                  }
               // }
               mouseDown = 0;
            }
            // logging();
         });
      

      $(document).on('mouseup', function(e) {
         console.log(e.target);
         console.log(mouseTarget);
         if (e.target !== mouseTarget) {
            $(mouseTarget).trigger(e.type);
         }
      });
            
      
      onOffBtn.add(strictBtn).add(startBtn).on('click',function(e){
         e.preventDefault();
         if ($(this).attr('id') == "onOff" || $(this).attr('id') == "strict") {
            
            
            if ($(this).attr('id') == "onOff") {
               if (onOff === 1) {
                  onOff = 0;
                  clearTimeout(timeoutID);                  
                  display.text('').removeAttr('class');
                  mouseClickable = 0;
                  strict = 0;
                  if (btnSound.gain) {btnSound.stop();}
                  if (errSound.gain) {errSound.stop();}
                  playList = [];
                  theBtn.removeClass('active');
                  strictBtn.add(startBtn).removeClass('on');
               }
               else if (onOff === 0) {
                  onOff = 1;
                  display.text("let's play").addClass('marquee');
               }
               // logging();
               
            }
            else if ($(this).attr('id') == "strict") {
               if (onOff === 1) {
                  strict = (strict === 0) ? 1 : 0;
               }
               else {
                  return;
               }
               // logging();
            }
            $(this).toggleClass('on');
         }

         // Action for START BUTTON
         else if ($(this).attr('id') == "start") {
            if (onOff === 0) {
               return;
            }
            else {
               clearTimeout(timeoutID);
               mouseClickable = 0;
               playList = [];
               wrong = 0;
               theBtn.removeClass('active');
               if (btnSound.gain) {btnSound.stop();}
               if (errSound.gain) {errSound.stop();}
               display.removeClass('marquee blinkInfi').text('--').addClass('blink');
               // display.removeClass('marquee blinkInfi').text('--').addClass('blink').delay(1000).promise().done(function(){
               //    display.removeClass("blink").delay(100).promise().done(playTones);
               // });
               timeoutID = setTimeout(function() {
                  display.removeClass('blink');
                  playTones();
               },1000);
            }
            // logging();
         }
         
      });
      
      
      startBtn.on('mousedown touchstart',function(e){
         e.preventDefault();
         if (onOff === 0) {
               return;
         }
         else {
            $(this).addClass('on');
         }
      }).on('mouseup touchend',function(){
         $(this).removeClass('on');
      });
      
   }
   
});