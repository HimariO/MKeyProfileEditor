
Array.prototype.end = function() {
  if(this.length > 0)
    return this[this.length-1]
  return undefined
}

function Pattern_frame(id, ptn) {
  this.id = id
  this.pattern = ptn

  this.keymap = undefined // pro m 6*19,  pro s 6*18 matrix.
  this.pos_onBoard = {x: 0, y:0}
  this.pos_onEditor = {x: 0, y:0}
  this.scale = {x: 1, y:1}
  this.roate = 0
  this.time = 0
  this.rgb = {r: 0, g: 0, b: 0, a:1}

  this.unchange = true // for determine includ this frame or not when processing output.
}

Pattern_frame.prototype = {
  copy: function() {
    var temp = new Pattern_frame(this.id, this.pattern)
    // temp.keymap = this.keymap
    temp.pos_onBoard.x = this.pos_onBoard.x
    temp.pos_onBoard.y = this.pos_onBoard.y
    temp.pos_onEditor.x = this.pos_onEditor.x
    temp.pos_onEditor.y = this.pos_onEditor.y
    temp.scale.x = this.scale.x
    temp.scale.y = this.scale.y
    temp.roate = this.roate
    temp.time = this.time
    temp.rgb.r = this.rgb.r
    temp.rgb.g = this.rgb.g
    temp.rgb.b = this.rgb.b
    temp.rgb.a = this.rgb.a
    temp.pattern = this.pattern
    return temp
  },
}


function Pattern(id) {
    this.id = id
    this.max_frames_id = 0
    this.type = 'static'

    this.ori_img = undefined
    this.gif_content = undefined
    this.gif_render_counter = 0
    this.img_url = ''

    this.keymap = undefined
    this.frames = [new Pattern_frame(0, this)]

    this.pos_onBoard = {x: 0, y:0}
    this.pos_onEditor = {x: 0, y:0}
    this.size = {width: 0, height:0}

    this.interact_ops = {
      'Play On': {op: 'KeyPress', operator: '=', value: "0"},
      'Init-X': {op: 'KeyPress', operator: '+', value: "0"},
      'Init-Y': {op: 'KeyPress', operator: '+', value: "0"},
      'Scale-X': {op: 'Default', operator: '', value: "0"},
      'Scale-Y': {op: 'Default', operator: '', value: "0"},
    }
    this.interact_type = 'static' //static for pattern have only one frame, ani for more than one frame.
}

Pattern.prototype = {
  setOriImg: function(url) {
    this.ori_img = new Image();
    this.ori_img.onload = ()=>{
      this.size.width = this.ori_img.width
      this.size.height = this.ori_img.height
    }

    this.ori_img.src = url
  }
}


 /* -------- none react.js zone below here -------- */


var t = [new Pattern(0), ]
var t2 = new Pattern_frame(0, t[0])
var t3 = new Pattern_frame(0, t[0])
t2.pos_onEditor = {x: 900, y: 200}
t2.time = 0
t2.unchange = false
t2.scale.x = 2
t2.scale.y = 1


t3.pos_onEditor = {x: 600, y: 100}
t3.time = 2
t3.scale.x = 2
t3.scale.y = 2
t3.unchange = false
t3.roate = 360
// t[0].frames.push(t2)
t[0].frames[0] = t2
// t[0].frames.push(t3)


function packing() {
  var static_f = []
  var ani_f = []
  var inter_f = []
  var final_frames = []

  for(var p of t){
    load_pattern_img(p.ori_img)
    var result = render(p)

    switch (result.full[0].pattern.type) {
      case 'static':
        static_f = static_f.concat(result.keymap_only)
        break

      case 'ani':
        ani_f = ani_f.concat(result.keymap_only)
        break

      case 'interact':
        var Fs_ = p.frames.map((e)=>{
          var tem = e.copy()
          tem.pattern = undefined
          return tem
        })

        inter_f.push({
          meta: {
            'interact_ops': p.interact_ops,
            'frames': Fs_,
          },
          'keymaps': result.keymap_only.map((e)=>{
            return e.keymap
          })
        })
        break
    }
  }

  static_f.sort((a, b)=>{return  a.time - b.time})
  ani_f.sort((a, b)=>{return a.time - b.time})


  if(static_f.length > 0 || ani_f.length > 0){
    var endtime = undefined
    if(static_f.end() && ani_f.end()){
      endtime = static_f.end().time > ani_f.end().time ? static_f.end().time : ani_f.end().time
    } else if(static_f.end()){
      endtime = static_f.end().time
    } else{
      endtime = ani_f.end().time
    }

    var start_time = undefined
    if(static_f[0] && ani_f[0]){
      start_time = static_f[0].time < ani_f[0].time ? static_f[0].time : ani_f[0].time
    } else if(static_f[0]){
      start_time = static_f[0].time
    } else{
      start_time = ani_f[0].time
    }

    var time_frame_char = Array(Math.floor((endtime - start_time) / (1/16)) + 1)
    for (var i = 0; i < time_frame_char.length; i++)
      time_frame_char[i] = []

    if(static_f.length > 0)
      for (var i = 0; i < time_frame_char.length; i++)
        time_frame_char[i].push(static_f[i % static_f.length].keymap)

    // for(var e of static_f)
    //   time_frame_char[Math.floor((e.time - start_time) / (1/16))].push(e.keymap)

    for(var e of ani_f) { // 'ani' frame have higher prio than 'static' one.
      time_frame_char[Math.floor((e.time - start_time) / (1/16))].push(e.keymap)
    }

    var storage = document.getElementById('storage')
    storage.width = 19
    storage.height = 6
    var ctx = storage.getContext('2d')

    for(var stack of time_frame_char){
      ctx.clearRect(0, 0, storage.width, storage.height)

      for(var f of stack){ // stack all frame up to achive smooth tranaction between different pattern.
        for (var y = 0; y < f.length; y++)
          for (var x = 0; x < f[y].length; x++) {
            var pixel = f[y][x]
            ctx.fillStyle = 'rgba('+pixel[0]+','+pixel[1]+','+pixel[2]+','+(pixel[3]/255)+')'
            ctx.fillRect(x, y, 1, 1)
          }
      }

      var img = ctx.getImageData(0, 0, storage.width, storage.height)
      var output_map = []

      for (var y = 0; y < img.height; y++){
        output_map.push([])
        for (var x = 0; x < img.width; x++) {
          var offset = (y * img.width + x) * 4
          output_map.end().push([img.data[offset], img.data[offset+1], img.data[offset+2], img.data[offset+3]])
        }
      }

      final_frames.push(output_map)
    }
  }

  var blob = new Blob([JSON.stringify({'rendered': final_frames, 'interact': inter_f})], {type: 'application/json'})
  var url = URL.createObjectURL(blob)
  var a = document.createElement('a');
  a.download = 'temp.json'
  a.href = url
  var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  a.dispatchEvent(event);

}


function render(pattern){
  var fps = 16
  var frame_stamp = []
  var frame_pool = []

  var type = pattern.type
  if(type == 'interact')
    if(pattern.frames.length > 1)
      type = 'ani'
    else
      type = 'static'

  switch (type) {
    case 'ani':
      pattern.frames.sort((a, b)=>{ return a.time - b.time})
      for(var f of pattern.frames){
        if(!f.unchange) {
          // frame_pool.push(applyNewFrame(f))
          frame_stamp.push(f)
        }
      }

      var end = frame_stamp.length - 1

      for(var i = 0; i<end; i++){
        var t_s = frame_stamp[i].time, t_e = frame_stamp[i+1].time
        var t_slice = (t_e - t_s) * fps
        console.log('i: '+ i)
        var d = {
          pos_onEditor: {
            x: (frame_stamp[i+1].pos_onEditor.x - frame_stamp[i].pos_onEditor.x) / t_slice,
            y: (frame_stamp[i+1].pos_onEditor.y - frame_stamp[i].pos_onEditor.y) / t_slice,
          },
          scale: {
            x: (frame_stamp[i+1].scale.x - frame_stamp[i].scale.x) / t_slice,
            y: (frame_stamp[i+1].scale.y - frame_stamp[i].scale.y) / t_slice,
          },
          roate: (frame_stamp[i+1].roate - frame_stamp[i].roate) / t_slice,
          rgb: {
            r: (frame_stamp[i+1].rgb.r - frame_stamp[i].rgb.r) / t_slice,
            g: (frame_stamp[i+1].rgb.g - frame_stamp[i].rgb.g) / t_slice,
            b: (frame_stamp[i+1].rgb.b - frame_stamp[i].rgb.b) / t_slice,
            a: (frame_stamp[i+1].rgb.a - frame_stamp[i].rgb.a) / t_slice,
          }
        }
        // console.log('d pos: [' + d.pos_onEditor.x + ',' + d.pos_onEditor.y + ']')
        pattern.gif_render_counter = 0
        for (var j = 0; j < t_slice; j++) {
           var nf = frame_stamp[i].copy()
           nf.pos_onEditor.x += j * d.pos_onEditor.x
           nf.pos_onEditor.y += j * d.pos_onEditor.y
           nf.scale.x += j * d.scale.x
           nf.scale.y += j * d.scale.y
           nf.roate += j * d.roate
           nf.time += j * (1/fps)
           nf.rgb.r += j * d.rgb.r
           nf.rgb.g += j * d.rgb.g
           nf.rgb.b += j * d.rgb.b
           nf.rgb.a += j * d.rgb.a

           console.log(j + 'th pos: [' + nf.pos_onEditor.x + ',' + nf.pos_onEditor.y + ']')
           console.log(j + 'th scale: [' + nf.scale.x + ',' + nf.scale.y + ']')

           var result = applyNewFrame(nf, false);
           if(pattern.gif_content !==  undefined){
              pattern.gif_render_counter++
              pattern.gif_render_counter %= pattern.gif_content.length
            }
           nf.keymap = result.keymap
           nf.pos_onBoard.x = result.pos[0]
           nf.pos_onBoard.y = result.pos[1]
           frame_pool.push({time: nf.time, keymap: nf.keymap})
          //  frame_stamp.push(nf)
        }
      }

      break

    case 'static':
    default:
      if(!pattern.frames[0].unchange) {
        frame_stamp.push(pattern.frames[0])

        if(pattern.gif_content !== undefined){
          pattern.gif_render_counter = 0
          for(var giff of pattern.gif_content){
            // load_pattern_img({width: giff.dims.width, height:giff.dims.height}, giff.patch)

            frame_pool.push({
              time: pattern.frames[0].time + Math.floor((pattern.gif_render_counter * giff.delay * 0.001) / (1/16)) * (1/16),
              keymap: applyNewFrame(pattern.frames[0]).keymap
            })
            pattern.gif_render_counter++
            pattern.gif_render_counter %= pattern.gif_content.length
          }
        }
        else
        frame_pool.push({
          time: pattern.frames[0].time,
          keymap: applyNewFrame(pattern.frames[0]).keymap
        })
      }

  }

  // result.push(frame_pool) // result are debug only variable

  return {full: frame_stamp, keymap_only: frame_pool}
}



$('#btn-save').click(function(){

    packing()
})
