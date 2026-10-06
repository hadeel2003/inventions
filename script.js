(function(){
  var $=function(i){return document.getElementById(i)};
  var env=$('env'),bf=$('bf'),hint=$('hint'),rp=$('replay'),T=[],busy=false;
  function at(ms,fn){T.push(setTimeout(fn,ms))}
  function show(id,on){$(id).classList.toggle('on',on)}
  function play(){
    if(busy)return;busy=true;hint.style.opacity=0;music.start();
    env.classList.add('open');
    at(500,function(){bf.classList.add('out')});
    at(900,function(){env.classList.add('gone')});
    at(2400,function(){bf.classList.add('calm')});
    at(2200,function(){show('s1',true)});
    at(5200,function(){show('s1',false)});
    at(6200,function(){show('s2',true)});
    at(9600,function(){show('s2',false)});
    at(10600,function(){show('s3',true);rp.style.opacity=1});
  }
  function reset(){
    T.forEach(clearTimeout);T=[];busy=false;
    ['s1','s2','s3'].forEach(function(i){show(i,false)});
    bf.classList.remove('out','calm');env.classList.remove('open','gone');
    hint.style.opacity=1;rp.style.opacity=0;
  }

  var music=(function(){
    var ctx,master,timer,step=0,next=0,on=true,started=false;
    var m=function(n){return 440*Math.pow(2,(n-69)/12)};
    var bars=[[60,64,67,72,76,72,67,64],[55,59,62,67,71,67,62,59],[57,60,64,69,72,69,64,60],[53,57,60,65,69,65,60,57]];
    var mel=[[76,79],[74,71],[72,76],[69,72]];
    function note(f,t,d,v){
      [[f,'triangle',1],[f*2,'sine',.35]].forEach(function(o){
        var os=ctx.createOscillator(),g=ctx.createGain();
        os.type=o[1];os.frequency.value=o[0];
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*o[2],t+.01);
        g.gain.exponentialRampToValueAtTime(.0001,t+d);
        os.connect(g);g.connect(master);os.start(t);os.stop(t+d+.05);
      });
    }
    function sched(){
      var eighth=60/72/2;
      while(next<ctx.currentTime+.6){
        var bar=Math.floor(step/8)%4,i=step%8;
        note(m(bars[bar][i]),next,1.6,.16);
        if(i===0)note(m(bars[bar][0]-12),next,2.8,.12);
        if(i===0)note(m(mel[bar][0]),next,2.2,.14);
        if(i===4)note(m(mel[bar][1]),next,2.2,.12);
        next+=eighth;step++;
      }
    }
    return{
      start:function(){
        if(started)return;started=true;
        try{
          var AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();
          master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
          var dl=ctx.createDelay();dl.delayTime.value=.34;var fb=ctx.createGain();fb.gain.value=.38;
          var wet=ctx.createGain();wet.gain.value=.5;
          master.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(ctx.destination);
          master.gain.linearRampToValueAtTime(.7,ctx.currentTime+3);
          next=ctx.currentTime+.1;sched();timer=setInterval(sched,150);
          document.getElementById('mute').style.opacity=1;
        }catch(e){}
      },
      toggle:function(){
        if(!ctx)return;on=!on;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(on?.7:0,ctx.currentTime+.4);
        document.getElementById('mute').classList.toggle('off',!on);
      },
      pause:function(h){if(!ctx)return;h?ctx.suspend():ctx.resume()}
    };
  })();
  $('mute').addEventListener('click',music.toggle);
  document.addEventListener('visibilitychange',function(){music.pause(document.hidden)});
  env.addEventListener('click',play);
  rp.addEventListener('click',reset);
})();
      
