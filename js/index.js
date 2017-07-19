$(document).ready(function(){
   var AudioContext = window.AudioContext || window.webkitAudioContext || false;
   
   if(!AudioContext) {

      // Sorry, but the game won't work for you
      alert('Sorry, but the Web Audio API is not supported by your browser.'
            + ' Please, consider downloading the latest version of '
            + 'Google Chrome or Mozilla Firefox');

   }
   else {
      var audioContext = new AudioContext();
      var mouseTarget; // To detect the mouse down target
      
      var theBtn = $('button.color');
      var onOffBtn = $('button#onOff');
      var startBtn = $('button#start');
      var strictBtn = $('button#strict');
      var mouseClickable = 0; // 0: unclickable; 1: clickable
      // console.log(theBtn[0]);
      
      var onOff = 0; // 0: OFF; 1: ON
      // var gameState = 0 // 0: not started; 1: started
      var strict = 0 // 0: not stricted; 1: strict mode
      var playList = [];
      var playListCopy = [];
      var wrong = 0; // 1: player click the wrong button
      var playTimeout, mousedownTimeout,nextSoundTimeout,errorTimeout,startgameTimeout,ID;
      
      // Variables for sound
      var errorFreq = "329.63";
      var errorShape = 'triangle';
      var soundShape = 'sine';
      var freqArr = ["329.63","261.63","220","164.81"]
      var freq;
      var shape;

      function Sound(context) {

         var osc = null;
         var gain = null;

         this.init = function(freq,shape) {
            // Create the source of sound
            osc = context.createOscillator();
            // For volume control
            gain = context.createGain();
            //Connecting nodes together in this order: source (oscillator)-gain node-destination
            osc.connect(gain);
            gain.connect(context.destination);

            // Oscillator settings
            osc.type = shape;
            osc.frequency.value = freq;

            // Volume setting
            gain.gain.value = 0.1; // default volume
            gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.00999); // Ease the sound in when the sound starts
         }

         this.aiPlay = function(freq,shape,time) {
            this.init(freq,shape);

            osc.start(context.currentTime);
            gain.gain.setValueAtTime(1,context.currentTime + time);
            gain.gain.linearRampToValueAtTime(0.001, context.currentTime + time + 0.00999); // Ease the sound out when the sound stops
            osc.stop(context.currentTime + time + 0.1);
         }

         this.play = function(freq,shape) {
            this.init(freq,shape);

            osc.start(context.currentTime);
         }
         this.stop = function() {
            gain.gain.linearRampToValueAtTime(0.001, context.currentTime + 0.015); // Ease the sound out when the sound stops
            // gain.gain.setTargetAtTime(0, context.currentTime, 0.015);
            osc.stop(context.currentTime + 0.02);
         }   
      }
      var sound = new Sound(audioContext);
      
      //***************************************************************************************************************************************
      // FUNCTIONS
      //***************************************************************************************************************************************
      // Generate random number in a range
      function randomRange(max,min) {
         return Math.round(Math.random() * (max - min) + min);
      }

      function clearAllTimeout() {
         clearTimeout(playTimeout);
         clearTimeout(mousedownTimeout);
         clearTimeout(nextSoundTimeout);
         clearTimeout(errorTimeout);
         clearTimeout(startgameTimeout);
         clearTimeout(ID);
      }
      
      
      

      function playError() {
         errorTimeout = setTimeout(function(){
            wrong = 1;
            console.log(wrong);
            sound.aiPlay(errorFreq,errorShape,1);
            startgameTimeout = setTimeout(function(){
               playIt(0);
            },2000);
         },5000);
      }

      function playRandom() {
         var val = randomRange(3,0);
         playList.push(val);
         console.log(playList);
         playListCopy = playList.slice();
         console.log(playListCopy);
         $(theBtn[val]).addClass('active');
         sound.aiPlay(freqArr[val],soundShape,1)
         mousedownTimeout = setTimeout(function(){
            $(theBtn[val]).removeClass('active');
            mouseClickable = 1;
         },1000);
         playError();
      }

      function playIt(index) {         
            mouseClickable = 0;
            if (index >= playList.length) {
               clearTimeout(nextSoundTimeout);
               clearTimeout(mousedownTimeout);
               if (wrong === 0) {
                  playRandom();
               }
               else {
                  playListCopy = playList.slice();
                  console.log(playListCopy);
                  mouseClickable = 1;
                  playError();
               }
               
            }
            else {
               sound.aiPlay(freqArr[playList[index]],soundShape,1)
               $(theBtn[playList[index]]).addClass('active');
               mousedownTimeout = setTimeout(function(){
                  // console.log('mousedownTimeout');
                  $(theBtn[playList[index]]).removeClass('active');
                     nextSoundTimeout = setTimeout(function(){
                        // console.log('nextSoundTimeout');
                        playIt(index+1);
                     }, 2000);   
               },1000);
            }
      };
   
      
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
               let thisBtn = $(this).val();
               console.log('mousedown');
               if ($(this).val() == playListCopy[0]) {
                  playListCopy.shift();
                  console.log('correct',playListCopy);
                  freq = freqArr[$(this).val()];
                  sound.play(freq,soundShape);
                  wrong = 0;
                  clearAllTimeout();
                  
               }
               else if ($(this).val() != playListCopy[0]) {
                  console.log('wrong');
                  sound.aiPlay(errorFreq,errorShape,1);
                  wrong = 1;
                  clearAllTimeout();
                  
               }
               // console.log(this);
               // ID = setTimeout(function(){
               //    $(theBtn[thisBtn]).trigger('mouseup');
               // },1000)
               
               $(this).addClass('active');
               mouseTarget = this;   
            }
         })
         .on('mouseup touchend',function(){
            if (mouseClickable == 0) {
               return;
            }
            else {
               if (wrong == 0) {
                  console.log('mouseup');
                  sound.stop();
                  if (playListCopy.length == 0) {
                     startgameTimeout = setTimeout(function(){
                        playIt(0);
                     },2000);
                  }
                  else {
                     playError(); //Start the time limit
                  }
               }
               else {
                  mouseClickable = 0;
                  startgameTimeout = setTimeout(function(){
                     playIt(0);
                  },2000);
               }
               clearTimeout(ID);
               $(this).removeClass('active');
            }
         });
      

      $(document).on('mouseup', function(e) {
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
                  strict = 0;
                  playList = [];
                  theBtn.removeClass('active');
                  strictBtn.add(startBtn).removeClass('on');
                  mouseClickable = 0;
                  sound.stop();
                  clearAllTimeout();
               }
               else if (onOff === 0) {
                  onOff = 1;
               }
               
               console.log({onOff,strict});
               
            }
            else if ($(this).attr('id') == "strict") {
               if (onOff === 1) {
                  strict = (strict === 0) ? 1 : 0;
                  console.log({onOff,strict});
               }
               else {
                  return;
               }
            }
            $(this).toggleClass('on');
         }

         // Action for START BUTTON
         else if ($(this).attr('id') == "start") {
            if (onOff === 0) {
               return;
            }
            else {
               console.log('Reset or Start the game');
               console.log({onOff,strict});
               playList = [];
               clearAllTimeout();
               theBtn.removeClass('active');
               wrong = 0;
               mouseClickable = 0;
               startgameTimeout = setTimeout(function(){
                  playIt(0);
               },1000);
            }
            
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