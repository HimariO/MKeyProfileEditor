
var least_frame = undefined

Array.prototype.end = function() {
  if(this.length > 0)
    return this[this.length-1]
  return undefined
}

$(window).keydown(function(e) {
	key = (e.keyCode) ? e.keyCode : e.which
	$('.key.k' + key).addClass('active')
	console.log(key)
})


$(window).keyup(function(e) {
	key = (e.keyCode) ? e.keyCode : e.which
	$('.key.k' + key).removeClass('active')
})



$('.key').click(function(i, e){  //[debug function]
	console.log($(this).position().top + '~' + ($(this).position().top + $(this).height()))
	console.log($(this).position().left + '~' + ($(this).position().left + $(this).width()))
	console.log('-------------------------------------')
})


function resizeCanvas(canvas_dom, dx, dy){ // only used in drag and drop event...which is disable in this branch.
	var ctx = canvas_dom.getContext('2d')
	var storage = document.getElementById('storage')

	storage.width = canvas_dom.width
	storage.height = canvas_dom.height
	storage.getContext('2d').putImageData(ctx.getImageData(0, 0, canvas_dom.width, canvas_dom.height), 0, 0)

	// ori_img.onload = ()=>{
		var ori_h = canvas_dom.height, ori_w = canvas_dom.width
		ctx.clearRect(0, 0, canvas_dom.width, canvas_dom.height)
		console.log(">> "+ canvas_dom.width + ',' + canvas_dom.height + ' , ' + typeof canvas_dom.height)
		canvas_dom.width += dx
		canvas_dom.height += dy

		ctx.scale(canvas_dom.width / ori_w, canvas_dom.height / ori_h)
		ctx.drawImage(storage, 0, 0)
	// }
  console.log('this function should not been invoke.')
}


function resizeByFrame(canvas_dom, frame){
	var ctx = canvas_dom.getContext('2d')
	var storage = document.getElementById('storage')
  var s_ctx = storage.getContext('2d')

	storage.width = frame.pattern.ori_img.width * frame.scale.x
	storage.height = frame.pattern.ori_img.height * frame.scale.y

  var L = Math.sqrt(Math.pow(storage.height, 2) + Math.pow(storage.width, 2))
  var deg = frame.roate
	var rotated_width = Math.abs(storage.width * Math.cos(Math.PI/180 * (deg))) + Math.abs(storage.height * Math.sin(Math.PI/180 * (deg)))
	var rotated_height = Math.abs(storage.width * Math.sin(Math.PI/180 * (deg))) + Math.abs(storage.height * Math.cos(Math.PI/180 * (deg)))

  var d_w = rotated_width - storage.width
  var d_h = rotated_height - storage.height

  storage.width = rotated_width
	storage.height = rotated_height

  s_ctx.save()

  s_ctx.translate(storage.width / 2, storage.height / 2)
  s_ctx.rotate(frame.roate * Math.PI / 180)
  s_ctx.translate(-storage.width / 2, -storage.height / 2)

  s_ctx.translate(d_w / 2, d_h / 2)
  s_ctx.scale(frame.scale.x, frame.scale.y)
  // s_ctx.globalAlpha = frame.rgb.a

  if(frame.pattern.gif_content) {
    var gif = frame.pattern.gif_content
    var temp = s_ctx.createImageData(storage.width, storage.height)
		temp.data.set(gif[frame.pattern.gif_render_counter].patch)

    s_ctx.putImageData(temp, 0, 0)
  }
  else {
    s_ctx.drawImage(frame.pattern.ori_img, 0, 0)
  }

  s_ctx.restore()

	// ctx.save()
	ctx.clearRect(0, 0, canvas_dom.width, canvas_dom.height)
  // ctx.fillStyle = "black"
  // ctx.fillRect(0, 0, canvas_dom.width, canvas_dom.height)

  var new_pos = [
    frame.pos_onEditor.x - storage.width / 2,
    frame.pos_onEditor.y - storage.height / 2
  ]

  console.warn(new_pos);
  console.warn(`${storage.width}, ${storage.height}`);
	ctx.drawImage(storage, new_pos[0], new_pos[1])
}


function dragMoveListener (event) {
  var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

	target.style.left = (x) + 'px'
	target.style.top = (y) + 'px'
  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}


// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener

function apply_overlap_color(frame, notshow) {
	var target = $('#pattern')
	var dom_target = document.getElementById('pattern')
	var ctx = dom_target.getContext('2d')

	var x = target.offset().left
	var y = target.offset().top
	var height = target.height()
	var width = target.width()

  var center_x = -1, center_y = -1;
	var  keymap = new Array(6) // 6*19*[r,g,b,a]
	for (var i = 0; i < keymap.length; i++) {
		keymap[i] = new Array(20)
		for (var j = 0; j < keymap[i].length; j++) {
			keymap[i][j] = new Array(4).fill(0)
		}
	}
	var cc=0
  var pl = 99, pr = -1, pt = 99, pb = -1;
	$('.key').each(function(i, e){ //for test overlap check.
		var sample_per_pixel = 5
		var h = $(this).height(), w = $(this).width()
		var pos = $(this).offset()

		if(pos.left >= x && pos.top >= y && (pos.left + w) <= (x + width) && (pos.top + h) <= (y + height)){
			var temp = ctx.getImageData(pos.left - x, pos.top - y, w, h)
			var colume = $(this).index(), row = $(this).parent('ul').index()
			var polt = []


			for (var i = 0 ;i < temp.height ;i+= sample_per_pixel) {
					for (var j = 0 ;j < temp.width ;j+= sample_per_pixel) {
						var offset = (i * temp.width + j) * 4
						var r = temp.data[offset], g = temp.data[offset+1], b = temp.data[offset+2]
						var a = temp.data[offset+3]
						if((r < 10 && g < 10 && b < 10) || a==0)
              continue

						var polt_key = 'rgba(' + r + ',' + g + ',' + b + ',' + a +')'
						polt[polt_key] = !polt[polt_key] ? 1 : polt[polt_key] + 1
					}
			}

			var max = -1, max_k = ''
			for(var k in polt){
				max_k = polt[k] > max ? k : max_k
				max = polt[k] > max ? polt[k] : max
			}

			if(max == -1 || max_k == ''){
				$(this).css('border-color', '')
				$(this).css('color', '')
				$(this).removeClass('active')
				return
			}
      else{
        pl = colume < pl ? colume : pl;
        pr = colume > pr ? colume : pr;
        pt = row < pt ? row : pt;
        pb = row > pb ? row : pb;
      }
      var polt_rgba = max_k.slice(5, -1).split(',')

			keymap[row][colume] = polt_rgba.map((e)=>{return parseFloat(e)}) //[r, g, b, a]
      //apply alpha
			keymap[row][colume][0] = Math.floor(keymap[row][colume][0] * keymap[row][colume][3] / 255)
			keymap[row][colume][1] = Math.floor(keymap[row][colume][1] * keymap[row][colume][3] / 255)
			keymap[row][colume][2] = Math.floor(keymap[row][colume][2] * keymap[row][colume][3] / 255)
      // console.log('---------------------------------------------------------');
      // console.log(polt_rgba);
      // console.log(keymap[row][colume]);
			cc++
      if(notshow) return
			$(this).addClass('active')
			$(this).css('border-color', max_k)
			$(this).css('color', max_k)
		}
		else{
			if(notshow) return
			$(this).css('border-color', '')
			$(this).css('color', '')
			$(this).removeClass('active')
		}
	})

  center_x = Math.ceil((pl + pr) /2)
  center_y = Math.ceil((pt + pb) /2)
  console.log(`onbord: ${[center_x, center_y]}`);
  console.log(`LR: ${[pl, pr]}`);
  console.log(`TD: ${[pt, pb]}`);
	return {keymap: keymap, pos: [center_x, center_y]}
}


function load_pattern(url, callback, cb_args){
	var img = new Image()

	img.onload = function() {
		load_pattern_img(this)

		if(callback)
			callback(...cb_args)
	}

	img.src = url
	return img
}


function load_pattern_img(img, img_put){
	var ptn_canvas = document.getElementById('pattern')
	var ctx = ptn_canvas.getContext('2d')

	ctx.clearRect(0, 0, ptn_canvas.width, ptn_canvas.height)

	if(img_put){  // if img if getting from getImageData method img obj wont work with drawImage method.
		var temp = ctx.createImageData(img.width, img.height)
		temp.data.set(img_put)
		ctx.putImageData(temp, 0, 0)
	}
	else
		ctx.drawImage(img, 0, 0)
}


function applyNewFrame (frame, notshow){
	var canv = document.getElementById('pattern')

	var cw = (frame.scale.x) * frame.pattern.size.width
	var ch = (frame.scale.y) * frame.pattern.size.height

	resizeByFrame(canv, frame)

  var result = apply_overlap_color(frame, notshow)
  frame.pos_onBoard.x = result.pos[0]
  frame.pos_onBoard.y = result.pos[1]
 	return result
}


$('document').ready(()=>{
	var canv = document.getElementById('pattern')
  var ctx = canv.getContext('2d')
 	canv.width = $('.key-wrapper').width()
	canv.height = $('.key-wrapper').height()
  ctx.width = $('.key-wrapper').width() + 'px'
	ctx.height = $('.key-wrapper').height() + 'px'

})
