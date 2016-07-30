
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


function resizeCanvas(canvas_dom, dx, dy){
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
}


function resizeByFrame(canvas_dom, frame){
	var ctx = canvas_dom.getContext('2d')
	var storage = document.getElementById('storage')

	storage.width = frame.pattern.ori_img.width
	storage.height = frame.pattern.ori_img.height
  if(frame.pattern.gif_content){
    var gif = frame.pattern.gif_content
    var temp = storage.getContext('2d').createImageData(storage.width, storage.height)
		temp.data.set(gif[frame.pattern.gif_render_counter].patch)
    storage.getContext('2d').putImageData(temp, 0, 0)
  }
  else
    storage.getContext('2d').drawImage(frame.pattern.ori_img, 0, 0)

	ctx.save()
	ctx.clearRect(0, 0, canvas_dom.width, canvas_dom.height)

	canvas_dom.width = storage.width * frame.scale.x
	canvas_dom.height = storage.height * frame.scale.y

	ctx.scale(frame.scale.x, frame.scale.y)
	ctx.drawImage(storage, 0, 0)
	ctx.restore()
}


function rotateCanvas(canvas_dom,	frame){
	var ctx = canvas_dom.getContext('2d')
	var deg = frame.roate
	var storage = document.getElementById('storage')

	storage.width = canvas_dom.width
	storage.height = canvas_dom.height
	storage.getContext('2d').putImageData(ctx.getImageData(0, 0, canvas_dom.width, canvas_dom.height), 0, 0)
	ctx.clearRect(0, 0, canvas_dom.width, canvas_dom.height)

	var L = Math.sqrt(Math.pow(canvas_dom.height, 2) + Math.pow(canvas_dom.width, 2))
	canvas_dom.width = Math.abs(storage.width * Math.cos(Math.PI/180 * (deg))) + Math.abs(storage.height * Math.sin(Math.PI/180 * (deg)))
	canvas_dom.height = Math.abs(storage.width * Math.sin(Math.PI/180 * (deg))) + Math.abs(storage.height * Math.cos(Math.PI/180 * (deg)))
	// canvas_dom.height = Math.abs(L*Math.cos(Math.PI/180*deg))
	ctx.save()

	// ctx.translate(
	// 	canvas_dom.height * Math.cos(Math.PI/180* deg),
	// 	L * Math.sin(Math.acos(canvas_dom.width/L)*180/Math.PI + deg) - canvas_dom.height
	// )
	ctx.translate(canvas_dom.width/2, canvas_dom.height/2)
  ctx.globalAlpha = frame.rgb.a
	ctx.rotate(Math.PI/180 * deg)
	ctx.drawImage(
		storage,
		-canvas_dom.width/2 + (canvas_dom.width-storage.width)/2,
		-canvas_dom.height/2 + (canvas_dom.height-storage.height)/2
	)
	ctx.restore()

	// ctx.fillStyle = 'white'
	// ctx.globalAlpha=0.2;
	// ctx.fillRect(0,0, canvas_dom.width, canvas_dom.height)
	// ctx.globalAlpha=0.2;
}


interact('#pattern')
  .draggable({
    onmove: window.dragMoveListener,
    restrict: {
      restriction: "document",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
		onend: ()=>{apply_overlap_color(false)}
  })
  .resizable({
    preserveAspectRatio: false,
    edges: { left: false, right: false, bottom: false, top: false } // disable resize for now.
  })
  .on('resizemove', function (event) {
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0)

    // update the element's style
    target.style.width  = event.rect.width + 'px'
    target.style.height = event.rect.height + 'px'

    // translate when resizing from top or left edges
    x += event.deltaRect.left
    y += event.deltaRect.top

    // target.style.webkitTransform = target.style.transform =
    //     'translate(' + x + 'px,' + y + 'px)'

    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)

	}).on('resizeend', function (event){
		var target = event.target,
        x = event.dx,
        y = event.dy

		//resize image data in canvas
		var canvas = document.getElementById('pattern')
		resizeCanvas(canvas, x, y)

		least_frame.scale.x = canvas.Width / least_frame.pattern.size.x
		least_frame.scale.y = canvas.Height / least_frame.pattern.size.y
	})


function dragMoveListener (event) {
  var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // translate the element
  // target.style.webkitTransform =
  // target.style.transform =
  //   'translate(' + x + 'px, ' + y + 'px)'
	target.style.left = (x) + 'px'
	target.style.top = (y) + 'px'
  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}


// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener

function apply_overlap_color(notshow) {
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
		keymap[i] = new Array(19)
		for (var j = 0; j < keymap[i].length; j++) {
			keymap[i][j] = new Array(4).fill(0)
		}
	}
	var cc=0
  var pl = 99, pr = -1, pt = 99, pb = -1;
	$('.key').each(function(i, e){ //for test overlap check.
		var sample_per_pixel = 2
		var h = $(this).height(), w = $(this).width()
		var pos = $(this).offset()

		if(pos.left >= x && pos.top >= y && (pos.left + w) <= (x + width) && (pos.top + h) <= (y + height)){
			var temp = ctx.getImageData(pos.left - x, pos.top - y, w, h)
			var colume = $(this).index(), row = $(this).parent('ul').index()
			var polt = []

      pl = colume < pl ? colume : pl;
      pr = colume > pr ? colume : pr;
      pt = row < pt ? row : pt;
      pb = row > pb ? row : pb;

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
      var polt_rgba = max_k.slice(5, -1).split(',')

			keymap[row][colume] = polt_rgba.map((e)=>{return parseFloat(e)}) //[r, g, b, a]
      // console.log('---------------------------------------------------------');
      // console.log(polt_rgba);
      // console.log(keymap[row][colume]);
			cc++
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
	ptn_canvas.height = img.height
	ptn_canvas.width = img.width
	ptn_canvas.style.top = 0 + 'px'
	ptn_canvas.style.left = 0 + 'px'
	if(img_put){
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
	// var dw = Math.abs(cw * Math.cos(Math.PI/180 * (frame.deg))) + Math.abs(ch * Math.sin(Math.PI/180 * (frame.deg))) - canv.width
	// var dh = Math.abs(cw * Math.sin(Math.PI/180 * (frame.deg))) + Math.abs(ch * Math.cos(Math.PI/180 * (frame.deg))) - canv.height

	resizeByFrame(canv, frame)
	rotateCanvas(canv, frame)
	canv.style.top = (frame.pos_onEditor.y - canv.height/2) + 'px'
	canv.style.left = (frame.pos_onEditor.x - canv.width/2) + 'px'

  var result = apply_overlap_color(notshow)
  frame.pos_onBoard.x = result.pos[0]
  frame.pos_onBoard.y = result.pos[1]
 	return result
}


$('document').ready(()=>{
	var canv = document.getElementById('pattern')
 	canv.style.top = 1 + 'px'
	canv.style.left = 1 + 'px'
})


// <init start here>
// load_pattern('http://icons.iconarchive.com/icons/paomedia/small-n-flat/128/sign-check-icon.png')
// $('#button').click(function(e){
//  var canv = document.getElementById('pattern')
// 	canv.style.top = (canv.getBoundingClientRect().top - 100) + 'px'
// 	apply_overlap_color()
// })
