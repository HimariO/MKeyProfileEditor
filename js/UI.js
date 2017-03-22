
Array.prototype.end = function() {
  if(this.length > 0)
    return this[this.length-1]
  return undefined
}

var OptionButton = React.createClass({
  getDefaultProps: function() {
    return {
      type: 'static',
      active: false,
      src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/169963/Amex.png',
    }
  },

  getInitialState: function(){
    return {iconClassName: ''}
  },

  handleClick: function(event){
    if(this.props.onClick)
      this.props.onClick(event, this.props.id)
  },

  componentDidMount: function(){
    switch (this.props.type) {
      case 'static':
        this.setState({iconClassName: 'fa fa-paint-brush fa-lg pattern-type'})
        break;

      case 'ani':
        this.setState({iconClassName: 'fa fa-film fa-lg pattern-type'})
        break;

      case 'interact':
        this.setState({iconClassName: 'fa fa-hand-lizard-o fa-lg pattern-type'})
        break
      default:

    }
  },

  render: function() {

    if(this.props.active)
      return (
        <div className="row type-option type-active">
          <p className={this.state.iconClassName}></p>
        </div>
      )
    else
      return (
        <div className="row type-option" onClick={this.handleClick}>
          <p className={this.state.iconClassName}></p>
        </div>
      )
  }
})


var ImageLoader = React.createClass({
  getInitialState: function() {
      return {
        url: '',
        isGIF: false,
      }
  },

  _handleURL: function(event) {
    var URL = window.webkitURL || window.URL
    var url = URL.createObjectURL(event.target.files[0])
    var filename = event.target.files[0].name

    if(filename.substr(filename.length-3) == 'gif'
      || filename.substr(filename.length-3) == 'GIF') {

      this.setState({'url': url, isGIF: true})
      var reader = new FileReader()
      reader.onload = (e)=>{
          this.props.ob_ref.gif_content = new GIF(e.target.result).decompressFrames(true)
          this.props.ob_ref.gif_render_counter = 0;

          var img = new Image()
          img.src = url
          img.onload = ()=>{
            var test = new SuperGif({gif: img})

            test.load(()=>{
              var reprocess_frames = test.frames()
              for (var i = 0; i < reprocess_frames.length; i++) {
                this.props.ob_ref.gif_content[i].patch = reprocess_frames[i].data.data
              }
            })
          }
      }
      reader.readAsArrayBuffer(event.target.files[0])
    }
    else
      this.setState({'url': url})

    least_frame = this.props.ob_ref.frames[0]

    load_pattern(url)
    this.props.ob_ref.setOriImg(url)
  },

  _showPattern: function(event){
    least_frame = this.props.ob_ref.frames[0]
    load_pattern(this.state.url)
  },

  render: function() {
    var style = {display: 'none'}

    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="row">
            <label className="btn btn-info btn-file btn-sm">
              Select File
              <input type="file" className="file_loader" style={style} onChange={this._handleURL}/>
            </label>
            <button className="btn btn-warning btn-sm" onClick={this._showPattern}> Show </button>
          </div>
          <div className="row">
            <img src={this.state.url} className="loader-preview" />
          </div>
        </div>
      </div>
    )
  }
})


var PFrameCardView = React.createClass({
  getDefaultProps: function () {
    return {frame_ref: undefined, id: -1, removeCallBack: undefined}
  },

  getInitialState: function() {
      return {
        url: '',
      }
  },

  _inputOnchange: function(event){
      var data_source = this.props.frame_ref
      var target = event.target
      var t_class = target.className
      t_class = t_class.replace('form-control form-', '');

      if(target.value == '')
        target.value = '0'

      var value = parseFloat(target.value)
      if(value===NaN || value=== undefined)
        return

      if(!least_frame){ //
        least_frame = data_source
      }
      else if(least_frame.pattern.id !== data_source.pattern.id || !least_frame.pattern.id){
        load_pattern(this.state.url)
      }
      console.log('value: '+ value + ',' + target.value)
      least_frame = data_source

      if(value===undefined || value === NaN)
        return

      switch (t_class) {
        case 'T':
        data_source.time = value
          break;

        case 'X':
        data_source.pos_onEditor.x = value
          break;

        case 'Y':
        data_source.pos_onEditor.y = value
          break;

        case 'R':
        data_source.rgb.r = value
          break;

        case 'G':
        data_source.rgb.g = value
          break;

        case 'B':
        data_source.rgb.b = value
          break;

        case 'A':
        data_source.rgb.a = value
          break;

        case 'Scale-Y':
        data_source.scale.y = value
          break

        case 'Scale-X':
        data_source.scale.x = value
          break

        case 'Roate':
        data_source.roate = value
          break

        default:
          return
      }

      data_source.unchange = false
      var temp = applyNewFrame(data_source)
      data_source.keymap = temp.keymap
      data_source.pos_onBoard.x = temp.pos[0]
      data_source.pos_onBoard.y = temp.pos[1] // from index.js
      this.forceUpdate()
  },

  _removeThis: function() {
    this.props.removeCallBack(this.props.frame_ref)
  },

  render: function() {
    var style = {display: 'none'}
    var button_center = {'left': '45%', 'position': 'relative', 'marginTop': '10px'}
    var data = this.props.frame_ref

    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="input-group input-group-sm">
            <span className="input-group-addon">T</span>
            <input type="text" className="form-control form-T" onChange={this._inputOnchange} value={data.time}/>
            <span className="input-group-addon">X</span>
            <input type="text" className="form-control form-X" aria-describedby="basic-addon1" onChange={this._inputOnchange} value={data.pos_onEditor.x}/>
            <span className="input-group-addon">Y</span>
            <input type="text" className="form-control form-Y" aria-describedby="basic-addon1" onChange={this._inputOnchange} value={data.pos_onEditor.y}/>
          </div>

          <div className="input-group input-group-sm">
            <span className="input-group-addon">R</span>
            <input type="text" className="form-control form-R" aria-describedby="basic-addon1" onChange={this._inputOnchange} value={data.rgb.r}/>
            <span className="input-group-addon">G</span>
            <input type="text" className="form-control form-G" aria-describedby="basic-addon1" onChange={this._inputOnchange} value={data.rgb.g}/>
          </div>

          <div className="input-group input-group-sm">
            <span className="input-group-addon">B</span>
            <input type="text" className="form-control form-B" aria-describedby="basic-addon1" onChange={this._inputOnchange} value={data.rgb.b}/>
            <span className="input-group-addon">A</span>
            <input type="text" className="form-control form-A" aria-describedby="basic-addon1" onChange={this._inputOnchange} />
          </div>

          <div className="input-group input-group-sm">
            <span className="input-group-addon">Roate</span>
            <input type="text" className="form-control form-Roate" aria-describedby="basic-addon1" onChange={this._inputOnchange} value={data.roate}/>
          </div>

          <div className="input-group input-group-sm">
            <span className="input-group-addon">Scale-X</span>
            <input type="text" className="form-control form-Scale-X" aria-describedby="basic-addon1" onChange={this._inputOnchange} value={data.scale.x}/>
            <span className="input-group-addon">Scale-Y</span>
            <input type="text" className="form-control form-Scale-Y" aria-describedby="basic-addon1" onChange={this._inputOnchange} value={data.scale.y}/>
          </div>

            <button className="btn btn-default" style={button_center} onClick={this._removeThis}>
              <a className="fa fa-trash" aria-hidden="true"></a>
            </button>

        </div>
      </div>
    )
  }
})


var InteractOption = React.createClass({
  // row of selector in InteractCardView.
  propTypes: {
    label: React.PropTypes.oneOf(['Play On', 'Init-X', 'Init-Y', 'Scale-X', 'Scale-Y', 'Color Tone']),
    data_source: React.PropTypes.object.isRequired,
  },

  getDefaultProps: function() {
    return {
      label: '',
      data_source: undefined,
    }
  },

  getInitialState: function() {
    return {
      options: [],
      selected_op: []
    }
  },

  componentDidMount: function() {
    var set_ops = [], selected = []

    switch(this.props.label){
      case 'Play On':
        set_ops = [
          ['KeyPress', 'NumOfKeyPressed', 'OnOtherEff', 'Start'],
          ['=', '>', '<'],
        ]

      break

      case 'Init-X':
      case 'Init-Y':
        set_ops = [
          ['KeyPress', 'Random', 'Default'],
          ['*', '+'],
        ]
      break

      case 'Scale-X':
      case 'Scale-Y':
        set_ops = [
          ['Default', 'Variable', 'TimeAfterPress'],
          ['*', '+'],
        ]
        // ['Health', 'Armor', 'Ammo'],
      break

      case 'Color Tone':
      set_ops = [
        ['Default', 'Variable', 'Random'],
        [''],
      ]
      break
    }

    for(var ele of set_ops) //get first option from every selector as default.
      selected.push(ele[0])

    this.setState({options: set_ops, selected_op: selected})
  },

  _updateOptions: function(event){
    var select_id = event.target.getAttribute('id')
    var value = event.target.value
    var newState = undefined

    switch(this.props.label){
      case 'Play On':
        if(value == 'OnOtherEff' || value == 'Start') {
          newState = {options: [this.state.options[0], []], selected_op: [value, '']}
        }
        else {
          newState = {
            options: [
              ['KeyPress', 'NumOfKeyPressed', 'OnOtherEff', 'Start'],
              ['=', '>', '<'],
            ],
            selected_op: [value, '']
          }
        }
      break

      case 'Init-X':
      case 'Init-Y':
        if(value == 'KeyPress')
          newState = {
            options: [
              ['KeyPress', 'Random', 'Default'],
              ['*', '+'],
            ],
            selected_op: [value, '']
          }
        else
          newState = {options: [this.state.options[0], []], selected_op: [value, '']}
      break

      case 'Scale-X':
      case 'Scale-Y':
        if(value == 'Default')
          newState = {options: [this.state.options[0], []], selected_op: [value, '']}
        else
          newState = {
            options: [
              ['Default', 'Variable', 'TimeAfterPress'],
              ['*', '+'],
            ],
            selected_op: [value, '']
          }
      break

      case 'Color Tone':
        newState = {selected_op: [value, '']}
      break

      default: // operator's selecter case.
        newState = {selected_op: [this.state.selected_op[0], value]}
    }

    this.setState(newState)

    // update data in source object.
    this.props.data_source[this.props.label].op = value
    this.props.data_source[this.props.label].operator = this.state.selected_op[1]
    console.log('select on change: '+ value + ',' + this.state.selected_op[1]);
  },

  _setOpValue: function(event) {
    var data_ob = this.props.data_source[this.props.label]
    data_ob.value = event.target.value
  },

  render: function() {
    return (
      <div className="input-group input-group">
        <span className="input-group-addon">{this.props.label + '='}</span>

        {
          this.state.options.map((e, i, a)=>{
            var ops = []
            for (var j = 0; j < e.length; j++)
              ops.push(<option value={e[j]} key={j}> {e[j]} </option>)

            return (
              <span className="input-group-btn" key={i+1}>
                <select className="form-control" onChange={this._updateOptions} id={i}>
                    {ops}
                </select>
              </span>
            )
          })
        }

        <input type="text" className="form-control" aria-label="..." onChange={this._setOpValue}/>
      </div>
    )
  }
})


var InteractCardView = React.createClass({
  propTypes: {
    options: React.PropTypes.array.isRequired,
    data_source: React.PropTypes.object.isRequired,
  },

  getDefaultProps: function() {
      return {data_source: undefined,}
  },

  render: function(){
    return (
      <div className="panel panel-default">
        <div className="panel-body">
        {
          this.props.options.map((e, i)=>{
            return <InteractOption key={i} label={e} data_source={this.props.data_source.interact_ops}/>
          })
        }
        </div>
      </div>
    )
  }
})


var EditorPanel = React.createClass({
  getInitialState: function() {
    return {
      option: [
        {id: 0, type: 'static', active: true},
        {id: 1, type: 'ani', active: false},
        {id: 2, type: 'interact', active: false},
      ],
      opt_sec_bg: 'rgb(178, 255, 110)',
      current_type: 'static',
    }
  },

  getDefaultProps: function() {
    return {
      ob_ref: undefined
    }
  },

  _optionClick: function(event, id) {
    for (var op of this.state.option)
      op.active = false
    this.state.option[id].active = true

    switch(this.state.option[id].type){
      case 'interact':
        this.state.opt_sec_bg = 'rgb(255, 61, 84)'
        this.state.current_type = 'interact'
        this.props.ob_ref.type = 'interact'
        break

      case 'ani':
        this.state.opt_sec_bg = 'rgb(62, 87, 254)'
        this.state.current_type = 'ani'
        this.props.ob_ref.type = 'ani'
        break

      case 'static':
      default:
        this.state.opt_sec_bg = 'rgb(178, 255, 110)'
        this.state.current_type = 'static'
        this.props.ob_ref.type = 'static'
        break
    }
    this.setState(this.state)
  },

  _addFrame: function() {
    this.props.ob_ref.frames.push(
      this.props.ob_ref.frames.end().copy()
    )
    this.forceUpdate()
  },

  _removeFrame: function(frame) {
    if(this.props.ob_ref.frames.length > 1) {
      var index = this.props.ob_ref.frames.indexOf(this.props.frame_ref)
      this.props.ob_ref.frames.splice(index, 1)
      this.forceUpdate();
    }
  },

  render: function() {
    var ops_stlye = {
      'backgroundColor': this.state.opt_sec_bg
    }


    var panel_form = []
    var adding_btn = ''
    var fID = this.props.ob_ref.max_frames_id + 2 // plus two for unique component key.

    switch(this.state.current_type){
      case 'static':
        panel_form.push(<ImageLoader key={0} ob_ref={this.props.ob_ref}/>)
        panel_form.push(<PFrameCardView key={1} id={fID} frame_ref={this.props.ob_ref.frames[0]} removeCallBack={this._removeFrame}/>)
        break

      case 'ani':
        adding_btn = (<button type="button" name="button" className="add-frame" onClick={this._addFrame}>{'+'}</button>)
        panel_form.push(<ImageLoader key={0} ob_ref={this.props.ob_ref}/>)

        for(var i of this.props.ob_ref.frames){
          panel_form.push(<PFrameCardView key={fID++} id={fID} frame_ref={i} removeCallBack={this._removeFrame}/>)
        }
        break

      case 'interact':
        var adding_btn = (<button type="button" name="button" className="add-frame" onClick={this._addFrame}>{'+'}</button>)
        var option_f = ['Play On', 'Init-X', 'Init-Y', 'Scale-X', 'Scale-Y']
        var option_s = ['Color Tone']

        panel_form.push(<ImageLoader key={0} ob_ref={this.props.ob_ref}/>)
        panel_form.push(<InteractCardView key={1} data_source={this.props.ob_ref} options={option_f}/>)
        panel_form.push(<InteractCardView key={fID++} data_source={this.props.ob_ref} options={option_s}/>)

        for(var i of this.props.ob_ref.frames){
          panel_form.push(<PFrameCardView key={fID++} id={fID} frame_ref={i} removeCallBack={this._removeFrame}/>)
        }
        break
    }

    return  (
      <div className="row editor-panel">
        <figure className="col-md-1 type-options" style={ops_stlye}>
          {
            this.state.option.map((opt)=>{
              return (
                <OptionButton
                  active={opt.active}
                  type={opt.type}
                  key={opt.id + 1}
                  id={opt.id}
                  onClick={this._optionClick}
                  />)
            })
          }
        </figure>
        <figure className="col-md-11 time-line">
          {adding_btn}
          <div className="table-wrapper">
            <div className="table">
              {panel_form}
            </div>
          </div>
        </figure>
      </div>
    )
  },

})


var EditorPanelContainer = React.createClass({
  _addPattern: function() {
    this.props.data.push(new Pattern(this.props.data.length + 1))
    this.forceUpdate()
  },

  componentDidUpdate: function() {
    $(".table-wrapper").mousewheel(function(event, delta) {
       this.scrollLeft -= (delta * 30);
       event.preventDefault();
    });
  },

  render: function() {
    return  (
      <div>
      {
        this.props.data.map((i)=>{
          return <EditorPanel key={i.id} ob_ref={i}/>
        })
      }
      <button type="button" name="button" className="add-pattern" onClick={this._addPattern}>{'+'}</button>
      </div>
    )
  },
})


ReactDOM.render(<EditorPanelContainer data={t}/>, document.getElementById('editor-zone'))

$(".table-wrapper").mousewheel(function(event, delta) {
   this.scrollLeft -= (delta * 30);
   event.preventDefault();
});
