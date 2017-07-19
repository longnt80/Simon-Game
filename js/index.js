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
      // var errorFreq = "329.63";
      // var errorShape = 'triangle';
      var soundShape = 'sine';
      var freqArr = ["329.63","261.63","220","164.81"]
      var freq;
      var shape;

      var sound = {

         ctx: audioContext,

         play: function(freq,shape) {
            this.osc = this.ctx.createOscillator();
            // For volume control
            this.gain = this.ctx.createGain();
            //Connecting nodes together in this order: source (oscillator)-gain node-destination
            this.osc.connect(this.gain);
            this.gain.connect(this.ctx.destination);

            // Oscillator settings
            this.osc.type = shape || 'triangle';
            this.osc.frequency.value = freq || '329.63';

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
      
      //***************************************************************************************************************************************
      // FUNCTIONS
      //***************************************************************************************************************************************
      // Generate random number in a range
      function randomRange(max,min) {
         return Math.round(Math.random() * (max - min) + min);
      }

   
      
      //***************************************************************************************************************************************
      // DOMS
      //***************************************************************************************************************************************
      theBtn
         .on('mousedown touchstart', function(e){
            e.preventDefault();
            
            
            console.log(sound);
            sound.play(freqArr[0],'sine');

            $(this).addClass('active');
            mouseTarget = this;   
         })
         .on('mouseup touchend',function(){
            console.log(sound);
            sound.stop();

            $(this).removeClass('active');
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